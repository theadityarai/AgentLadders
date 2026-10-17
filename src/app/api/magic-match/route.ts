import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { findMatchingPropertiesForLead } from '@/lib/match-engine';
import { formatINR } from '@/lib/formatters';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const sessionUser = session.user as any;
  const user = db.users.find(u => u.id === sessionUser.id || (sessionUser.email && u.email?.toLowerCase() === sessionUser.email.toLowerCase()));
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const agencyId = user.agencyId;

  const agencyLeads = (db.leads || []).filter(l => 
    l.agencyId === agencyId && 
    !['Deal Closed', 'Won', 'Lost', 'Dead'].includes(l.status)
  );

  const agencyProps = (db.properties || []).filter(p => 
    p.agencyId === agencyId && 
    (p.status === 'Available' || p.status === 'Under Offer')
  );

  const allMatches: Array<{
    leadId: string;
    leadName: string;
    leadPhone: string;
    leadBudget: string;
    propertyId: string;
    propertyTitle: string;
    propertyPrice: string;
    propertyLocation: string;
    propertyBhk: string;
    matchScore: number;
    matchReasons: string[];
  }> = [];

  for (let i = 0; i < Math.min(agencyLeads.length, 20); i++) {
    const lead = agencyLeads[i];
    const matches = findMatchingPropertiesForLead(lead, agencyProps);
    if (matches.length > 0) {
      const topMatch = matches[0];
      allMatches.push({
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone,
        leadBudget: lead.budgetMax ? formatINR(lead.budgetMax) : 'Flexible',
        propertyId: topMatch.propertyId,
        propertyTitle: topMatch.propertyTitle,
        propertyPrice: topMatch.priceFormatted,
        propertyLocation: topMatch.locality,
        propertyBhk: topMatch.bhk,
        matchScore: topMatch.matchScore,
        matchReasons: topMatch.matchReasons
      });
    }
  }

  // Sort by highest match score
  allMatches.sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json(
    { matches: allMatches.slice(0, 5) },
    {
      headers: {
        'Cache-Control': 'private, no-cache, no-transform'
      }
    }
  );
}

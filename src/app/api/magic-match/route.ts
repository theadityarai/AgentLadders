import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getDb } from '@/lib/db';
import { findMatchingPropertiesForLead } from '@/lib/match-engine';
import { formatINR } from '@/lib/formatters';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agencyId = (session.user as any).agencyId || 'ag_vance_01';
  const db = getDb();

  const agencyLeads = (db.leads || []).filter(l => 
    (!l.agencyId || l.agencyId === agencyId) && 
    !['Deal Closed', 'Won', 'Lost', 'Dead'].includes(l.status)
  );

  const agencyProps = (db.properties || []).filter(p => 
    (!p.agencyId || p.agencyId === agencyId) && 
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

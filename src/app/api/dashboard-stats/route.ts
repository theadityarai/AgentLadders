import { NextResponse } from 'next/server';
import { getDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { formatINR } from '@/lib/formatters';
import { findMatchingPropertiesForLead } from '@/lib/match-engine';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const agencyId = user.agencyId;

  // Generate dummy data if the agency has no data yet
  if ((db.properties || []).filter(p => p.agencyId === agencyId).length === 0) {
    generateDummyDataForAgency(agencyId, db);
  }

  const properties = (db.properties || []).filter(p => p.agencyId === agencyId);
  const leads = (db.leads || []).filter(l => l.agencyId === agencyId);
  const deals = (db.deals || []).filter(d => d.agencyId === agencyId);
  const siteVisits = (db.siteVisits || []).filter(s => s.agencyId === agencyId);

  // 1. Total Inventory Valuation (sum of property prices)
  const totalInventoryNum = properties.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  const totalInventoryFormatted = formatINR(totalInventoryNum);

  // 2. Brokerage Pipeline (sum of commissions or 2% of deal amount)
  const brokeragePipelineNum = deals
    .filter(d => d.stage !== 'Closed Lost')
    .reduce((acc, d) => {
      const comm = d.totalCommission || d.commissionAmount || (Number(d.amount) * 0.02) || 0;
      return acc + comm;
    }, 0);
  const brokeragePipelineFormatted = formatINR(brokeragePipelineNum);

  // 3. Today's Site Visits
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = siteVisits.filter(v => v.date === todayStr);

  // 4. Hot Ready Buyers
  const hotLeads = leads.filter(l => 
    (l.priority && l.priority.toLowerCase().includes('hot')) || 
    (l.status && (l.status.toLowerCase().includes('hot') || l.status.toLowerCase().includes('qualified') || l.status.toLowerCase().includes('visit')))
  );

  // 5. Today's Follow-up Queue
  const todayFollowUps = leads.filter(l => 
    l.nextFollowUp === todayStr || (l.status && l.status.toLowerCase().includes('follow'))
  );

  // 6. Live Auto-Matches ("Kundali Match Engine")
  const matchesSummary: Array<{
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

  for (const lead of leads) {
    const matchedProps = findMatchingPropertiesForLead(lead as any, properties as any);
    if (matchedProps.length > 0) {
      const topMatch = matchedProps[0];
      matchesSummary.push({
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone,
        leadBudget: lead.budgetMax ? formatINR(Number(lead.budgetMax)) : (lead.budget as string || '₹1.50 Cr - ₹3 Cr'),
        propertyId: topMatch.propertyId,
        propertyTitle: topMatch.propertyTitle,
        propertyPrice: topMatch.priceFormatted,
        propertyLocation: `${topMatch.locality}, ${topMatch.city}`,
        propertyBhk: topMatch.bhk,
        matchScore: topMatch.matchScore,
        matchReasons: topMatch.matchReasons
      });
    }
  }

  // Monthly Revenue Chart projection (in INR Lakhs)
  const chartData = [
    { name: 'May', revenue: 15.5, leads: 18 },
    { name: 'Jun', revenue: 22.0, leads: 26 },
    { name: 'Jul', revenue: 18.5, leads: 31 },
    { name: 'Aug', revenue: 34.0, leads: 42 },
    { name: 'Sep', revenue: Math.round(brokeragePipelineNum / 100000) || 57.5, leads: leads.length * 6 || 38 }
  ];

  return NextResponse.json({
    stats: {
      totalInventoryValue: totalInventoryFormatted,
      totalInventoryRaw: totalInventoryNum,
      brokeragePipeline: brokeragePipelineFormatted,
      brokeragePipelineRaw: brokeragePipelineNum,
      activeProperties: properties.length.toString(),
      readyBuyers: leads.length.toString(),
      hotBuyersCount: hotLeads.length.toString(),
      todayVisitsCount: todayVisits.length.toString(),
      activeDealsCount: deals.filter(d => d.stage !== 'Closed Lost').length.toString()
    },
    todayVisits,
    todayFollowUps,
    kundaliMatches: matchesSummary.slice(0, 6),
    chartData
  });
}


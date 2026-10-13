'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CompassIcon,
  PlayIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CopyIcon,
  SparklesIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  PhoneIcon,
  WhatsAppIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  ReceiptIcon,
  CheckSquareIcon,
  InfoIcon,
  ChevronRightIcon
} from '@/components/icons/NavIcons';
import { Toast } from '@/components/ui/Toast';

// ─── Flowchart Stage Definitions ─────────────────────────────────────────────
interface FlowStage {
  id: number;
  stageName: string;
  tagline: string;
  duration: string;
  color: string;
  accentBg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  crmScreenName: string;
  crmHref: string;
  objective: string;
  actionItems: string[];
  hinglishScript: string;
  englishScript: string;
  proTips: string[];
  mistakesToAvoid: string[];
}

const FLOW_STAGES: FlowStage[] = [
  {
    id: 1,
    stageName: 'Stage 1: Lead Ingestion & Qualification',
    tagline: 'Capture buyer requirements within 5 minutes',
    duration: 'Day 1 • 0 - 30 mins',
    color: '#059669',
    accentBg: '#ecfdf5',
    icon: PhoneIcon,
    crmScreenName: 'Buyer Inquiries',
    crmHref: '/dashboard/leads',
    objective: 'Filter out casual window shoppers and identify serious buyers with pre-approved budget, preferred BHK, and target possession date.',
    actionItems: [
      'Call lead within 5 minutes of inquiry submission',
      'Confirm exact budget range (e.g. ₹80L - ₹1.2 Cr)',
      'Record specific locality preference (e.g. Whitefield, Indiranagar)',
      'Ask whether purchase is self-use or investment',
      'Tag inquiry as "Hot", "Warm", or "Investor" in CRM'
    ],
    hinglishScript: 'Namaste Sir! Maine dekha aap Whitefield mein 3 BHK property search kar rahe hain. Mere paas 2 verified ready-to-move options hain builder discount ke saath. Kya main WhatsApp par brochures share kar sakta hoon?',
    englishScript: 'Hello Sir! I noticed your inquiry for a 3 BHK in Whitefield. I have 2 verified ready-to-move options matching your budget with special broker inventory. May I share the walkthrough details on your WhatsApp?',
    proTips: [
      'Calling within 5 minutes results in 800% higher qualification rate compared to calling after 2 hours.',
      'Always ask if their home loan is already pre-approved or if they need loan assistance.'
    ],
    mistakesToAvoid: [
      'Never send raw price lists without speaking to the client first.',
      'Do not bombard the client with 10 different listings—shortlist max 2 or 3.'
    ]
  },
  {
    id: 2,
    stageName: 'Stage 2: AI Magic Match & WhatsApp Pitch',
    tagline: 'Pair requirements with verified inventory & pitch',
    duration: 'Day 1 - 2',
    color: '#2563eb',
    accentBg: '#eff6ff',
    icon: SparklesIcon,
    crmScreenName: 'Properties & Match Engine',
    crmHref: '/dashboard/properties',
    objective: 'Generate a high-converting, professional WhatsApp presentation with clean pricing, carpet area, and photo links.',
    actionItems: [
      'Open CRM Magic Match on the buyer card',
      'Review matching inventory sorted by budget compatibility',
      'Click "WhatsApp Pitch" to generate the customized brochure text',
      'Send WhatsApp message and follow up within 3 hours for feedback',
      'Note down client reactions to amenities, floor level, and price'
    ],
    hinglishScript: 'Sir, aapke budget aur location ke mutabiq yeh 2 best shortlisted properties hain. Photos aur carpet area details attached hain. Ek baar dekh lijiye, kal evening 4 baje physical visit schedule karein?',
    englishScript: 'Sir, based on your exact budget and locality preferences, here are the top 2 curated properties with verified clear titles. Please take a look at the attached brochure. Would tomorrow at 4 PM work for a site visit?',
    proTips: [
      'Keep your WhatsApp pitch concise: mention Carpet Area, Floor Number, Car Parking, and Total All-Inclusive Price.',
      'End every message with an appointment question ("Kal 3 PM ya 5 PM?") rather than an open-ended "What do you think?".'
    ],
    mistakesToAvoid: [
      'Never send uncompressed 50MB files that clog the client phone.',
      'Avoid disclosing the owner contact number or flat number before visit scheduling.'
    ]
  },
  {
    id: 3,
    stageName: 'Stage 3: Site Visit Coordination',
    tagline: 'Physical property inspection & client experience',
    duration: 'Day 2 - 4',
    color: '#7c3aed',
    accentBg: '#f5f3ff',
    icon: MapPinIcon,
    crmScreenName: 'Site Visits Scheduler',
    crmHref: '/dashboard/site-visits',
    objective: 'Conduct a seamless property viewing, showcase natural lighting/amenities, and protect brokerage with an inspection record.',
    actionItems: [
      'Book the visit in CRM Site Visits with date, time, and client phone',
      'Send Google Maps location pin & caretaker contact via WhatsApp',
      'Arrive 15 minutes prior to ensure keys and access are ready',
      'Highlight top 3 USPs during walk-through (Ventilation, Club House, Metro connectivity)',
      'Log client feedback directly in CRM right after the visit'
    ],
    hinglishScript: 'Sir, main site par pahunch chuka hoon. Keys ready hain aur flat properly open hai. Aap jab gate par pahunchenge mujhe call kar lijiye, security guard ko maine inform kar diya hai.',
    englishScript: 'Hello Sir, I have arrived at the premises and keys are organized. Security has been notified for smooth entry. Please ring me as you reach the main gate so I can escort you up.',
    proTips: [
      'Show maximum 2 or 3 properties in one visit session. Over-touring leads to decision fatigue.',
      'Always have the client sign or WhatsApp-confirm the Property Inspection acknowledgment to safeguard your 1-2% brokerage.'
    ],
    mistakesToAvoid: [
      'Never let the buyer negotiate directly with the owner on the site visit without you mediating.',
      'Do not show an uncleaned or dark property—always turn on all lights beforehand.'
    ]
  },
  {
    id: 4,
    stageName: 'Stage 4: Negotiation & Price Locking',
    tagline: 'Bridge buyer offer with seller expectation',
    duration: 'Day 4 - 7',
    color: '#ea580c',
    accentBg: '#fff7ed',
    icon: BriefcaseIcon,
    crmScreenName: 'Deals Pipeline (Negotiation)',
    crmHref: '/dashboard/deals',
    objective: 'Structure commercial terms, payment milestones, furniture inclusions, and loan disbursement schedule.',
    actionItems: [
      'Move deal to "Negotiation" stage in CRM Deals',
      'Obtain formal verbal or written offer from buyer with token commitment',
      'Engage seller with proof of buyer financial readiness',
      'Agree on final all-inclusive price (including maintenance and parking)',
      'Confirm expected possession and registry timeline'
    ],
    hinglishScript: 'Sir, owner 1.25 Cr par firm the, lekin aapke genuine profile aur immediate token payment ki wajah se maine unhe 1.18 Cr all-inclusive par agree karwa liya hai. Kal token cheque ke saath deal freeze karein?',
    englishScript: 'Sir, the seller was initially adamant at 1.25 Cr, but given your immediate token readiness and pre-approved loan, I have managed to close the gap at 1.18 Cr all-inclusive. Shall we lock this in tomorrow with token advance?',
    proTips: [
      'Anchor the discussion around total landed cost (Base + GST + Stamp Duty + Registry + Car Parking) so there are no last-minute surprises.',
      'Always ask the buyer: "If seller agrees to this price today, are you ready to hand over the token cheque?"'
    ],
    mistakesToAvoid: [
      'Never convey a price drop to the buyer without having the seller written consent.',
      'Do not delay the token closing—unfrozen deals get poached by competing brokers.'
    ]
  },
  {
    id: 5,
    stageName: 'Stage 5: Token Advance & Legal Due Diligence',
    tagline: 'Bayana earnest money & title deed verification',
    duration: 'Day 7 - 14',
    color: '#b45309',
    accentBg: '#fffbeb',
    icon: CheckSquareIcon,
    crmScreenName: 'Deals & Documents',
    crmHref: '/dashboard/deals',
    objective: 'Secure earnest money deposit (Bayana), issue formal Token Receipt, and coordinate title deeds / encumbrance certificate (EC) check.',
    actionItems: [
      'Collect Token / Earnest Money cheque (typically ₹1L - ₹5L)',
      'Issue an official AgentLadders Token Advance Receipt immediately',
      'Move deal to "Token Advance" stage in CRM',
      'Assist buyer lawyer with mother deed, EC (30 years), RERA registration, and Khata',
      'Draft the Agreement to Sell (ATS) with explicit brokerage clauses'
    ],
    hinglishScript: 'Sir, aapka Token Advance Cheque receive ho gaya hai aur receipt system mein upload kar di gayi hai. Title deeds legal verification ke liye advocate ko bhej di hain. 7 din mein ATS execute karenge.',
    englishScript: 'Sir, your Token Advance Cheque has been securely received and the official receipt is generated. Legal title documents have been forwarded for due diligence. We will execute the Sale Agreement within 7 business days.',
    proTips: [
      'Always clearly specify the refundability terms of the token advance in the written receipt.',
      'Ensure the buyer loan sanction letter is submitted before signing the Agreement to Sell.'
    ],
    mistakesToAvoid: [
      'Never accept cash token without immediate physical receipt and acknowledgment.',
      'Never skip the Encumbrance Certificate (EC) check, especially for resale properties.'
    ]
  },
  {
    id: 6,
    stageName: 'Stage 6: Registry, Brokerage Invoice & Payout',
    tagline: 'Sub-Registrar deed signing & commission payout',
    duration: 'Day 15 - 30',
    color: '#047857',
    accentBg: '#ecfdf5',
    icon: ReceiptIcon,
    crmScreenName: 'Invoices & Reports',
    crmHref: '/dashboard/invoices',
    objective: 'Complete final sale deed registration at the Sub-Registrar office and generate GST brokerage commission invoice for immediate collection.',
    actionItems: [
      'Coordinate stamp duty stamp paper generation & Sub-Registrar appointment slot',
      'Accompany buyer and seller to the registry office for thumbprint & witness signing',
      'Mark deal as "Deal Closed 🎉" in CRM Deals',
      'Generate 1-Click GST Brokerage Invoice in AgentLadders Invoices',
      'Collect brokerage payment (standard 1% or 2%) and log receipt in CRM Payments'
    ],
    hinglishScript: 'Sir, Congratulations on your new dream home registry! 🏡 Registry process successfully complete ho gaya hai. Aapki official brokerage invoice WhatsApp aur email par bhej di hai. Kindly release the payment via NEFT/UPI.',
    englishScript: 'Heartiest congratulations on your new home registry! 🏡 The ownership documents have been successfully executed at the Sub-Registrar. Please find your official brokerage invoice attached for settlement.',
    proTips: [
      'Collect 50% of your brokerage at the Agreement to Sell stage and remaining 50% at final registry.',
      'Ask the delighted buyer for a 5-star Google Review and 2 friend referrals on the registry day when excitement is highest!'
    ],
    mistakesToAvoid: [
      'Do not leave the Sub-Registrar premises without confirming your payment timeline.',
      'Never issue a handwritten scrap paper for brokerage—always issue a GST invoice from AgentLadders.'
    ]
  }
];

// ─── Deal Simulation Interactive Scenarios ───────────────────────────────────
interface SimScenario {
  id: number;
  customerName: string;
  situation: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const SIMULATION_SCENARIOS: SimScenario[] = [
  {
    id: 1,
    customerName: 'Rohit Verma (IT Director)',
    situation: 'A new lead arrives from 99acres requesting a 3 BHK in Marathahalli with a budget of ₹1.35 Cr. The inquiry was submitted 3 minutes ago.',
    question: 'What is your best first move?',
    options: [
      {
        text: 'Call Rohit immediately, qualify his timeline, and send 2 matched properties via WhatsApp',
        isCorrect: true,
        explanation: 'Excellent! Calling within 5 minutes yields an 8x higher qualification rate and establishes immediate professional trust.'
      },
      {
        text: 'Wait until Saturday morning so he is free from office work',
        isCorrect: false,
        explanation: 'Too slow! By Saturday, 3 other competing brokers will have contacted him and booked site visits.'
      },
      {
        text: 'Email him a full PDF catalog of all 25 properties in East Bangalore',
        isCorrect: false,
        explanation: 'Too overwhelming! Buyers get analysis paralysis when sent catalogs without personal consultation.'
      }
    ]
  },
  {
    id: 2,
    customerName: 'Ananya & Siddharth',
    situation: 'During the site visit, the couple loves a 2.5 BHK apartment. They tell you: "We love it, but the owner quoted ₹95 Lakhs. If you get it for ₹87 Lakhs, we will give token today."',
    question: 'How do you handle this negotiation?',
    options: [
      {
        text: 'Say "Yes done! I will force the owner to sell at 87 Lakhs"',
        isCorrect: false,
        explanation: 'Never commit owner money without their agreement. If the owner rejects, you lose credibility with the buyer.'
      },
      {
        text: 'Tell them "Owner will never sell at 87 Lakhs, take it or leave it"',
        isCorrect: false,
        explanation: 'Too aggressive! You might kill a hot deal that could easily close at ₹90 Lakhs with tactful mediation.'
      },
      {
        text: 'Propose ₹89-90 Lakhs, collect an expression of interest with token readiness, and negotiate with the owner backed by an actual buyer commitment',
        isCorrect: true,
        explanation: 'Masterful! Sellers negotiate seriously when you present a ready buyer with cheque in hand.'
      }
    ]
  },
  {
    id: 3,
    customerName: 'Kishore Reddy (Investor)',
    situation: 'The deal is agreed at ₹1.6 Cr. The buyer wants to transfer ₹2 Lakhs earnest money (token advance) directly to the owner via UPI.',
    question: 'What crucial document must you generate immediately in AgentLadders?',
    options: [
      {
        text: 'Generate and sign an official Token Advance Receipt & update CRM deal stage',
        isCorrect: true,
        explanation: 'Spot on! The Token Receipt legally formalizes the transaction, records commercial terms, and protects your brokerage claim.'
      },
      {
        text: 'No document needed until the final sale deed registry after 3 months',
        isCorrect: false,
        explanation: 'High risk! Without a token agreement or receipt, either party can back out without penalty, ruining weeks of work.'
      },
      {
        text: 'Send a voice note on WhatsApp saying "Paise mil gaye"',
        isCorrect: false,
        explanation: 'Unprofessional. Real estate transactions require verifiable receipts with transaction IDs and signatures.'
      }
    ]
  }
];

export default function TutorialPage() {
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'flowchart' | 'simulator' | 'scripts' | 'rules'>('flowchart');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulator State
  const [simStep, setSimStep] = useState<number>(0);
  const [simSelectedOption, setSimSelectedOption] = useState<number | null>(null);
  const [simScore, setSimScore] = useState<number>(0);
  const [simAnswered, setSimAnswered] = useState<boolean>(false);

  // Checklists check state (persisted locally)
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const handleToggleAction = (stageId: number, actionIdx: number) => {
    const key = `${stageId}_${actionIdx}`;
    setCompletedActions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setToastMessage(`Copied ${label} to clipboard! 📋`);
    }
  };

  const launchLiveTour = () => {
    window.dispatchEvent(new CustomEvent('open-on-screen-tutorial', { detail: { step: 0 } }));
  };

  const selectedStage = FLOW_STAGES.find(s => s.id === selectedStageId) || FLOW_STAGES[0];
  const currentSim = SIMULATION_SCENARIOS[simStep];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 100 }}>
      {toastMessage && (
        <Toast
          toast={{ id: 'sim-toast', type: 'success', message: toastMessage }}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          HEADER BANNER
      ───────────────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)',
        borderRadius: 24,
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.35)'
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 180, width: 140, height: 140, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#34d399',
              marginBottom: 12
            }}>
              <CompassIcon size={14} color="#34d399" />
              <span>Agent Success Playbook & Workflow Blueprint</span>
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px', color: '#ffffff' }}>
              How Real Estate Deals Close in AgentLadders 🏆
            </h1>

            <p style={{ fontSize: 15.5, color: '#cbd5e1', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
              A step-by-step master flowchart from the moment a buyer inquires on 99acres or WhatsApp to receiving 1-2% brokerage commission in your bank account.
            </p>
          </div>

          {/* Quick Triggers */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={launchLiveTour}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '13px 22px',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <PlayIcon size={16} color="#ffffff" />
              <span>Launch On-Screen Tour</span>
            </button>

            <Link
              href="/dashboard"
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 14,
                padding: '13px 20px',
                fontSize: 14.5,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>Back to Today</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          NAVIGATION TABS
      ───────────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '2px solid #e2e8f0',
        marginBottom: 28,
        paddingBottom: 2,
        overflowX: 'auto'
      }}>
        {[
          { id: 'flowchart', label: '1. Master Deal Flowchart 🗺️', desc: 'Visual 6-stage lifecycle' },
          { id: 'simulator', label: '2. Deal Simulator Game 🎮', desc: 'Practice closing a mock lead' },
          { id: 'scripts', label: '3. WhatsApp Script Vault 💬', desc: 'Ready copy-paste scripts' },
          { id: 'rules', label: '4. Broker Golden Rules ⚡', desc: 'The 4 rules of top earners' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid #059669' : '3px solid transparent',
              color: activeTab === tab.id ? '#059669' : '#64748b',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: 14.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 1: MASTER DEAL FLOWCHART
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'flowchart' && (
        <div>
          {/* Visual Step Cards / Horizontal Flow Diagram */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 28
          }}>
            {FLOW_STAGES.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isSelected = stage.id === selectedStageId;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  style={{
                    backgroundColor: isSelected ? stage.accentBg : '#ffffff',
                    border: isSelected ? `2.5px solid ${stage.color}` : '1.5px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 8px 20px -4px ${stage.color}25` : '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                >
                  {/* Step Number Tag */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: isSelected ? stage.color : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                      padding: '2px 8px',
                      borderRadius: 10
                    }}>
                      Step {stage.id}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{stage.duration}</span>
                  </div>

                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: `${stage.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <StageIcon size={17} color={stage.color} />
                    </div>
                    <span style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: isSelected ? stage.color : '#0f172a',
                      lineHeight: 1.3
                    }}>
                      {stage.stageName.split(':')[1]}
                    </span>
                  </div>

                  <p style={{
                    fontSize: 11.5,
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    {stage.tagline}
                  </p>

                  {idx < FLOW_STAGES.length - 1 && (
                    <div style={{
                      display: 'none', // Shown on large screens via CSS
                      position: 'absolute',
                      right: -10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2
                    }}>
                      <ChevronRightIcon size={14} color="#94a3b8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Stage Deep-Dive Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            border: `2px solid ${selectedStage.color}35`,
            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            {/* Stage Title Bar */}
            <div style={{
              backgroundColor: selectedStage.accentBg,
              padding: '24px 32px',
              borderBottom: `1px solid ${selectedStage.color}25`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 800,
                    backgroundColor: selectedStage.color,
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: 12
                  }}>
                    {selectedStage.duration}
                  </span>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    Core CRM Screen: <strong>{selectedStage.crmScreenName}</strong>
                  </span>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  {selectedStage.stageName}
                </h2>
                <p style={{ fontSize: 14.5, color: '#475569', margin: 0, fontWeight: 500 }}>
                  🎯 <strong>Primary Goal:</strong> {selectedStage.objective}
                </p>
              </div>

              {/* Direct Jump Button to that CRM Module */}
              <Link
                href={selectedStage.crmHref}
                style={{
                  textDecoration: 'none',
                  backgroundColor: selectedStage.color,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 22px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: `0 4px 14px ${selectedStage.color}40`
                }}
              >
                <span>Open {selectedStage.crmScreenName}</span>
                <ChevronRightIcon size={14} color="#ffffff" />
              </Link>
            </div>

            {/* Stage Body Grid */}
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
              
              {/* Left Column: Interactive Action Checklist */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckSquareIcon size={18} color={selectedStage.color} />
                    Required Step Checklist
                  </h3>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    Tap to mark done
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedStage.actionItems.map((action, idx) => {
                    const isChecked = !!completedActions[`${selectedStage.id}_${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleAction(selectedStage.id, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 12,
                          backgroundColor: isChecked ? '#f0fdf4' : '#f8fafc',
                          border: isChecked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          backgroundColor: isChecked ? '#16a34a' : '#ffffff',
                          border: isChecked ? 'none' : '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2
                        }}>
                          {isChecked && <CheckCircleIcon size={14} color="#ffffff" />}
                        </div>
                        <span style={{
                          fontSize: 13.5,
                          color: isChecked ? '#166534' : '#1e293b',
                          fontWeight: isChecked ? 600 : 500,
                          textDecoration: isChecked ? 'line-through' : 'none',
                          lineHeight: 1.5
                        }}>
                          {action}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pro Tips Box */}
                <div style={{ marginTop: 24, backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: 14, padding: '16px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#854d0e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💡</span> Pro Broker Secrets:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#713f12', lineHeight: 1.6 }}>
                    {selectedStage.proTips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: High-Converting Scripts & Mistakes to Avoid */}
              <div>
                {/* Script Box (Hinglish + English) */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '20px',
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💬</span> WhatsApp Pitch Script (Hinglish)
                    </div>
                    <button
                      onClick={() => handleCopy(selectedStage.hinglishScript, 'Hinglish Script')}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <CopyIcon size={12} color="#0f172a" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <p style={{
                    fontSize: 13,
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    margin: '0 0 16px',
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}>
                    &quot;{selectedStage.hinglishScript}&quot;
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🌐</span> Professional English Pitch Script
                    </div>
                    <button
                      onClick={() => handleCopy(selectedStage.englishScript, 'English Script')}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <CopyIcon size={12} color="#0f172a" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <p style={{
                    fontSize: 13,
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    margin: 0,
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}>
                    &quot;{selectedStage.englishScript}&quot;
                  </p>
                </div>

                {/* Common Pitfalls Box */}
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 14, padding: '16px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#991b1b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠️</span> Costly Mistakes to Avoid:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#b91c1c', lineHeight: 1.6 }}>
                    {selectedStage.mistakesToAvoid.map((mistake, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 2: DEAL SIMULATOR GAME
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'simulator' && (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 8px 30px -4px rgba(0,0,0,0.06)',
            padding: '36px',
            position: 'relative'
          }}>
            {/* Header / Score Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 20 }}>
                  Scenario {simStep + 1} of {SIMULATION_SCENARIOS.length}
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0' }}>
                  Deal Simulator: {currentSim.customerName}
                </h3>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '8px 16px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Score: {simScore} pts</span>
              </div>
            </div>

            {/* Situation Context Box */}
            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: 16,
              padding: '18px 20px',
              marginBottom: 24,
              borderLeft: '5px solid #2563eb'
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Situation Brief
              </div>
              <p style={{ fontSize: 15, color: '#1e293b', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                {currentSim.situation}
              </p>
            </div>

            {/* Question */}
            <h4 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              ❓ {currentSim.question}
            </h4>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {currentSim.options.map((opt, idx) => {
                const isSelected = simSelectedOption === idx;
                let bg = '#ffffff';
                let borderColor = '#e2e8f0';

                if (simAnswered) {
                  if (opt.isCorrect) {
                    bg = '#ecfdf5';
                    borderColor = '#10b981';
                  } else if (isSelected && !opt.isCorrect) {
                    bg = '#fef2f2';
                    borderColor = '#ef4444';
                  }
                } else if (isSelected) {
                  bg = '#eff6ff';
                  borderColor = '#3b82f6';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!simAnswered) {
                        setSimSelectedOption(idx);
                      }
                    }}
                    style={{
                      backgroundColor: bg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 14,
                      padding: '16px 20px',
                      cursor: simAnswered ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        backgroundColor: isSelected ? (simAnswered ? (opt.isCorrect ? '#10b981' : '#ef4444') : '#3b82f6') : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>
                        {opt.text}
                      </span>
                    </div>

                    {/* Feedback explanation after submit */}
                    {simAnswered && (opt.isCorrect || isSelected) && (
                      <div style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        fontSize: 13,
                        color: opt.isCorrect ? '#065f46' : '#991b1b',
                        lineHeight: 1.5,
                        fontWeight: 500
                      }}>
                        <strong>{opt.isCorrect ? '✅ Why this works:' : '❌ Why this hurts:'}</strong> {opt.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setSimStep(0);
                  setSimSelectedOption(null);
                  setSimAnswered(false);
                  setSimScore(0);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RotateCcwIcon size={14} color="#64748b" />
                <span>Restart Game</span>
              </button>

              {!simAnswered ? (
                <button
                  disabled={simSelectedOption === null}
                  onClick={() => {
                    if (simSelectedOption !== null) {
                      setSimAnswered(true);
                      if (currentSim.options[simSelectedOption].isCorrect) {
                        setSimScore(prev => prev + 100);
                      }
                    }
                  }}
                  style={{
                    backgroundColor: simSelectedOption !== null ? '#059669' : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 28px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: simSelectedOption !== null ? 'pointer' : 'not-allowed',
                    boxShadow: simSelectedOption !== null ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none'
                  }}
                >
                  Confirm Choice
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (simStep < SIMULATION_SCENARIOS.length - 1) {
                      setSimStep(prev => prev + 1);
                      setSimSelectedOption(null);
                      setSimAnswered(false);
                    } else {
                      setToastMessage(`Simulator Complete! You scored ${simScore + (currentSim.options[simSelectedOption!].isCorrect ? 0 : 0)} points! 🏆`);
                    }
                  }}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 28px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <span>{simStep < SIMULATION_SCENARIOS.length - 1 ? 'Next Scenario ➡️' : 'Finish & View Score 🏆'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 3: WHATSAPP SCRIPT VAULT
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'scripts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {[
            {
              title: '1. Fresh Lead First Contact',
              tag: 'Inquiry Qualification',
              color: '#059669',
              hinglish: 'Namaste Sir! Maine dekha aap [Area] mein [2/3 BHK] property dekh rahe hain. Mere paas direct builder allotment ke 2 verified options hain. Photos aur exact price list WhatsApp par share kar doon?',
              english: 'Hello Sir! I saw your requirement for a [BHK] property in [Locality]. I have 2 verified inventory units with clear titles matching your budget. May I share the brochure and floor plans here on WhatsApp?'
            },
            {
              title: '2. Site Visit Confirmation & Directions',
              tag: 'Inspection Lock-in',
              color: '#7c3aed',
              hinglish: 'Sir, kal 3:30 PM hum [Property Name] ka physical visit karenge. Location pin: [Google Maps Link]. Main gate par guard ko aapka naam inform kar diya hai. Aate waqt mujhe ring kar lijiye.',
              english: 'Sir, confirming our site inspection tomorrow at 3:30 PM for [Property Name]. Exact Google Maps pin: [Location Link]. Security has been notified. Looking forward to meeting you at the site.'
            },
            {
              title: '3. Negotiation & Counter-Offer',
              tag: 'Price Closing',
              color: '#ea580c',
              hinglish: 'Sir, owner ke saath meeting complete ho gayi hai. Unhone aapki profile aur immediate token readiness ko dekh kar price ₹[Final Amount] all-inclusive kar diya hai. Kal token advance ke saath deal close karte hain.',
              english: 'Sir, I just concluded discussions with the seller. In consideration of your immediate token readiness, they have agreed to your target price of ₹[Final Amount] all-inclusive. Shall we lock it tomorrow with earnest money?'
            },
            {
              title: '4. Token Advance Cheque Acknowledgment',
              tag: 'Legal Due Diligence',
              color: '#b45309',
              hinglish: 'Sir, aapka Token Cheque of ₹[Amount] successfully receive ho gaya hai. AgentLadders system se official receipt generate kar di gayi hai (attached). Legal papers check ke baad ATS sign karenge.',
              english: 'Sir, your earnest money token cheque of ₹[Amount] has been acknowledged. The official receipt is generated and attached. We are initiating the title verification and drafting the Agreement to Sell.'
            },
            {
              title: '5. Registry Completion & Brokerage Settlement',
              tag: 'Commission Invoice',
              color: '#047857',
              hinglish: 'Congratulations on your property registry! 🏡 Registry process smoothly execute ho gaya hai. Aapki official brokerage invoice attached hai. Kindly process the payment via NEFT/UPI to our agency account.',
              english: 'Heartiest congratulations on your new property registry! 🏡 It was a pleasure serving you. Attached is our formal GST brokerage invoice for settlement. Wishing you immense joy in your new home!'
            }
          ].map((script, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 18,
                border: '1.5px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, backgroundColor: `${script.color}15`, color: script.color, padding: '3px 10px', borderRadius: 20 }}>
                    {script.tag}
                  </span>
                  <WhatsAppIcon size={18} color="#16a34a" />
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                  {script.title}
                </h4>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                    Hinglish Script:
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 10, fontSize: 13, color: '#334155', lineHeight: 1.5, border: '1px solid #e2e8f0' }}>
                    {script.hinglish}
                  </div>
                  <button
                    onClick={() => handleCopy(script.hinglish, script.title + ' (Hinglish)')}
                    style={{
                      marginTop: 6,
                      background: 'none',
                      border: 'none',
                      color: script.color,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <CopyIcon size={12} color={script.color} />
                    Copy Hinglish
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                    English Script:
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 10, fontSize: 13, color: '#334155', lineHeight: 1.5, border: '1px solid #e2e8f0' }}>
                    {script.english}
                  </div>
                  <button
                    onClick={() => handleCopy(script.english, script.title + ' (English)')}
                    style={{
                      marginTop: 6,
                      background: 'none',
                      border: 'none',
                      color: script.color,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <CopyIcon size={12} color={script.color} />
                    Copy English
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 4: BROKER GOLDEN RULES
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              number: '01',
              title: 'The 5-Minute Call Rule',
              emoji: '⚡',
              color: '#059669',
              tagline: 'Speed is your highest competitive advantage.',
              description: 'When an inquiry enters from 99acres or your website, call within 5 minutes. The buyer is sitting on their phone, actively searching. If you wait 2 hours, they have already spoken to 3 other brokers.'
            },
            {
              number: '02',
              title: 'The 3-Property Limit Rule',
              emoji: '🎯',
              color: '#2563eb',
              tagline: 'Never tour more than 3 homes in one day.',
              description: 'Showing 5 or 6 flats causes "decision fatigue". The buyer forgets which flat had the modular kitchen and which had the larger balcony. Shortlist 2 or 3 curated units that match their exact budget.'
            },
            {
              number: '03',
              title: 'The Immediate Token Receipt Rule',
              emoji: '📑',
              color: '#ea580c',
              tagline: 'A verbal agreement is not a closed deal.',
              description: 'Always generate a printed or PDF Token Advance Receipt in AgentLadders the moment earnest money is received. This binds the buyer, prevents seller re-listing, and establishes your legal right to commission.'
            },
            {
              number: '04',
              title: 'The Split Commission Rule',
              emoji: '💰',
              color: '#7c3aed',
              tagline: 'Collect 50% at Agreement, 50% at Registry.',
              description: 'Do not wait for final registry after 90 days to ask for full commission. Structure your agreement so 50% brokerage is settled when the Agreement to Sell (ATS) is registered, protecting your agency cash flow.'
            }
          ].map((rule, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                border: '1.5px solid #e2e8f0',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 16,
                right: 20,
                fontSize: 48,
                fontWeight: 900,
                color: `${rule.color}15`,
                lineHeight: 1
              }}>
                {rule.number}
              </div>

              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: `${rule.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                marginBottom: 16
              }}>
                {rule.emoji}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {rule.title}
              </h3>

              <div style={{ fontSize: 13, fontWeight: 700, color: rule.color, marginBottom: 12 }}>
                {rule.tagline}
              </div>

              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { PlusIcon } from '@/components/icons/NavIcons';
import { SearchBar } from '@/components/ui/SearchBar';

interface SupportMessage {
  id: string;
  sender: string;
  isStaff: boolean;
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdByName: string;
  createdByEmail?: string;
  agencyName?: string;
  contractType?: string;
  messages: SupportMessage[];
  createdAt: string;
}

interface ContractTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  category: string;
  clausesSummary: string[];
  fullLegalText: string;
}

const BROKER_CONTRACTS: ContractTemplate[] = [
  {
    id: 'rent_leave_license',
    title: 'Residential Leave and License Agreement (11-Month Rent Model)',
    badge: '11-Month Rent Model',
    category: 'Rental & Lease',
    description: 'Complete, legally enforceable Leave and License agreement under the Indian Easements Act, 1882 for letting residential flats, apartments, and villas. Protects owner title, establishes licensee status, defines monthly rent, security deposit refund, lock-in period, maintenance obligations, and broker fee terms.',
    clausesSummary: [
      'Grant of revocable license under Section 52 of Indian Easements Act, 1882 (no tenancy rights created)',
      'Fixed 11-month term with mutual written renewal option and 10% rent escalation clause',
      'Interest-free refundable security deposit with strict return timeline upon vacant possession handover',
      'Society maintenance, electricity, municipal water, and piped gas payment responsibilities',
      'Minimum 3 to 6-month lock-in period and 30-day formal written notice period for early termination',
      'Brokerage acknowledgment: 1 month gross rent payable to introducing real estate broker upon signing'
    ],
    fullLegalText: `RESIDENTIAL LEAVE AND LICENSE AGREEMENT
(Under Section 52 of The Indian Easements Act, 1882)

This LEAVE AND LICENSE AGREEMENT is entered into on this _____ day of ____________, 2026 at [City, State], by and between:

1. LICENSOR (OWNER):
[Owner Full Legal Name], S/o / W/o / D/o [Father / Spouse Name], aged about [Age] years, residing at [Permanent Address of Owner], Aadhaar No: [XXXX-XXXX-XXXX], PAN: [XXXXXXXXXX] (hereinafter referred to as the "LICENSOR", which expression shall, unless repugnant to the context, include legal heirs, executors, administrators, and assigns) OF THE FIRST PART;

AND

2. LICENSEE (TENANT):
[Tenant Full Legal Name], S/o / W/o / D/o [Father / Spouse Name], aged about [Age] years, having permanent residence at [Permanent Address], currently employed at [Company / Occupation], Aadhaar No: [XXXX-XXXX-XXXX], PAN: [XXXXXXXXXX] (hereinafter referred to as the "LICENSEE", which expression shall, unless repugnant to the context, include legal heirs and successors) OF THE SECOND PART;

FACILITATING BROKERAGE:
[Agency Name], represented by [Agent Name], RERA Registration No: [RERA Agent ID], having office at [Agency Office Address] (hereinafter referred to as the "OFFICIAL BROKER").

WHEREAS:
A. The Licensor is the absolute legal owner and fully possessed of the residential flat/apartment bearing Flat No. [Unit No], on [Floor Number] Floor, Wing [Wing / Building Name], situated in [Society / Apartment Project Name], [Street / Landmark], [Locality], [City - Pin Code] comprising [BHK Configuration, e.g. 3 BHK with 2 Balconies and 1 Reserved Stilt/Covered Car Parking Slot No. ___] (hereinafter referred to as the "LICENSED PREMISES").
B. The Licensee has approached the Licensor with a request to grant temporary leave and license to use and occupy the Licensed Premises for purely residential purposes of self and immediate family for a limited duration of 11 (eleven) months.
C. The Licensor has agreed to grant such leave and license on a revocable basis on the terms and conditions herein contained.

NOW THIS AGREEMENT WITNESSETH AND IT IS MUTUALLY AGREED BY AND BETWEEN THE PARTIES AS FOLLOWS:

1. GRANT OF LICENSE:
The Licensor hereby grants unto the Licensee, and the Licensee hereby accepts from the Licensor, the temporary leave and license to occupy and use the Licensed Premises strictly for private residential purposes and for no other purpose whatsoever.

2. PURE LICENSE (NO TENANCY CREATED):
It is expressly declared and agreed that this Agreement constitutes a pure, temporary Leave and License governed strictly by Section 52 of the Indian Easements Act, 1882, and shall under no circumstances be construed as creating any demise, tenancy, sub-tenancy, leasehold right, or easement interest in favor of the Licensee. The legal ownership, constructive possession, and reversionary rights of the Licensed Premises remain solely with the Licensor at all times.

3. DURATION AND TERM:
(a) The license shall be for a fixed period of 11 (Eleven) calendar months commencing on [Commencement Date] and expiring on [Expiry Date].
(b) Any extension or renewal shall be solely at the mutual written agreement of both parties executed at least 30 (thirty) days prior to expiration, subject to a revised monthly license fee with a customary [10%] escalation.

4. MONTHLY LICENSE FEE (RENT):
(a) The Licensee shall pay to the Licensor a monthly license fee of Rs. [Amount in Figures]/- (Rupees [Amount in Words] Only) per calendar month.
(b) The monthly license fee shall be paid in advance on or before the [5th / 7th] day of each English calendar month via electronic bank transfer (NEFT/RTGS/IMPS/UPI) directly to the Licensor's designated bank account:
    Bank Name: [Bank Name] | A/C No: [Account Number] | IFSC: [IFSC Code].

5. INTEREST-FREE REFUNDABLE SECURITY DEPOSIT:
(a) The Licensee has deposited with the Licensor an interest-free refundable security deposit of Rs. [Deposit in Figures]/- (Rupees [Deposit in Words] Only) vide Cheque / Transfer Ref No. [UTR / Cheque No] dated [Date].
(b) The said security deposit shall remain with the Licensor during the license tenure without bearing interest.
(c) The Licensor shall refund the security deposit in full simultaneously upon the Licensee vacating and delivering peaceful, vacant, and undamaged possession of the premises, subject to adjustments for unpaid electricity/water arrears or physical damages beyond normal fair wear and tear.

6. SOCIETY MAINTENANCE, ELECTRICITY & UTILITIES:
(a) Regular society monthly maintenance charges payable to the Co-operative Housing Society / Apartment Owners Association shall be borne and paid directly by the [Licensor / Licensee].
(b) The Licensee shall punctually pay all monthly electricity consumption charges, piped natural gas (PNG) bills, internet/broadband, and local municipal water charges incurred during the license tenure according to actual meter readings.

7. LOCK-IN PERIOD & NOTICE FOR TERMINATION:
(a) Both parties mutually agree to a mandatory Lock-In Period of [3 / 6] months starting from the commencement date, during which neither party can terminate this agreement.
(b) After the lock-in period, either party may terminate this agreement by giving 1 (One) month prior written notice or one month license fee in lieu of notice.
(c) In the event of default in payment of license fee for consecutive 2 (two) months, or breach of any covenant herein, the Licensor shall be entitled to revoke the license forthwith and re-enter the premises.

8. USE, MAINTENANCE & PROHIBITIONS:
(a) The Licensee shall keep the premises in clean, sanitary, and tenantable condition.
(b) The Licensee shall not make any structural additions, alterations, drilling, or modifications without prior written approval of the Licensor.
(c) The Licensee shall strictly adhere to all bylaws, rules, and regulations of the Resident Welfare Association (RWA) / Society.
(d) The Licensee shall not assign, transfer, sub-license, or part with possession of the premises or any part thereof to any third party.
(e) The Licensee shall not conduct any illegal, immoral, commercial, or nuisance-causing activities within the premises.

9. INSPECTION BY LICENSOR:
The Licensor, or authorized real estate broker, shall have the right to enter and inspect the Licensed Premises at reasonable daylight hours upon giving at least 24 (twenty-four) hours prior notice to the Licensee.

10. BROKERAGE COMMISSION ENTITLEMENT:
Both the Licensor and Licensee expressly acknowledge that [Agency Name] has introduced the parties and successfully negotiated this transaction. The parties agree that a professional brokerage equivalent to 1 (One) month gross license fee is due and payable to the Broker upon signing of this Agreement. In the event this Agreement is renewed or extended for a subsequent term, the parties agree to pay renewal brokerage as per local real estate association guidelines.

11. GOVERNING LAW & DISPUTE RESOLUTION:
This Agreement is governed by the laws of India and the jurisdiction of competent civil courts situated in [City].

IN WITNESS WHEREOF, the Licensor, Licensee, and Official Broker have executed this Leave and License Agreement in presence of witnesses on the day and year first written above.

LICENSOR: ___________________________    LICENSEE: ___________________________
Signature:                                Signature:

FACILITATING BROKER:
[Agency Name] / [Agent Signature]
RERA Reg No: [RERA ID]

WITNESS 1:                                WITNESS 2:
Name: _______________________________     Name: _______________________________
Signature: __________________________     Signature: __________________________`
  },
  {
    id: 'commercial_lease',
    title: 'Commercial Space Lease Agreement (Office, Retail & Industrial)',
    badge: 'Commercial Lease',
    category: 'Rental & Lease',
    description: 'Institutional commercial lease agreement for corporate office suites, IT/ITeS parks, retail showrooms, and commercial warehouses. Covers rent-free fit-out periods, Common Area Maintenance (CAM), HVAC/power load allocation, GST/TDS tax deductions, and minimum 3-year lock-in protection.',
    clausesSummary: [
      '30 to 60-day rent-free fit-out period prior to official rent commencement date',
      'Segregated commercial billing: Base Rent + CAM charges + HVAC & 100% DG backup power charges',
      'Minimum 36-month lock-in period for both Lessor and Lessee with premature termination liquidated damages',
      'Statutory compliance with TDS under Section 194-I of Income Tax Act and applicable GST (18%)',
      'Signage & branding permissions on building façade, designated basement parking slots, and warm-shell restoration upon vacating',
      'Commercial leasing broker fee acknowledgment: 1 to 2 months gross rent payable upon agreement registration'
    ],
    fullLegalText: `COMMERCIAL LEASE DEED & AGREEMENT
(For Corporate Offices, Retail Spaces, IT Parks & Warehousing)

This COMMERCIAL LEASE AGREEMENT is made and entered into on this _____ day of ____________, 2026, by and between:

LESSOR (PROPERTY OWNER / COMMERCIAL LANDLORD):
[Lessor Corporate / Individual Name], registered under [Companies Act / Individual PAN], having its registered office / residence at [Lessor Address], represented by authorized signatory [Signatory Name, Designation] (hereinafter "LESSOR") OF THE FIRST PART;

AND

LESSEE (TENANT / CORPORATE OCCUPIER):
[Lessee Corporate / Company Name], a company incorporated under the Companies Act with CIN: [XXXXXXXXXX], having its registered office at [Lessee Address], represented by its authorized signatory [Signatory Name, Board Resolution dated ___] (hereinafter "LESSEE") OF THE SECOND PART;

FACILITATING COMMERCIAL BROKER:
[Agency Name], RERA Real Estate Agent License: [RERA Reg No], having principal office at [Broker Address] (hereinafter "COMMERCIAL BROKER").

PREMISES DETAILS:
Commercial Unit / Suite No. [Suite No], situated on [Floor] Floor, measuring Super Built-up Area of [Area in Sq.Ft] sq.ft. (equivalent Carpet Area of [Carpet Area in Sq.Ft] sq.ft.) in the commercial complex known as [Commercial Building / IT Park Name], [Arterial Road / Landmark], [City, State] together with [Number] designated reserved basement car parking spaces (hereinafter the "DEMISED PREMISES").

TERMS AND OPERATIVE COVENANTS:

1. LEASE TERM & FIT-OUT PERIOD:
(a) The total term of this Lease shall be for [5 / 9] consecutive years commencing from the Rent Commencement Date.
(b) Fit-out Period: The Lessor grants the Lessee a Rent-Free Fit-out Period of [45 / 60] calendar days starting from [Handover Date] to [Expiry of Fit-out Period], during which the Lessee may install workstations, server racks, HVAC ducting, and interiors. The Lessee shall only pay actual electricity and water consumed during this period.
(c) The official "Rent Commencement Date" shall be [Date].

2. MONTHLY COMMERCIAL RENT & ESCALATION:
(a) Base Rent: The Lessee agrees to pay a monthly Base Rent of Rs. [Amount in Figures]/- (Rupees [Amount in Words] Only) calculated at the rate of Rs. [Rate per Sq.Ft] per sq.ft. of Super Built-up Area per month.
(b) Escalation: The Base Rent shall escalate by [15%] (Fifteen Percent) compounded at the expiration of every 3 (three) years from the Rent Commencement Date.
(c) Rent Due Date: Rent is payable in advance on or before the 10th of each calendar month against valid GST tax invoice.

3. COMMON AREA MAINTENANCE (CAM) & UTILITIES:
(a) In addition to Base Rent, the Lessee shall pay CAM charges at Rs. [CAM Rate]/sq.ft. per month directly to the facility management agency for building security, common lighting, elevators, and housekeeping.
(b) Dedicated dual-source electrical power load of [___ KVA] and 100% DG backup power shall be billed as per sub-meter consumption.

4. INTEREST-FREE REFUNDABLE SECURITY DEPOSIT:
(a) The Lessee shall deposit an interest-free refundable security deposit equivalent to [6 (Six) months] Base Rent, totaling Rs. [Deposit Amount]/-.
(b) The Deposit shall be refunded within 15 (fifteen) business days of physical handover of the Demised Premises at the termination of the lease, subject to deduction of unpaid rent or electricity bills.

5. MANDATORY LOCK-IN PERIOD:
(a) Both Lessor and Lessee mutually commit to an initial mandatory Lock-In Period of 36 (thirty-six) months starting from the Rent Commencement Date.
(b) If the Lessee terminates this Lease during the lock-in period, the Lessee shall remain liable to pay the Base Rent for the remainder of the unexpired lock-in period as liquidated damages.

6. STATUTORY COMPLIANCES (TDS & GST):
(a) The Lessee shall deduct Tax Deducted at Source (TDS) under Section 194-I of the Income Tax Act, 1961 and provide quarterly Form 16A certificates to the Lessor.
(b) Applicable GST (currently 18%) shall be paid by the Lessee over and above the Base Rent and CAM charges.

7. SIGNAGE, FAÇADE & COMMON AMENITIES:
The Lessee shall have non-exclusive rights to install standardized illuminated corporate signage at the building lobby directory and external building façade as approved by local municipal guidelines.

8. VACATING & RESTORATION:
Upon expiration or termination, the Lessee shall surrender the Demised Premises in a broom-clean "Warm Shell" condition, ordinary wear and tear excepted.

9. BROKERAGE COMMISSION ENTITLEMENT:
Both Lessor and Lessee acknowledge the advisory services of [Agency Name] and confirm payment of commercial leasing brokerage equivalent to [1 to 2 months gross rent] plus applicable GST upon execution and registration of this Deed.

10. REGISTRATION & STAMP DUTY:
Under Section 17 of the Registration Act, 1908, this Lease Deed shall be registered with the Sub-Registrar of Assurances. The Stamp Duty and registration charges shall be borne [equally / by the Lessee].

IN WITNESS WHEREOF, the Lessor and Lessee have set their hands and corporate seals:

For LESSOR: ___________________________    For LESSEE: ___________________________
Authorized Signatory                       Authorized Signatory

COMMERCIAL BROKER:
[Agency Name] / [Signatory]
RERA Reg: [RERA ID]

Witness 1: ____________________________    Witness 2: ____________________________`
  },
  {
    id: 'bayana_token_agreement',
    title: 'Property Token / Earnest Money Receipt & Agreement to Sell (Bayana Agreement)',
    badge: 'Earnest Bayana / Token',
    category: 'Sales & Bayana',
    description: 'Legally binding earnest money receipt and preliminary agreement to sell for residential and commercial purchases. Secures agreed sale price, milestone payment schedule, and bilateral default forfeiture penalties (Double Bayana).',
    clausesSummary: [
      'Token / Earnest Money Deposit (EMD) acknowledgment against total agreed sale consideration',
      'Defined timeline for Seller to furnish original title documents, 30-year search report, encumbrance certificate, and society NOC',
      'Bilateral default clause: If Buyer defaults, Token amount is forfeited; if Seller reneges, Seller must refund Token PLUS pay 100% penalty (Double Bayana)',
      'Seller warranty affirming clear, marketable, encumbrance-free title free of mortgages, liens, or family litigation',
      'Brokerage protection: 1%–2% commission acknowledged and payable upon execution of final registered Sale Deed'
    ],
    fullLegalText: `PROPERTY TOKEN / EARNEST MONEY RECEIPT & PRELIMINARY AGREEMENT TO SELL
(BAYANA AGREEMENT)

This RECEIPT AND AGREEMENT TO SELL is entered into on this _____ day of ____________, 2026 at [City, State], by and between:

THE SELLER / VENDOR:
[Seller Legal Full Name], S/o / W/o [Name], residing at [Address], Aadhaar No: [XXXX-XXXX-XXXX], PAN: [XXXXXXXXXX] (hereinafter called the "SELLER") OF THE FIRST PART;

AND

THE BUYER / PURCHASER:
[Buyer Legal Full Name], S/o / W/o [Name], residing at [Address], Aadhaar No: [XXXX-XXXX-XXXX], PAN: [XXXXXXXXXX] (hereinafter called the "BUYER") OF THE SECOND PART;

FACILITATING REAL ESTATE AGENCY:
[Agency Name], represented by [Agent Name], RERA ID: [RERA Reg Number], having office at [Agency Address] (hereinafter called the "BROKER").

SUBJECT PROPERTY:
All that piece and parcel of residential / commercial property bearing Unit / Flat / Plot No. [Unit Details], Floor: [Floor], measuring Carpet Area of [Carpet Area] sq.ft. (Super Built-up Area [Super Area] sq.ft.), situated in [Project / Society Name], [Locality], [City], together with [Number] Car Parking and undivided proportionate share in underlying land.

RECITALS & BINDING TERMS:

1. TOTAL SALE CONSIDERATION:
The Seller agrees to sell and the Buyer agrees to purchase the Subject Property for a total negotiated sale consideration of Rs. [Total Price in Figures]/- (Rupees [Total Price in Words] Only) on an outright basis, free from all encumbrances, charges, mortgages, and claims.

2. EARNEST MONEY TOKEN (BAYANA) RECEIPT:
(a) The Seller acknowledges receipt of a sum of Rs. [Token Amount in Figures]/- (Rupees [Token Amount in Words] Only) from the Buyer as Earnest Token Money / Initial Bayana via Cheque / RTGS / Bank Draft No: [Reference / Cheque Number] dated [Date], drawn on [Bank Name].
(b) The Seller hereby grants a formal receipt for the said Token Amount and confirms that the Subject Property is hereby booked exclusively for the Buyer.

3. PAYMENT SCHEDULE & BALANCE CONSIDERATION:
The Buyer shall pay the balance sale consideration of Rs. [Balance Amount]/- as follows:
(a) Second Milestone / Formal Agreement to Sell: Rs. [Amount]/- (bringing total paid to 10% or 20%) within [15 / 30] days, on or before [Date], upon Seller verifying clean title and society NOC.
(b) Final Balance at Registry: The remaining consideration of Rs. [Final Amount]/- shall be paid at the time of final execution and registration of Sale Deed / Conveyance Deed before the Sub-Registrar of Assurances on or before [Target Registry Date].

4. TITLE SEARCH & DUE DILIGENCE:
(a) The Seller shall within 10 (ten) days provide legible copies of all title chain documents, allotment letter, mutation extract, 30-year Non-Encumbrance Certificate (NEC), and sanctioned building plans to the Buyer's legal counsel or financing bank.
(b) The Seller warrants that the property is freehold / clear leasehold with absolute marketable title, free from any bank loan hypothecation (or shall procure Loan Foreclosure Letter from existing lender).

5. FORFEITURE & BILATERAL DEFAULT PENALTY (DOUBLE BAYANA CLAUSE):
(a) BUYER DEFAULT: If the Seller fulfills all title obligations and the Buyer fails or neglects to pay the balance consideration and complete registration by the stipulated date, the Seller shall be entitled to forfeit the Earnest Token Money and cancel this booking.
(b) SELLER DEFAULT (DOUBLE REFUND): If the Seller backs out, refuses to sell, attempts to sell to a third party, or fails to deliver clean marketable title, the Seller shall be legally bound to immediately refund the Token Amount in full PLUS pay an equivalent 100% compensation penalty (totaling DOUBLE the Bayana amount, i.e., Rs. [2x Token Amount]/-) to the Buyer, without prejudice to Buyer's rights to file for Specific Performance under the Specific Relief Act.

6. EXPENSES:
Stamp duty, registration fees, transfer fee of society, and Sub-Registrar administrative charges shall be borne solely by the [Buyer / mutually as per local custom].

7. BROKERAGE COMMISSION:
Both Seller and Buyer confirm that [Agency Name] is the sole effective procuring cause of this transaction. Seller agrees to pay [1.00% / 2.00%] and Buyer agrees to pay [1.00% / 2.00%] professional commission plus applicable GST to the Broker upon execution of this agreement / final registration.

IN WITNESS WHEREOF, the parties have signed this Agreement on the date hereinabove mentioned:

SELLER: ______________________________    BUYER: ______________________________
[Seller Signature]                       [Buyer Signature]

FACILITATING BROKER:
[Agency Name] / [Agent Signature]
RERA Reg No: [RERA ID]

WITNESS 1: ___________________________    WITNESS 2: ___________________________
Name & Contact:                           Name & Contact:`
  },
  {
    id: 'sole_selling',
    title: 'Sole Selling Rights (Exclusive Seller Mandate Agreement)',
    badge: 'Exclusive Listing',
    category: 'Seller Mandate',
    description: 'Grant of exclusive agency rights for marketing and executing the sale of a residential or commercial property in India for a fixed validity period (e.g., 90–180 days) with full commission guarantee even if sold through direct inquiries.',
    clausesSummary: [
      'Exclusivity clause preventing owner from engaging other brokers or selling directly without fee',
      'Fixed commission rate (e.g., 2% of the total registered transaction value)',
      '180-day post-termination protection clause for leads introduced during tenure',
      'Escrow and earnest token handling guidelines complying with RERA'
    ],
    fullLegalText: `EXCLUSIVE SOLE SELLING RIGHTS AGREEMENT

This Agreement is entered into on this _____ day of ____________, 2026, by and between:
1. OWNER: [Owner / Developer Name], residing at / registered at [Address] (hereinafter referred to as the "Seller")
AND
2. REAL ESTATE AGENCY: [Agency Name], having its principal place of business at [Agency Address], represented by [Agent Name], RERA Registration No: [RERA ID] (hereinafter referred to as the "Exclusive Agent").

1. APPOINTMENT OF EXCLUSIVE BROKER:
The Seller hereby appoints the Exclusive Agent as the sole and exclusive selling agent for the marketing, negotiation, and sale of the property located at [Property Address, Unit/Plot Details] ("Subject Property").

2. MANDATE DURATION:
This mandate is granted exclusively for a period of [e.g., 120 days] commencing on [Start Date] and expiring on [End Date]. During this period, the Seller shall not appoint any other broker, channel partner, or agent.

3. PROFESSIONAL COMMISSION / SERVICE FEE:
(a) The Seller agrees to pay the Exclusive Agent a professional commission of [2.00%] (Two Percent) plus applicable GST on the total registered sale consideration of the Subject Property.
(b) The commission shall become due and payable upon execution of the Agreement to Sell / Registration of the Sale Deed, or release of first installment whichever is earlier.

4. OVER-THE-COUNTER / DIRECT BUYER PROTECTION:
Even if the Subject Property is sold to any direct buyer or inquiry initiated by the Seller during this tenure, the agreed commission remains payable in full to the Exclusive Agent in consideration of marketing services and platform visibility provided.

5. POST-TERMINATION PROTECTION PERIOD:
For a period of 180 (one hundred eighty) days following the expiration or termination of this Agreement, if the Subject Property is sold to any buyer introduced by the Exclusive Agent during the mandate term, the commission shall remain fully payable.

6. GOVERNING LAW & JURISDICTION:
This agreement is governed by the laws of India and Real Estate (Regulation and Development) Act (RERA). Courts situated in [City] shall have exclusive jurisdiction.

IN WITNESS WHEREOF, both parties have set their signatures and seals:`
  },
  {
    id: 'property_management_mandate',
    title: 'Property Management & Rental Leasing Mandate (Landlord-Broker Agreement)',
    badge: 'Property Management',
    category: 'Seller Mandate',
    description: 'Authorizes real estate agency to act as official Property Manager for NRI, high-net-worth, or outstation landlords. Encompasses tenant sourcing, police verification, rent collection escrow, routine maintenance oversight, and lease renewal administration.',
    clausesSummary: [
      'Scope of authority: Marketing, holding inspection keys, conducting tenant vetting, executing agreements under Power of Attorney',
      'Remuneration schedule: Monthly management fee (8%–10% of gross rent) or 1 month rent per annual leasing cycle',
      'Emergency maintenance reserve fund limit (e.g. ₹15,000) for rapid plumbing, electrical, or structural repairs',
      'Timely electronic remittance of collected rent to landlord\'s NRE/NRO or domestic bank account with tax documentation'
    ],
    fullLegalText: `PROPERTY MANAGEMENT & COMPREHENSIVE LEASING MANDATE
(For NRI, Absentee & High Net-Worth Landlords)

This PROPERTY MANAGEMENT MANDATE is made on this _____ day of ____________, 2026, by and between:

PROPERTY OWNER / LANDLORD:
[Landlord Full Name], S/o / D/o [Name], resident of / residing at [Overseas / Domestic Address], Passport / Aadhaar No: [XXXXXXXXXX], PAN: [XXXXXXXXXX] (hereinafter referred to as the "OWNER") OF THE FIRST PART;

AND

AUTHORIZED PROPERTY MANAGEMENT AGENCY:
[Agency Name], represented by [Designated Manager Name], having principal office at [Agency Address], RERA Reg No: [RERA ID] (hereinafter referred to as the "PROPERTY MANAGER") OF THE SECOND PART.

PROPERTY MANAGED:
Residential / Commercial Unit: [Unit No, Project Name, Floor, Address, City] fully equipped with fixtures as detailed in Annexure A inventory list ("Subject Property").

OPERATIVE TERMS:

1. APPOINTMENT & SCOPE OF AGENCY:
The Owner hereby appoints the Property Manager as the exclusive managing and leasing agent for the Subject Property with full authority to:
(a) Hold duplicate keys, market the property on digital platforms, and conduct physical inspections with qualified prospective tenants.
(b) Screen prospective tenants including civil background check, employment verification, and statutory local police verification.
(c) Assist in executing registered Leave & License Agreements under Power of Attorney / electronic execution.
(d) Collect monthly license fees and security deposit in designated escrow client accounts and remit net proceeds to the Owner's bank account.

2. REMITTANCE & FINANCIAL ACCOUNTABILITY:
(a) The Property Manager shall collect the monthly rent by the 7th of every month and electronically transfer the net rent to Owner's bank account within 3 (three) working days after deducting applicable management fees or pre-approved repair expenses.
(b) Owner's Bank Account: [Bank Name, Account No, IFSC, Swift Code for NRE/NRO transfers].

3. MANAGEMENT FEES & BROKERAGE:
(a) New Tenant Placement Fee: Equal to 1 (One) month gross rent upon procuring and signing a new 11-month lease agreement.
(b) Monthly Management Retainer: [8.00%] (Eight Percent) of the gross monthly rent collected for ongoing tenant management, bill payments, and inspections.
(c) Lease Renewal: 50% of one month gross rent upon negotiating an annual renewal with the existing tenant.

4. MAINTENANCE RESERVE FUND:
The Owner shall maintain a float/reserve balance of Rs. [15,000 / 25,000]/- with the Property Manager for emergency plumbing, electrical, or society repair works. For any single repair expense exceeding Rs. [5,000]/-, prior written WhatsApp or email approval of the Owner shall be mandatory.

5. TERM & TERMINATION:
This mandate is valid for a period of 12 (Twelve) calendar months from execution, renewable automatically. Either party may terminate with 30 (thirty) days written notice.

AGREED AND SIGNED:
OWNER: _______________________________    PROPERTY MANAGER: _______________________________
Signature                                Signature & Seal`
  },
  {
    id: 'commission_mandate',
    title: 'Standard Broker Commission & Client Site Inspection Mandate',
    badge: '1-2% Fee Guarantee',
    category: 'Commission Agreement',
    description: 'Legally binding broker brokerage acknowledgment signed by buyer or seller prior to site inspection, confirming 1% to 2% professional brokerage.',
    clausesSummary: [
      'Irrevocable acknowledgment of introduction of property/client',
      'Specified brokerage fee schedule: 1% for Buyers, 2% for Sellers, 1 month rent for Leases',
      'Payment milestone at registry / agreement signing',
      'Applicability of Goods & Services Tax (GST 18%)'
    ],
    fullLegalText: `BROKERAGE COMMISSION & PROFESSIONAL FEE MANDATE

To: [Agency Name] / [Agent Name]
Date: [Date]

Ref: Inspection & Introduction of Real Estate Property situated at [Property / Locality]

I / We hereby confirm and acknowledge that [Agency Name] has introduced and arranged the inspection of the properties listed below for outright purchase / lease:

1. COMMISSION SCHEDULE:
In the event that I / We, or my family members, partners, associates, nominee, or allied companies enter into an agreement to purchase, lease, or acquire any interest in the introduced property, I / We irrevocably agree to pay [Agency Name] a professional service commission as follows:
- Outright Sale / Purchase: 1.00% to 2.00% of the total transaction value.
- Rental / Commercial Lease: 1 (One) month gross rent or 2% of total lease value.

2. PAYMENT TERMS:
The commission shall be paid via Cheque / RTGS / NEFT immediately upon execution of the Agreement to Sell, Allotment Letter, or Registration of Sale Deed, whichever is earliest.

3. NON-CIRCUMVENTION:
I / We undertake not to contact, negotiate, or close the transaction directly with the owner or developer to circumvent or reduce the broker's legitimate professional remuneration.

Signed by Client / Buyer:
Name: ______________________
Phone: _____________________
Signature: __________________`
  },
  {
    id: 'co_brokerage',
    title: 'Co-Brokerage Commission Sharing Memorandum of Understanding (50:50 Split MoU)',
    badge: 'Co-Broker 50:50',
    category: 'Commission Agreement',
    description: 'Formal partnership between Listing Broker (having the property mandate) and Selling Broker (having the qualified buyer) to share commission equally.',
    clausesSummary: [
      'Equal 50:50 split of gross commission received from both buyer and seller sides',
      'Clear definition of roles: Listing broker coordinates with owner, selling broker handles buyer',
      'Mutual client non-poaching commitment for 12 months',
      'Transparent receipt and deduction of TDS/GST'
    ],
    fullLegalText: `CO-BROKERAGE COMMISSION SHARING MEMORANDUM OF UNDERSTANDING

BETWEEN:
Broker 1 (Listing Agency): [Agency 1 Name], representing the Property.
AND
Broker 2 (Selling Agency): [Agency 2 Name], representing the Buyer.

PROPERTY: [Property Unit & Locality Details]
TOTAL EXPECTED DEAL VALUE: Rs. [Deal Amount]

1. COMMISSION SPLIT:
All brokerage and success fees collected from the Buyer and Seller shall be pooled and divided in an equal 50% / 50% proportion between Broker 1 and Broker 2.

2. RECEIPT & ESCROW:
Whichever agency receives the fee shall disburse the counterpart's 50% share within 48 hours of bank clearance, accompanied by GST invoice and TDS credit details.

3. CLIENT INTEGRITY:
Broker 1 shall not solicit Broker 2's buyer for future transactions for a period of 12 months, and vice versa.

Agreed and Signed:`
  },
  {
    id: 'channel_partner',
    title: 'Developer & Channel Partner (CP) Project Marketing Agreement',
    badge: 'Developer CP Slab',
    category: 'Project Sales',
    description: 'Tiered commission sharing and lead tagging protocol between Real Estate Developers/Builders and Channel Partner Agencies for new project launches.',
    clausesSummary: [
      'Lead tagging and client validity period (45–60 days from site visit registration)',
      'Slab-based commission (2.5% to 4.5% based on booking volume)',
      'Marketing collateral usage and RERA project representation',
      'Timely disbursement upon receipt of 10% buyer downpayment'
    ],
    fullLegalText: `DEVELOPER & CHANNEL PARTNER MARKETING AGREEMENT

BETWEEN:
[Developer / Builder Corporate Name] (hereinafter "The Developer")
AND
[Agency Name], Certified Channel Partner (hereinafter "The CP").

PROJECT NAME: [Project Name], RERA Reg: [RERA Project Number]

1. LEAD REGISTRATION & TAGGING PROTOCOL:
(a) The CP must register all prospective purchasers via digital CRM token or site visit slip prior to or at the time of client's first visit.
(b) Once registered, the client shall remain tagged exclusively to the CP for 60 (sixty) calendar days.

2. COMMISSION SLABS & INCENTIVES:
- Slab 1 (Units 1 - 3): 2.50% of Basic Sale Price (BSP)
- Slab 2 (Units 4 - 8): 3.00% of BSP + Launch Booster
- Slab 3 (Units 9+): 4.00% of BSP

3. PAYMENT DISBURSEMENT SCHEDULE:
(a) 50% commission released within 15 days of customer paying 10% booking amount and signing BBA.
(b) Remaining 50% released upon completion of registered agreement.

Signatures & Company Seals:`
  },
  {
    id: 'ncnda_buyer',
    title: 'Mutual Non-Circumvention & Non-Disclosure Agreement (NCNDA for Off-Market Assets)',
    badge: 'Off-Market NCNDA',
    category: 'Compliance & Confidentiality',
    description: 'Protects off-market listings, ultra-luxury villas, institutional land parcels, and private client identities from being leaked or circumnavigated.',
    clausesSummary: [
      'Strict non-disclosure of owner identity, survey numbers, and financial metrics',
      'Two-year mutual non-circumvention duration',
      'Liquidated damages equivalent to double the lost brokerage for breach',
      'Non-solicitation of clients or direct contact with family offices'
    ],
    fullLegalText: `MUTUAL NON-CIRCUMVENTION & NON-DISCLOSURE AGREEMENT (NCNDA)
FOR OFF-MARKET REAL ESTATE ACQUISITIONS

Parties agree to share confidential commercial and structural data regarding [Off-Market Asset / Land Parcel / Trophy Estate].

1. CONFIDENTIAL INFORMATION:
All title deeds, survey maps, financial feasibility reports, and owner identities shall remain strictly confidential.

2. NON-CIRCUMVENTION:
Neither party shall attempt to deal directly or indirectly with the contacts, owners, lenders, or brokers introduced by the disclosing party without prior written consent.

3. REMEDIES & PENALTY:
Any party breaching this agreement shall be liable to compensate the aggrieved party with liquidated damages equal to 200% of the calculated professional commission, in addition to legal injunctive relief.

Signed:`
  },
  {
    id: 'tenant_police_verification',
    title: 'Tenant Police Verification, KYC & Resident Society Move-In Undertaking',
    badge: 'Tenant Police & KYC',
    category: 'Compliance & Confidentiality',
    description: 'Comprehensive compliance undertaking signed by incoming tenant and landlord for police background verification, Resident Welfare Association (RWA) / Co-operative Housing Society (CHS) move-in NOC.',
    clausesSummary: [
      'Mandatory statutory police verification declaration complying with local state police guidelines',
      'Certified copies of Government photo ID (Aadhaar / Passport / PAN) and permanent employment proof',
      'Strict adherence to Society/RWA bylaws regarding parking allocations, visitor management, pets, and quiet hours',
      'Explicit covenant prohibiting commercial usage, subletting, or offensive/illegal activities on residential premises'
    ],
    fullLegalText: `TENANT POLICE VERIFICATION & RESIDENT SOCIETY MOVE-IN UNDERTAKING

TO:
1. The Station House Officer (SHO), Local Police Station: [Police Station Jurisdiction]
2. The Secretary / Managing Committee, [Co-op Housing Society / RWA Name]

PART A - TENANT IDENTIFICATION & UNDERTAKING:
I, [Tenant Full Name], Son/Daughter of [Father Name], aged [Age] years, permanent resident of [Permanent Native Address], having Aadhaar No: [XXXX-XXXX-XXXX] and Mobile No: [XXXXXXXXXX], currently employed as [Designation] at [Employer / Company Name with Office Address], do hereby declare and undertake as follows:

1. OCCUPANCY PURPOSE:
I have entered into a Leave & License Agreement with Property Owner [Owner Name] for occupying Flat / Unit No. [Unit No] in [Society Name] for purely residential use of myself and immediate family members:
- Member 1: [Name, Relation, Age]
- Member 2: [Name, Relation, Age]

2. NO CRIMINAL BACKGROUND:
I solemnly affirm that neither I nor any of the co-occupants have ever been convicted of any criminal offense or face pending criminal proceedings in any court in India or abroad.

3. SOCIETY BYLAWS ADHERENCE:
I undertake to strictly abide by all rules, parking allocations, waste segregation guidelines, and security gate entry procedures established by the Society Managing Committee. I shall not create any public nuisance or use the premises for commercial or illegal purposes.

PART B - LANDLORD / OWNER VERIFICATION:
I, [Owner Name], confirm that I have verified the tenant's Aadhaar and employment credentials and hereby submit this verification form in accordance with statutory Police Tenant Verification regulations.

TENANT SIGNATURE: _______________________    OWNER SIGNATURE: _______________________
Date: ________________                   Date: ________________

ATTACHED KYC CHECKLIST:
[x] Copy of Tenant Aadhaar Card
[x] Copy of Tenant Employment ID / Offer Letter
[x] Copy of Registered Leave & License Agreement
[x] Passport Size Photographs (Tenant & Occupants)`
  }
];

const FAQS = [
  {
    category: 'RERA & Legal Compliance',
    question: 'How does AgentLadders assist with Indian RERA compliance?',
    answer: 'AgentLadders includes built-in RERA ID tracking on every property listing, marketing flyer, and deal transaction. Public showcase links display verified RERA registration numbers and certified Carpet Area measurements (as mandated by Section 4(2) of RERA), ensuring full statutory compliance and protecting your agency against regulatory penalties.'
  },
  {
    category: 'RERA & Legal Compliance',
    question: 'How are Carpet Area, Built-up, and Super Built-up Area measured and displayed?',
    answer: 'Under RERA, developers and brokers are legally prohibited from advertising exclusively in Super Built-up Area. AgentLadders enforces dedicated Carpet Area and Built-up Area fields, while allowing configuration of commercial super area loading percentages so brokers remain 100% compliant during client pitches.'
  },
  {
    category: 'RERA & Legal Compliance',
    question: 'What legal obligations exist for real estate broker commission agreements in India?',
    answer: 'Under the Indian Contract Act and state real estate regulations, an oral brokerage agreement can be contested. Using AgentLadders\' downloadable Commission Mandates and Site Inspection slips creates an irrevocable written record of client introduction, entitling the agency to lawful 1%–2% commission upon deal execution.'
  },
  {
    category: 'Property Inventory & Specs',
    question: 'How do Construction Stage, Possession Status, and Facing Orientation work?',
    answer: 'AgentLadders enables granular filtering across Construction Stages (Pre-Launch, Foundation, Under Construction, Ready to Move), Possession Timelines, and Vastu Orientation (North, North-East, East, etc.). This allows field agents to match client spiritual preferences and possession urgency in seconds.'
  },
  {
    category: 'Property Inventory & Specs',
    question: 'How do Parking Allocations and Property Configurations (BHK) display on client brochures?',
    answer: 'Properties can be configured with specific parking types (Covered Basement, Stilt, Open, Mechanical Stack) and custom BHK layouts (1 RK to 6+ BHK Penthouse / Duplex). These specs are cleanly displayed in the metrics grid on all public preview microsites.'
  },
  {
    category: 'Property Inventory & Specs',
    question: 'What is the difference between Public, Restricted, and Private listing visibility modes?',
    answer: 'Public mode displays full listing specs, gallery, and pricing on client links. Restricted mode hides the price (showing "Price on Request") for luxury or trophy properties where owners prefer financial discretion. Private / Off-Market mode keeps the listing strictly hidden from all public links, accessible only internally by authorized agency brokers.'
  },
  {
    category: 'Property Inventory & Specs',
    question: 'Can I upload photo galleries, floor plans, and video tour links for listings?',
    answer: 'Yes. Every listing supports unlimited high-resolution photos with categorized room tags (Exterior, Living Hall, Master Bedroom, Balcony, Floor Plan), cover photo selection, and virtual tour video links (YouTube/Vimeo) that playback directly in the client preview modal.'
  },
  {
    category: 'Leads & Inbound Sources',
    question: 'How does Lead & Inbound Source channel attribution work?',
    answer: 'AgentLadders allows tagging inquiries with their exact source channel (WhatsApp Inbound, 99acres, MagicBricks, Housing.com, Meta Ads, Google Ads, Broker Referral, Direct Walk-in, or Website Form). The CRM tracks conversion rates per channel so agency owners know where marketing ROI is highest.'
  },
  {
    category: 'Leads & Inbound Sources',
    question: 'How does the Magic-Match engine pair clients with inventory?',
    answer: 'The Magic-Match engine cross-references client budget range, desired BHK configuration, preferred localities, and purpose (Buy/Rent) against active property inventory. It generates a ranked compatibility match score so agents can pitch suitable options within seconds of receiving an inquiry.'
  },
  {
    category: 'Leads & Inbound Sources',
    question: 'Can multiple agents follow up on the same lead without stepping on each other?',
    answer: 'Every lead is assigned to an Agent Owner. The Activity Timeline logs all notes, calls, WhatsApp pitches, and status updates chronologically, preventing duplicate client outreach and maintaining team accountability.'
  },
  {
    category: 'Deals & Commissions',
    question: 'How does the Deal Stage Kanban pipeline manage transactions?',
    answer: 'The Deals pipeline follows standard Indian transaction stages: Token / Bayana Advance → Legal Title Due Diligence → Agreement to Sell / BBA → Home Loan Sanction → Stamp Duty & Registration → Possession Handover → Closed Won. You can drag and drop deals to update revenue forecasts in real time.'
  },
  {
    category: 'Deals & Commissions',
    question: 'How are Co-Broker (50:50) and Internal Agent Commission splits calculated?',
    answer: 'In any deal card, you can enter Buyer Commission %, Seller Commission %, and toggle "Co-Broker Split". The engine automatically calculates the gross commission pool, deducts external channel partner shares (e.g. 50:50), and allocates net agency earnings to the handling agent and agency owner.'
  },
  {
    category: 'Deals & Commissions',
    question: 'Can we generate professional GST Tax Invoices for brokerage fees?',
    answer: 'Yes. In the Invoices section, you can issue branded GST-compliant tax invoices detailing 18% GST (CGST + SGST or IGST), TDS deductions under Section 194H (5% professional brokerage TDS), PAN, and RERA agent registration numbers.'
  },
  {
    category: 'Site Visits & Field Mobility',
    question: 'How do site visit appointments sync with agent calendars?',
    answer: 'When a site visit is scheduled, it automatically populates the agency Calendar, sets date/time alerts, and tags the designated property and client. Agents can mark outcomes as Completed, Re-Scheduled, or Follow-up Needed directly from their mobile cockpit.'
  },
  {
    category: 'Site Visits & Field Mobility',
    question: 'Can prospective buyers book site visits directly from the public property preview link?',
    answer: 'Yes! Every public property microsite has a "Book Visit" button. Clients can submit their preferred date, time slot, and contact details without needing to log in. The request instantly appears in your CRM Site Visits queue with a "Created by Buyer" badge.'
  },
  {
    category: 'WhatsApp Pitching & Marketing',
    question: 'How does 1-Click WhatsApp Pitching work without third-party API costs or ban risks?',
    answer: 'AgentLadders formats property headlines, pricing in Indian units (₹ Lakhs / Crores), key highlights, and a secure privacy link into an encoded wa.me URL. When clicked, it opens WhatsApp Web or your native WhatsApp mobile app with the message pre-filled. Because the message is sent directly from your own WhatsApp, there are zero third-party subscription costs and zero risk of automated API bans.'
  },
  {
    category: 'WhatsApp Pitching & Marketing',
    question: 'Can we customize the WhatsApp pitch message with our agency branding?',
    answer: 'Yes. The pitch message automatically pulls your agency branding, agent contact phone number, and a clean tokenized showcase link, so clients receive an impressive, luxury presentation every time.'
  },
  {
    category: 'Security, Privacy & Data Isolation',
    question: 'Can other broker agencies see our listings, owner contact numbers, or clients?',
    answer: 'No, absolutely never. AgentLadders uses strict multi-tenant database isolation. Each agency operates in a siloed cryptographic workspace. Your landlord numbers, private commission notes, client negotiations, and transaction margins are strictly inaccessible to other brokers or external users.'
  },
  {
    category: 'Security, Privacy & Data Isolation',
    question: 'How does Two-Factor Authentication (2FA) with Google Authenticator safeguard our agency?',
    answer: 'You can enable TOTP 2FA in Settings > Security. Once configured with any standard authenticator app (Google Authenticator, Microsoft Authenticator, or Authy), login requires both the password and a dynamic 6-digit rolling code, plus 5 emergency offline recovery codes.'
  },
  {
    category: 'Security, Privacy & Data Isolation',
    question: 'Can we export our database to Excel / CSV at any time?',
    answer: 'Yes. Agency owners can export their entire portfolio of properties, leads, clients, deals, and expense ledgers into CSV format at any time with zero vendor lock-in.'
  },
  {
    category: 'Agency Branding & Customization',
    question: 'How do custom typography and color schemes apply across our workspace?',
    answer: 'In Settings > Agency Branding, you can select from 6 luxury font pairings (Roboto [Default], Plus Jakarta Sans, Inter, Outfit, Poppins, Montserrat) and 5 curated real estate color palettes (Emerald Prosperity [Default], Royal Sapphire, Tuscan Rose Gold, Warm Amber Bronze, Cyber Violet). The theme propagates instantly across all navigation, badges, and public pitch links.'
  },
  {
    category: 'Agency Branding & Customization',
    question: 'How do Agency Logo and Agent Profile Photos reflect on client links?',
    answer: 'Uploading your agency logo and user profile photo in Settings displays your branding on all public property preview pages, WhatsApp pitch headers, and downloadable legal agreements.'
  },
  {
    category: 'Agency Branding & Customization',
    question: 'How do the System Configuration settings in Settings allow adding custom options?',
    answer: 'In Settings > System Configuration, agency owners can add custom options for Property Types, BHK Configurations, Lead & Inbound Sources, Amenities, Construction Stages, Vastu Orientations, and Deal Stages with 1 click.'
  }
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'contracts' | 'tickets'>('faqs');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New Ticket Form State & Dedicated Draft Separation
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSource, setFormSource] = useState<'general' | 'contract'>('general');

  // General inquiry draft: starts blank and preserves user-typed content across modal toggles
  const [generalDraft, setGeneralDraft] = useState({
    subject: '',
    category: 'General',
    priority: 'Medium',
    contractType: '',
    message: ''
  });

  // Active form state being edited
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'General',
    priority: 'Medium',
    contractType: '',
    message: ''
  });

  const handleOpenGeneralInquiry = () => {
    setFormSource('general');
    // Open with user's saved general draft (blank if fresh, or user's last typed text, NOT from legal drafts)
    setTicketForm({ ...generalDraft });
    setShowNewTicketModal(true);
  };

  const updateFormField = (field: string, value: string) => {
    setTicketForm(prev => {
      const updated = { ...prev, [field]: value };
      if (formSource === 'general') {
        setGeneralDraft(updated);
      }
      return updated;
    });
  };

  const handleClearForm = () => {
    const blank = {
      subject: '',
      category: formSource === 'contract' ? 'Contract Inquiry' : 'General',
      priority: 'Medium',
      contractType: formSource === 'contract' ? (ticketForm.contractType || '') : '',
      message: ''
    };
    setTicketForm(blank);
    if (formSource === 'general') {
      setGeneralDraft(blank);
    }
    showToast('info', 'Form draft cleared.', 'Cleared');
  };

  // Reply state in ticket thread
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Contract Preview Modal
  const [previewContract, setPreviewContract] = useState<ContractTemplate | null>(null);

  // Contract Search & Filters
  const [contractSearch, setContractSearch] = useState('');
  const [contractCategoryFilter, setContractCategoryFilter] = useState('All');

  const handleDownloadContract = (contract: ContractTemplate) => {
    const element = document.createElement('a');
    const file = new Blob([contract.fullLegalText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${contract.id}_agreement_template.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    showToast('success', `${contract.title} downloaded as text file!`, 'Downloaded');
  };

  const faqCategories = React.useMemo(() => {
    return ['All', ...Array.from(new Set(FAQS.map(f => f.category)))];
  }, []);

  const contractCategories = React.useMemo(() => {
    return ['All', ...Array.from(new Set(BROKER_CONTRACTS.map(c => c.category)))];
  }, []);

  // Search & Filters
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/support');
      const json = await res.json();
      if (json.tickets) {
        setTickets(json.tickets);
        if (json.tickets.length > 0) {
          // Keep current or select first
          setSelectedTicket(prev => {
            if (prev) {
              const updated = json.tickets.find((t: SupportTicket) => t.id === prev.id);
              return updated || json.tickets[0];
            }
            return json.tickets[0];
          });
        }
      }
    } catch {
      showToast('error', 'Failed to load support tickets', 'Network Error');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      showToast('warning', 'Please provide a subject and detailed message.', 'Validation Warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        showToast('success', `Ticket ${data.ticket.ticketNumber} created! Our HQ staff will respond shortly.`, 'Inquiry Dispatched');
        setShowNewTicketModal(false);
        if (formSource === 'general') {
          const freshBlank = {
            subject: '',
            category: 'General',
            priority: 'Medium',
            contractType: '',
            message: ''
          };
          setGeneralDraft(freshBlank);
          setTicketForm(freshBlank);
        } else {
          setTicketForm({
            subject: '',
            category: 'General',
            priority: 'Medium',
            contractType: '',
            message: ''
          });
        }
        setActiveTab('tickets');
        await loadTickets();
        setSelectedTicket(data.ticket);
      } else {
        showToast('error', data.error || 'Failed to submit inquiry', 'Error');
      }
    } catch {
      showToast('error', 'Network error while submitting ticket', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch('/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyText.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setReplyText('');
        setSelectedTicket(data.ticket);
        setTickets(prev => prev.map(t => t.id === data.ticket.id ? data.ticket : t));
        showToast('success', 'Your message has been posted to the ticket.', 'Reply Sent');
      } else {
        showToast('error', data.error || 'Failed to send reply', 'Error');
      }
    } catch {
      showToast('error', 'Network error while sending reply', 'Error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleOpenContractInquiry = (contract: ContractTemplate) => {
    setFormSource('contract');
    setTicketForm({
      subject: `Draft Customization: ${contract.title}`,
      category: 'Contract Inquiry',
      priority: 'High',
      contractType: contract.title,
      message: `Hi Legal Support Team,\n\nWe would like to request a customized legal draft for the "${contract.title}".\n\nSpecific requirements:\n- Parties involved: \n- Property location / RERA ID: \n- Commission slab / terms: \n\nPlease advise on customized clauses and stamp duty guidelines.`
    });
    setPreviewContract(null);
    setShowNewTicketModal(true);
  };

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCat = faqCategoryFilter === 'All' || faq.category === faqCategoryFilter;
    const matchesQuery = !faqSearch || faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) || faq.category.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredContracts = React.useMemo(() => {
    return BROKER_CONTRACTS.filter(c => {
      const matchesCat = contractCategoryFilter === 'All' || c.category === contractCategoryFilter;
      const matchesQuery = !contractSearch || 
        c.title.toLowerCase().includes(contractSearch.toLowerCase()) || 
        c.description.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.badge.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(contractSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [contractCategoryFilter, contractSearch]);

  return (
    <>
      <PageHeader
        title="Help, Support & Legal Center"
        subtitle="Brokerage FAQs, downloadable RERA contract templates, and direct SLA helpdesk"
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" onClick={handleOpenGeneralInquiry}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <PlusIcon size={15} color="#ffffff" /> Submit New Inquiry
              </span>
            </Button>
          </div>
        }
      />

      {/* Top Level Nav Tabs */}
      <div 
        className="responsive-pills-scroll"
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid #e2e8f0',
          marginBottom: 24,
          paddingBottom: 2,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        {[
          { key: 'faqs', label: 'Broker FAQs & Guides', icon: '💡' },
          { key: 'contracts', label: 'Legal Contracts & Mandates', icon: '⚖️' },
          { key: 'tickets', label: `My Inquiries & Tickets (${tickets.length})`, icon: '💬' },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#fff' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FAQS & GUIDES */}
      {activeTab === 'faqs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick SLA Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>Priority SLA Guarantee</h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                All ticket submissions are reviewed by real estate engineers and answered within 4 hours during business days.
              </p>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📜</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>RERA Compliant Framework</h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Standard legal drafts comply with State RERA regulations (MahaRERA, Karnataka RERA, UP RERA, HRERA).
              </p>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🛡️</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>Direct Admin Headquarters</h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Inquiries reflect directly on the central Super Admin Command Center for prompt escalation and resolution.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 20,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <SearchBar
              value={faqSearch}
              onChange={setFaqSearch}
              placeholder="Search FAQs (e.g. WhatsApp, RERA, commission splits, tokens)..."
              maxWidth={420}
              minWidth={280}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {faqCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFaqCategoryFilter(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: faqCategoryFilter === cat ? 'var(--primary)' : '#e2e8f0',
                    backgroundColor: faqCategoryFilter === cat ? 'var(--primary)' : '#f8fafc',
                    color: faqCategoryFilter === cat ? '#fff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', backgroundColor: '#fff', borderRadius: 12 }}>
                No FAQs matching "{faqSearch}". Try submitting a support ticket below!
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.04)' : 'none'
                    }}
                  >
                    <div
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? '#f8fafc' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                          {faq.category}
                        </span>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>
                          {faq.question}
                        </span>
                      </div>
                      <span style={{ fontSize: 16, color: '#64748b', fontWeight: 800 }}>
                        {isExpanded ? '−' : '+'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', fontSize: 13.5, color: '#475569', lineHeight: 1.6, backgroundColor: '#fff' }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LEGAL CONTRACTS & AGREEMENTS */}
      {activeTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>⚖️</span>
              <div>
                <strong style={{ fontSize: 14, color: '#1e40af' }}>Standard Indian Real Estate Brokerage Agreements & Legal Contracts</strong>
                <p style={{ fontSize: 12.5, color: '#3b82f6', margin: '2px 0 0' }}>
                  100% accurate, legally binding model agreements for residential rent, commercial leases, earnest bayana tokens, seller mandates, channel partner slabs, and co-brokering.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => {
              setFormSource('contract');
              setTicketForm({
                subject: 'Request Custom Real Estate Contract Drafting',
                category: 'Contract Inquiry',
                priority: 'High',
                contractType: 'Custom Brokerage / Lease Agreement',
                message: 'Hi Legal Team, we would like assistance reviewing or drafting a custom real estate brokerage agreement.\n\nSpecific requirements:\n- Agreement type: \n- Parties involved: \n- Terms & conditions: '
              });
              setShowNewTicketModal(true);
            }}>
              Request Custom Draft
            </Button>
          </div>

          {/* Contracts Search & Category Filter Bar */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 20,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <SearchBar
              value={contractSearch}
              onChange={setContractSearch}
              placeholder="Search contracts (e.g. rent, bayana, exclusive mandate, commercial lease)..."
              maxWidth={420}
              minWidth={280}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {contractCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setContractCategoryFilter(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: contractCategoryFilter === cat ? 'var(--primary)' : '#e2e8f0',
                    backgroundColor: contractCategoryFilter === cat ? 'var(--primary)' : '#f8fafc',
                    color: contractCategoryFilter === cat ? '#fff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts Grid */}
          {filteredContracts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              No contracts found matching "{contractSearch}". Try adjusting your search query or category filter!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
              {filteredContracts.map(contract => (
                <div
                  key={contract.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {contract.category}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 12, backgroundColor: '#ecfdf5', color: '#047857' }}>
                      {contract.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                    {contract.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {contract.description}
                  </p>

                  <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 18, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Key Enforceable Clauses:</span>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                      {contract.clausesSummary.map((clause, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{clause}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button variant="outline" size="sm" onClick={() => setPreviewContract(contract)}>
                      🔍 Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadContract(contract)}>
                      ⬇️ Download (.txt)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(contract.fullLegalText);
                      showToast('success', `${contract.title} copied to clipboard!`, 'Copied');
                    }}>
                      📋 Copy
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenContractInquiry(contract)}>
                      Inquire / Draft
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TICKETS & INQUIRIES */}
      {activeTab === 'tickets' && (
        <div className="support-tickets-grid" style={{ alignItems: 'start' }}>
          {/* Left Column: Tickets List */}
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>Support Inquiries</strong>
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>({tickets.length})</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleOpenGeneralInquiry}>
                + New
              </Button>
            </div>

            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {loadingTickets ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading inquiries...</div>
              ) : tickets.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No open inquiries found. Click "+ New" to submit a question or legal request.
                </div>
              ) : (
                tickets.map(ticket => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  const statusColors: Record<string, { bg: string; color: string }> = {
                    'Open': { bg: '#eff6ff', color: '#1d4ed8' },
                    'In Review': { bg: '#fef3c7', color: '#b45309' },
                    'Resolved': { bg: '#dcfce7', color: '#15803d' }
                  };
                  const badge = statusColors[ticket.status] || { bg: '#f1f5f9', color: '#475569' };

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : '#fff',
                        borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>{ticket.ticketNumber}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backgroundColor: badge.bg, color: badge.color }}>
                          {ticket.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.subject}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#94a3b8' }}>
                        <span>{ticket.category}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Ticket Conversation Thread */}
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
            {selectedTicket ? (
              <>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', borderRadius: '14px 14px 0 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{selectedTicket.ticketNumber}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backgroundColor: selectedTicket.status === 'Resolved' ? '#dcfce7' : '#eff6ff', color: selectedTicket.status === 'Resolved' ? '#15803d' : '#1d4ed8' }}>
                          {selectedTicket.status}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Priority: {selectedTicket.priority}</span>
                      </div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {selectedTicket.subject}
                      </h2>
                      {selectedTicket.contractType && (
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>
                          Attached Contract: {selectedTicket.contractType}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {new Date(selectedTicket.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 420 }}>
                  {selectedTicket.messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.isStaff ? 'flex-start' : 'flex-end',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.isStaff ? 'flex-start' : 'flex-end'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: msg.isStaff ? '#2563eb' : '#0f172a' }}>
                          {msg.isStaff ? '🛡️ ' + msg.sender : msg.sender}
                        </span>
                        <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        backgroundColor: msg.isStaff ? '#f1f5f9' : 'var(--primary)',
                        color: msg.isStaff ? '#0f172a' : '#fff',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendReply} style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'flex-end', backgroundColor: '#fafafa', borderRadius: '0 0 14px 14px' }}>
                  <textarea
                    rows={2}
                    placeholder="Type your response to the support team..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                  <Button variant="primary" disabled={submittingReply || !replyText.trim()}>
                    {submittingReply ? 'Sending...' : 'Send'}
                  </Button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8', padding: 40 }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>💬</span>
                <span>Select an inquiry on the left to read conversation threads or post updates.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL */}
      {showNewTicketModal && (
        <div onClick={() => setShowNewTicketModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '580px', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#f8fafc' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{formSource === 'contract' ? '📜' : '✉️'}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {formSource === 'contract' ? 'Request Custom Legal Draft' : 'Submit Support Inquiry'}
                  </h3>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: formSource === 'contract' ? '#f3e8ff' : '#eff6ff',
                    color: formSource === 'contract' ? '#7e22ce' : '#1d4ed8'
                  }}>
                    {formSource === 'contract' ? 'Legal Mandate' : 'General Inquiry'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {formSource === 'contract'
                    ? 'Request bespoke clauses and guidelines from our real estate legal desk.'
                    : 'Submit general inquiries, feature requests, or billing queries. Preserves your typed draft.'}
                </div>
              </div>
              <button onClick={() => setShowNewTicketModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Subject / Inquired Topic *</label>
                  {(ticketForm.subject || ticketForm.message) && (
                    <button
                      type="button"
                      onClick={handleClearForm}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear to Blank 🗑️
                    </button>
                  )}
                </div>
                <input
                  required
                  type="text"
                  placeholder={formSource === 'contract' ? "e.g. Custom 2% Exclusive Mandate for South Mumbai Penthouse" : "e.g. Question about 1-Click WhatsApp pitching or RERA specs"}
                  value={ticketForm.subject}
                  onChange={e => updateFormField('subject', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={e => updateFormField('category', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Contract Inquiry">Contract / Legal Template</option>
                    <option value="CRM Feature">CRM Feature Assistance</option>
                    <option value="Billing">Subscription & Billing</option>
                    <option value="Integrations">WhatsApp & Domain DNS</option>
                    <option value="Bug Report">Issue / Bug Report</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Priority SLA</label>
                  <select
                    value={ticketForm.priority}
                    onChange={e => updateFormField('priority', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="Low">Low (General guidance)</option>
                    <option value="Medium">Medium (Within 8h)</option>
                    <option value="High">High (Within 4h)</option>
                    <option value="Urgent">Urgent (Deal closing)</option>
                  </select>
                </div>
              </div>

              {ticketForm.category === 'Contract Inquiry' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Associated Agreement Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Residential Leave & License or Sole Selling Rights"
                    value={ticketForm.contractType}
                    onChange={e => updateFormField('contractType', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Detailed Message & Specific Questions *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide context, details, property location, or specific questions..."
                  value={ticketForm.message}
                  onChange={e => updateFormField('message', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📧</span>
                <span>Automated confirmation and responses are dispatched to your account email in real time.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <Button variant="outline" type="button" onClick={() => setShowNewTicketModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting to HQ...' : (formSource === 'contract' ? 'Submit Contract Request 📜' : 'Submit Inquiry ✉️')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTRACT PREVIEW MODAL */}
      {previewContract && (
        <div onClick={() => setPreviewContract(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '720px', maxHeight: '85vh', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backgroundColor: '#ecfdf5', color: '#047857' }}>
                  {previewContract.badge}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>{previewContract.title}</h3>
              </div>
              <button onClick={() => setPreviewContract(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
              <pre style={{
                fontFamily: 'monospace',
                fontSize: 12.5,
                lineHeight: 1.6,
                color: '#334155',
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8fafc',
                padding: 18,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                margin: 0
              }}>
                {previewContract.fullLegalText}
              </pre>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Complies with Indian RERA Broker Mandates</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="outline" size="sm" onClick={() => handleDownloadContract(previewContract)}>
                  ⬇️ Download (.txt)
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(previewContract.fullLegalText);
                  showToast('success', 'Agreement text copied to clipboard!', 'Copied');
                }}>
                  📋 Copy Text
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleOpenContractInquiry(previewContract)}>
                  Request Custom Draft ✉️
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}

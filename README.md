# AgentLadders — High-Performance Real Estate CRM & Brokerage Operating System

AgentLadders is a full-featured, enterprise-grade Real Estate CRM and Brokerage Operating System built with Next.js 16 (App Router), TypeScript, and custom CSS styling. It streamlines agency management, lead qualification, listings, transactions, KYC documents, site visits, and team performance tracking.

---

## ✨ Key Features & Modules

- **Executive Analytics & KPI Dashboard**: Real-time sales pipeline metrics, commission velocity, conversion rates, and revenue forecasting.
- **Lead Pipeline & Qualification**: Dynamic multi-stage pipeline, priority tagging, automated follow-up scheduling, and comprehensive search/filter controls.
- **Client & Investor Portfolio Management**: Detailed client profiles, budget parameters, target requirements, and communication logs.
- **Property & Inventory Catalog**: Luxury listings, property specifications (beds, baths, sqft), availability tracking, and high-res image carousels.
- **Deals & Transaction Pipeline**: Interactive deal stage tracking (Negotiation, Contract, Closing, Won), commission forecasting, and milestone monitoring.
- **Document & KYC Repository**: Secure file upload, categorized storage (Contracts, Title Deeds, KYC Passports), instant downloads, and deletion safeguards.
- **Site Visit & Tour Management**: Property inspection scheduling, client-agent matching, visit outcomes, and follow-up logging.
- **Task & Activity Tracker**: Due date tracking, agent assignment, priorities, and instant completion toggles.
- **Brokerage & Financial Management**: Invoicing, agent commission splits, expense tracking, and agency payout logs.
- **Enterprise Settings & Role-Based Access**: Team roster administration, agency branding, notifications, and security settings.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Vanilla CSS Modules & CSS Variables (zero external CSS bloat)
- **Authentication**: NextAuth.js
- **Data Layer**: Lightweight local JSON database (`data/db.json`) with persistent mutations and multi-tenant agency scoping

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git run clone https://github.com/theadityarai/AgentLadders.git
cd AgentLadders
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Default Credentials
Use the pre-configured agency administrator credentials:
- **Email**: `aditya@agentladders.com`
- **Password**: `admin123`
*(Or register a new agency account directly from the Sign Up page)*

---

## 📁 Repository Structure

```
├── docs/                     # BRD, FRD, and project design specifications
├── data/                     # Local JSON database & seed records
├── public/                   # Static assets, hero images, and icons
├── src/
│   ├── app/
│   │   ├── api/              # REST API endpoints (leads, deals, properties, etc.)
│   │   ├── dashboard/        # Dashboard views & module sub-pages
│   │   ├── login/            # Authentication interface
│   │   ├── signup/           # Agency registration
│   │   └── page.tsx          # High-converting Landing page
│   ├── components/           # Reusable UI library (Modals, Tables, Badges, etc.)
│   └── lib/                  # Database helpers and business logic
└── tsconfig.json             # TypeScript compiler configuration
```

---

## 📄 Documentation

Comprehensive product specifications, wireframes, and business requirement documents are available in the [`docs/`](./docs/) directory.

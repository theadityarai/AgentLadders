# AgentLadders — Production Deployment Guide 🚀

This document covers everything you need to deploy **AgentLadders (India Real Estate OS & Broker CRM)** to production with 100% uptime, SSL security, and persistent data storage.

---

## ⚡ Option 1: Deploy to Vercel (Recommended)

Vercel provides native Next.js hosting with global edge CDN, automatic HTTPS, and preview deployments.

### Step 1: Push Code to GitHub
Ensure all your latest changes are pushed to your GitHub repository:
```bash
git push origin main
```

### Step 2: Import into Vercel
1. Open [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`theadityarai/AgentLadders`).
4. **Root Directory**: Leave as default `./` (the root of the repo).
5. Framework Preset will be automatically detected as **Next.js**.

### Step 3: Configure Environment Variables
In the **Environment Variables** section on Vercel, configure the following:

| Variable Name | Required | Example / Description |
|---|---|---|
| `NEXTAUTH_SECRET` | **YES** | Strong random string (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Recommended | Your production URL, e.g. `https://your-domain.vercel.app` |
| `UPSTASH_REDIS_REST_URL` | **Recommended** | Cloud persistent DB URL from Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | **Recommended** | Cloud persistent DB Token from Upstash |
| `NODE_ENV` | Optional | `production` |

### Step 4: Click "Deploy"
Vercel will install dependencies, patch NextAuth host parsing, compile TypeScript, and export all static/dynamic routes.

---

## ☁️ Setting Up Upstash Redis (Free Persistent Cloud Database)

Because serverless functions have ephemeral file systems, local JSON files in `/tmp` reset during deployments or serverless cold reboots. **Upstash Redis** ensures your inquiries, properties, invoices, and settings are 100% persistent across instances.

1. Go to [console.upstash.com](https://console.upstash.com) and sign up (Free tier includes 10,000 requests/day).
2. Click **"Create Database"**.
   - **Name**: `agentladders-prod`
   - **Type**: Regional
   - **Region**: Asia Pacific (Mumbai) `ap-south-1` or closest to your target audience.
3. Once created, scroll down to the **"REST API"** section.
4. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Paste these into your Vercel Project Settings → **Environment Variables**.
6. **Automatic Seeding**: On the first request, AgentLadders will automatically seed your Upstash Redis database with all standard Indian real estate categories, sample listings, templates, and permissions.

---

## 🌐 Custom Domain & SSL Setup

1. In Vercel, go to **Settings → Domains**.
2. Enter your custom domain (e.g. `crm.youragency.com` or `youragency.com`).
3. Add the DNS records to your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger):
   - For Subdomains (e.g. `crm.youragency.com`):
     - **Type**: `CNAME`
     - **Name**: `crm`
     - **Value**: `cname.vercel-dns.com`
   - For Apex domain (`youragency.com`):
     - **Type**: `A`
     - **Name**: `@`
     - **Value**: `76.76.21.21`
4. Vercel provisions an automated Let's Encrypt SSL certificate within 2–5 minutes.

---

## 🐳 Option 2: Docker / VPS / Railway Self-Hosting

If hosting on a Linux VPS (Ubuntu, Debian) or Railway:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

---

## 🛡️ Production Verification & Health Checklist

After deploying, verify the following endpoints:

- [ ] **Health Probe**: `https://your-domain.com/api/health`
  - Expected: HTTP 200 with `{ status: "healthy", cloudDatabase: "connected (upstash/redis)" }`
- [ ] **Robots**: `https://your-domain.com/robots.txt`
  - Expected: Disallows `/dashboard/` & `/admin/`, points to `/sitemap.xml`
- [ ] **Sitemap**: `https://your-domain.com/sitemap.xml`
  - Expected: XML containing public listings and marketing pages
- [ ] **Login**: `https://your-domain.com/login`
- [ ] **Super Admin Access**: Log in with `aditya@agentladders.com` to access `/admin`
- [ ] **404 Route**: Try `https://your-domain.com/non-existent-page` to view the branded 404 page

---

## 🔑 Default Production Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin HQ** | `aditya@agentladders.com` | `admin123` | Full Platform & Tenant Control |
| **Agency Principal** | `marcus@vancerealty.com` | `password123` | Full Agency & CRM Operations |
| **Sales Associate** | `priya@vancerealty.com` | `password123` | Leads, Site Visits & Deals |

*(You can update passwords or configure Gmail 2FA anytime under **Settings → Security & Login**).*

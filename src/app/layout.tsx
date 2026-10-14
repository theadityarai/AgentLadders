import '@/lib/env-fix';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from '@/components/providers/SessionProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import CustomDialogProvider from '@/components/providers/CustomDialogProvider';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentLadders | Real Estate CRM",
  description: "The fastest, cleanest CRM built exclusively for Indian Real Estate Brokers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        {/* Instant zero-flash theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var f = localStorage.getItem('agentladders_font') || 'montserrat';
                var c = localStorage.getItem('agentladders_color') || 'emerald';
                var fonts = {
                  jakarta: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  montserrat: "'Montserrat', sans-serif",
                  outfit: "'Outfit', sans-serif",
                  poppins: "'Poppins', sans-serif",
                  playfair: "'Playfair Display', Georgia, serif"
                };
                var colors = {
                  emerald: { p: '#059669', pd: '#047857', pl: '#d1fae5', pt: '#065f46', rgb: '5, 150, 105', grad: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', acc: '#10b981', bb: '#d1fae5', bt: '#065f46' },
                  sapphire: { p: '#2563eb', pd: '#1d4ed8', pl: '#dbeafe', pt: '#1e40af', rgb: '37, 99, 235', grad: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', acc: '#3b82f6', bb: '#dbeafe', bt: '#1e40af' },
                  obsidian: { p: '#0f172a', pd: '#020617', pl: '#f1f5f9', pt: '#0f172a', rgb: '15, 23, 42', grad: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', acc: '#334155', bb: '#e2e8f0', bt: '#0f172a' },
                  rose: { p: '#be185d', pd: '#9d174d', pl: '#fce7f3', pt: '#831843', rgb: '190, 24, 93', grad: 'linear-gradient(135deg, #9d174d 0%, #db2777 100%)', acc: '#db2777', bb: '#fce7f3', bt: '#831843' },
                  amber: { p: '#d97706', pd: '#b45309', pl: '#fef3c7', pt: '#92400e', rgb: '217, 119, 6', grad: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)', acc: '#f59e0b', bb: '#fef3c7', bt: '#92400e' },
                  indigo: { p: '#6366f1', pd: '#4f46e5', pl: '#e0e7ff', pt: '#3730a3', rgb: '99, 102, 241', grad: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', acc: '#818cf8', bb: '#e0e7ff', bt: '#3730a3' }
                };
                var fontVal = fonts[f] || fonts.montserrat;
                var cur = colors[c] || colors.emerald;

                var s = document.createElement('style');
                s.id = 'agentladders-dynamic-theme';
                s.textContent = 'html, body, button, input, select, textarea, optgroup, table, th, td, h1, h2, h3, h4, h5, h6, p, span, a, label, li, div { font-family: ' + fontVal + ' !important; } ' +
                  ':root { --font-family: ' + fontVal + ' !important; --font-heading: ' + fontVal + ' !important; --primary: ' + cur.p + ' !important; --primary-color: ' + cur.p + ' !important; --primary-dark: ' + cur.pd + ' !important; --primary-hover: ' + cur.pd + ' !important; --primary-light: ' + cur.pl + ' !important; --primary-text: ' + cur.pt + ' !important; --primary-rgb: ' + cur.rgb + ' !important; --primary-gradient: ' + cur.grad + ' !important; --sidebar-active: ' + cur.p + ' !important; --accent: ' + cur.acc + ' !important; --badge-bg: ' + cur.bb + ' !important; --badge-text: ' + cur.bt + ' !important; } ' +
                  'input:focus, select:focus, textarea:focus { border-color: ' + cur.p + ' !important; box-shadow: 0 0 0 3px rgba(' + cur.rgb + ', 0.18) !important; } ' +
                  'input[type="checkbox"], input[type="radio"], input[type="range"] { accent-color: ' + cur.p + ' !important; }';
                document.head.appendChild(s);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            <CustomDialogProvider>
              {children}
            </CustomDialogProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

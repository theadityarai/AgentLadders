'use client';

import React, { useEffect } from 'react';
import { applyTheme, getStoredTheme } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Immediately apply cached theme from localStorage to avoid delay
    const { fontId, colorId } = getStoredTheme();
    applyTheme(fontId, colorId);

    // 2. Fetch agency's persisted theme from settings API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.agency) {
          const apiFont = data.agency.fontFamily || fontId;
          const apiColor = data.agency.colorScheme || colorId;
          applyTheme(apiFont, apiColor);
        }
      })
      .catch(() => {
        // Fallback gracefully to localStorage
      });

    // 3. Sync if updated in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'agentladders_font' || e.key === 'agentladders_color') {
        const current = getStoredTheme();
        applyTheme(current.fontId, current.colorId);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <>{children}</>;
}

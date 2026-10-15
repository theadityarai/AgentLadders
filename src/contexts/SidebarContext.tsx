'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
  setCollapsed: () => {},
});

const STORAGE_KEY = 'agentladders_sidebar_collapsed';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    } catch {}

    // Global keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar collapse
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        const tag = target?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsCollapsed(prev => {
          const next = !prev;
          try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const setCollapsed = useCallback((val: boolean) => {
    setIsCollapsed(val);
    try { localStorage.setItem(STORAGE_KEY, String(val)); } catch {}
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed: mounted ? isCollapsed : false, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);

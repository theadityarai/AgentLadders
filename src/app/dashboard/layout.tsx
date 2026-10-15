'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { OnScreenTutorial } from '@/components/tutorial/OnScreenTutorial';
import { SessionWatcher } from '@/components/auth/SessionWatcher';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import styles from './dashboard.module.css';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={styles.dashboardContainer}
      data-sidebar-collapsed={isCollapsed ? 'true' : 'false'}
    >
      <SessionWatcher />
      <Sidebar />
      <div className={styles.mainArea}>
        <Topbar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <OnScreenTutorial />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}


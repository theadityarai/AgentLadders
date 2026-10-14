import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { OnScreenTutorial } from '@/components/tutorial/OnScreenTutorial';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardContainer}>
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


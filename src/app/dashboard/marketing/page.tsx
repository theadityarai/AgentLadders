'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/leads');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
      <p>Redirecting to Leads Pipeline...</p>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompaniesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/clients');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
      <p>Redirecting to Clients Directory...</p>
    </div>
  );
}

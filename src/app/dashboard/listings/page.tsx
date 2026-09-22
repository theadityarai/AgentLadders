'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ListingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/properties');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
      <p>Redirecting to Properties Inventory...</p>
    </div>
  );
}

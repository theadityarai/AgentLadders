'use client';

import { useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';

/**
 * SessionWatcher
 * Runs invisibly on all authenticated dashboard pages.
 * Periodically verifies whether this device session is still valid in db.activeSessions,
 * or if it was terminated/revoked remotely (e.g. via "Terminate Session" or "Sign Out All Other Devices").
 * If revoked, it immediately terminates the local session and redirects to the login screen.
 */
export function SessionWatcher() {
  const { data: session, status } = useSession();
  const isTerminatingRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    const performCheck = async () => {
      if (isTerminatingRef.current) return;
      const devId = typeof window !== 'undefined' ? localStorage.getItem('agentladders_device_id') : null;
      if (!devId) return;

      try {
        const res = await fetch(`/api/auth/sessions?deviceId=${encodeURIComponent(devId)}&check=true`, {
          cache: 'no-store',
          headers: {
            'x-device-id': devId
          }
        });

        if (res.status === 401 || !res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.revoked || res.status === 401) {
            isTerminatingRef.current = true;
            console.warn('[SessionWatcher] Active session was terminated remotely. Logging out.');
            localStorage.removeItem('agentladders_device_id');
            await signOut({ redirect: false });
            window.location.href = '/login?revoked=true';
          }
        }
      } catch {
        // Ignore network hiccups
      }
    };

    // 1. Check immediately on mount
    performCheck();

    // 2. Poll every 4 seconds for rapid termination response
    const interval = setInterval(performCheck, 4000);

    // 3. Check immediately when window / tab gains focus
    const handleFocus = () => performCheck();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performCheck();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user, status]);

  return null;
}

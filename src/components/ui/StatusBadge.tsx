import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  let bg = '#f1f5f9';
  let color = '#475569';

  const s = status.toLowerCase();
  
  if (s.includes('active') || s.includes('won') || s.includes('paid') || s.includes('completed') || s.includes('success')) {
    bg = '#dcfce7';
    color = '#166534';
  } else if (s.includes('pending') || s.includes('progress') || s.includes('negotiation') || s.includes('proposal') || s.includes('scheduled')) {
    bg = '#fef3c7';
    color = '#92400e';
  } else if (s.includes('lost') || s.includes('cancelled') || s.includes('overdue') || s.includes('failed')) {
    bg = '#fee2e2';
    color = '#991b1b';
  }

  return (
    <span style={{
      backgroundColor: bg,
      color: color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-block',
      letterSpacing: '0.025em'
    }}>
      {status}
    </span>
  );
}

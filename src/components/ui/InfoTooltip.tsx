'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom';
  arrowLeft: number;
  width: number;
}

export function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    
    // Viewport bounds
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    // Desired width, clamped so it never exceeds screen bounds
    const targetWidth = Math.min(260, Math.max(160, vw - margin * 2));
    
    // Measured or estimated height
    const measuredHeight = tooltipRef.current?.offsetHeight || 54;

    // Determine vertical placement: prefer bottom, flip to top if insufficient space below
    const spaceBelow = vh - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const prefersTop = spaceBelow < (measuredHeight + 20) && spaceAbove > spaceBelow;
    
    const placement: 'top' | 'bottom' = prefersTop ? 'top' : 'bottom';

    let top = placement === 'bottom' 
      ? triggerRect.bottom + 8 
      : triggerRect.top - measuredHeight - 8;

    // Clamp vertical within viewport: never goes off top (margin) or bottom (vh - measuredHeight - margin)
    top = Math.max(margin, Math.min(top, vh - measuredHeight - margin));

    // Center horizontal alignment with trigger
    const idealLeft = triggerRect.left + (triggerRect.width / 2) - (targetWidth / 2);

    // Clamp horizontal within viewport: never goes off left (margin) or right (vw - targetWidth - margin)
    const left = Math.max(margin, Math.min(idealLeft, vw - targetWidth - margin));

    // Pointer arrow position relative to tooltip box (clamped inside bubble)
    const triggerCenter = triggerRect.left + (triggerRect.width / 2);
    const arrowLeft = Math.max(14, Math.min(triggerCenter - left, targetWidth - 14));

    setPosition({
      top,
      left,
      placement,
      arrowLeft,
      width: targetWidth
    });
  }, []);

  useEffect(() => {
    if (!show) {
      setPosition(null);
      return;
    }

    updatePosition();

    // Re-measure after DOM render to ensure exact text height is accounted for
    const raf = requestAnimationFrame(updatePosition);

    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleReposition, { passive: true });
    window.addEventListener('scroll', handleReposition, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, { capture: true });
    };
  }, [show, updatePosition]);

  return (
    <div 
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <div 
        tabIndex={0}
        role="button"
        aria-label="More information"
        style={{ 
          width: 16, 
          height: 16, 
          borderRadius: '50%', 
          border: '1px solid #cbd5e1', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 10, 
          fontWeight: 700, 
          color: '#64748b', 
          cursor: 'help',
          backgroundColor: show ? '#f1f5f9' : 'transparent',
          marginLeft: 8,
          transition: 'all 0.2s ease',
          outline: 'none',
          userSelect: 'none'
        }}
      >
        i
      </div>
      
      {show && mounted && createPortal(
        <div 
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: position ? position.top : -9999,
            left: position ? position.left : -9999,
            width: position ? position.width : 240,
            maxWidth: 'calc(100vw - 24px)',
            backgroundColor: '#0f172a',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            padding: '8px 12px',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 999999,
            textAlign: 'left',
            lineHeight: 1.45,
            pointerEvents: 'none',
            whiteSpace: 'normal',
            visibility: position ? 'visible' : 'hidden',
            opacity: position ? 1 : 0,
            transition: 'opacity 0.15s ease'
          }}
        >
          {text}
          {position && (
            <div style={{
              position: 'absolute',
              ...(position.placement === 'bottom' ? {
                bottom: '100%',
                borderColor: 'transparent transparent #0f172a transparent',
              } : {
                top: '100%',
                borderColor: '#0f172a transparent transparent transparent',
              }),
              left: position.arrowLeft,
              transform: 'translateX(-50%)',
              borderWidth: 5,
              borderStyle: 'solid',
            }} />
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

import React from 'react';
import styles from './BentoGrid.module.css';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.bentoGrid} ${className}`}>
      {children}
    </div>
  );
};

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

export const BentoItem: React.FC<BentoItemProps> = ({ 
  children, 
  className = '',
  colSpan = 1,
  rowSpan = 1
}) => {
  const classes = [
    styles.bentoItem,
    styles[`colSpan${colSpan}`],
    styles[`rowSpan${rowSpan}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

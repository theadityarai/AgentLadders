import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'glassGreen';
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  className = '',
  noPadding = false
}) => {
  const classes = [
    styles.card,
    variant === 'glass' ? 'glass-panel' : '',
    variant === 'glassGreen' ? 'glass-green' : '',
    variant === 'default' ? styles.defaultBg : '',
    !noPadding ? styles.padding : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

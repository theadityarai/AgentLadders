'use client';

import React, { useState, useEffect } from 'react';
import {
  COUNTRY_CODES,
  extract10DigitPhone,
  extractCountryCodeAndPhone
} from '@/lib/phone-validation';

export interface PhoneInputProps {
  id?: string;
  name?: string;
  value: string; // The phone number string (can be raw digits or e.g. "+91 9820045678")
  countryCode?: string; // Optional controlled country code (e.g. "+91")
  onChange: (fullPhone: string, raw10Digits: string, countryCode: string) => void;
  onCountryCodeChange?: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showValidationMessage?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

/**
 * Universal AgentLadders PhoneInput Component
 * - Country Code selection dropdown first
 * - Strict 10-digit number input: strips non-digits, strictly blocks typing < 10 or > 10
 * - Live validation feedback
 */
export function PhoneInput({
  id,
  name,
  value,
  countryCode: controlledCountryCode,
  onChange,
  onCountryCodeChange,
  placeholder = '98200 12345',
  required = false,
  disabled = false,
  showValidationMessage = true,
  autoFocus = false,
  className,
  style,
  selectStyle,
  inputStyle
}: PhoneInputProps) {
  const parsed = extractCountryCodeAndPhone(value, controlledCountryCode || '+91');
  const [internalCode, setInternalCode] = useState(controlledCountryCode || parsed.countryCode || '+91');

  useEffect(() => {
    if (!controlledCountryCode && parsed.countryCode && parsed.countryCode !== internalCode) {
      setInternalCode(parsed.countryCode);
    }
  }, [value, controlledCountryCode]);

  const activeCode = controlledCountryCode || internalCode;
  const rawDigits = parsed.digits;
  const isValid = rawDigits.length === 10;
  const isTouched = rawDigits.length > 0;

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setInternalCode(newCode);
    if (onCountryCodeChange) {
      onCountryCodeChange(newCode);
    }
    const fullPhone = rawDigits ? `${newCode} ${rawDigits}` : '';
    onChange(fullPhone, rawDigits, newCode);
  };

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    let targetCode = activeCode;
    let cleanedDigits = '';

    if (inputVal.includes('+')) {
      const extracted = extractCountryCodeAndPhone(inputVal, activeCode);
      targetCode = extracted.countryCode;
      cleanedDigits = extracted.digits.slice(0, 10);
      if (targetCode !== activeCode) {
        setInternalCode(targetCode);
        if (onCountryCodeChange) onCountryCodeChange(targetCode);
      }
    } else {
      // Strictly numeric, capped at 10 digits
      cleanedDigits = inputVal.replace(/\D/g, '').slice(0, 10);
    }

    const fullPhone = cleanedDigits ? `${targetCode} ${cleanedDigits}` : '';
    onChange(fullPhone, cleanedDigits, targetCode);
  };

  return (
    <div style={{ width: '100%', ...style }} className={className}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${isTouched && !isValid ? '#f87171' : isTouched && isValid ? '#86efac' : '#cbd5e1'}`,
          borderRadius: 8,
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isTouched && !isValid ? '0 0 0 1px #f87171' : undefined
        }}
      >
        {/* 1. Country Code Selection First */}
        <select
          value={activeCode}
          onChange={handleCountryCodeChange}
          disabled={disabled}
          title="Select Country Calling Code"
          style={{
            padding: '8px 10px',
            backgroundColor: '#f8fafc',
            border: 'none',
            borderRight: '1px solid #cbd5e1',
            color: '#0f172a',
            fontSize: 13,
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            flexShrink: 0,
            maxWidth: 135,
            ...selectStyle
          }}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.country})
            </option>
          ))}
        </select>

        {/* 2. Strict 10-Digit Number Input (Blocks < 10 and > 10) */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          pattern="[0-9]{10}"
          maxLength={10}
          minLength={10}
          value={rawDigits}
          onChange={handleDigitsChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            outline: 'none',
            fontSize: 13.5,
            color: '#0f172a',
            backgroundColor: 'transparent',
            width: '100%',
            letterSpacing: '0.02em',
            ...inputStyle
          }}
        />
      </div>

      {/* 3. Real-time Strict Validation Message */}
      {showValidationMessage && (
        <div style={{ marginTop: 4, minHeight: 18 }}>
          {rawDigits.length === 0 ? (
            required ? (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                * Exactly 10-digit mobile number required
              </span>
            ) : null
          ) : rawDigits.length < 10 ? (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ea580c' }}>
              ⚠️ Exactly 10 digits required ({rawDigits.length}/10 digits entered)
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
              ✓ Valid 10-digit mobile number ({activeCode} {rawDigits.slice(0, 5)} {rawDigits.slice(5)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

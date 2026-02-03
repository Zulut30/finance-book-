import React from 'react';
import { Currency, Language } from '../types';

interface FlagProps {
  currency?: Currency;
  lang?: Language;
  size?: number;
  className?: string;
}

// Map currencies and languages to ISO country codes or internal keys
const getCode = (currency?: Currency, lang?: Language): string => {
  if (lang) {
    switch (lang) {
      case 'ru': return 'RU';
      case 'en': return 'US';
      case 'pl': return 'PL';
    }
  }
  if (currency) {
    switch (currency) {
      case Currency.PLN: return 'PL';
      case Currency.USD: return 'US';
      case Currency.EUR: return 'EU';
      case Currency.GBP: return 'GB';
      case Currency.CHF: return 'CH';
      case Currency.UAH: return 'UA';
      case Currency.RUB: return 'RU';
      case Currency.BYN: return 'BY';
      case Currency.KZT: return 'KZ';
      case Currency.JPY: return 'JP';
      case Currency.CNY: return 'CN';
      case Currency.TRY: return 'TR';
      case Currency.SEK: return 'SE';
      case Currency.NOK: return 'NO';
      case Currency.DKK: return 'DK';
      default: return 'GLOBE';
    }
  }
  return 'GLOBE';
};

export const Flag: React.FC<FlagProps> = ({ currency, lang, size = 24, className = '' }) => {
  const code = getCode(currency, lang);

  const renderSvgContent = (code: string) => {
    switch (code) {
      case 'PL': // Poland
        return (
          <g>
            <rect width="32" height="16" fill="#ffffff" />
            <rect y="16" width="32" height="16" fill="#dc143c" />
          </g>
        );
      case 'UA': // Ukraine
        return (
          <g>
            <rect width="32" height="16" fill="#0057b7" />
            <rect y="16" width="32" height="16" fill="#ffd700" />
          </g>
        );
      case 'RU': // Russia
        return (
          <g>
            <rect width="32" height="10.6" fill="#ffffff" />
            <rect y="10.6" width="32" height="10.6" fill="#0039a6" />
            <rect y="21.2" width="32" height="10.8" fill="#d52b1e" />
          </g>
        );
      case 'US': // USA (Simplified)
        return (
          <g>
            <rect width="32" height="32" fill="#b22234" />
            <rect y="4" width="32" height="4" fill="#ffffff" />
            <rect y="12" width="32" height="4" fill="#ffffff" />
            <rect y="20" width="32" height="4" fill="#ffffff" />
            <rect y="28" width="32" height="4" fill="#ffffff" />
            <rect width="16" height="18" fill="#3c3b6e" />
            <circle cx="4" cy="4" r="1" fill="#ffffff" />
            <circle cx="12" cy="4" r="1" fill="#ffffff" />
            <circle cx="8" cy="9" r="1" fill="#ffffff" />
            <circle cx="4" cy="14" r="1" fill="#ffffff" />
            <circle cx="12" cy="14" r="1" fill="#ffffff" />
          </g>
        );
      case 'EU': // Europe
        return (
          <g>
            <rect width="32" height="32" fill="#003399" />
            <circle cx="16" cy="16" r="10" stroke="#ffcc00" strokeWidth="2" strokeDasharray="1 5" fill="none" />
          </g>
        );
      case 'GB': // UK (Simplified Union Jack)
        return (
          <g>
            <rect width="32" height="32" fill="#012169" />
            <path d="M0,0 L32,32 M32,0 L0,32" stroke="#ffffff" strokeWidth="6" />
            <path d="M0,0 L32,32 M32,0 L0,32" stroke="#c8102e" strokeWidth="2" />
            <path d="M16,0 L16,32 M0,16 L32,16" stroke="#ffffff" strokeWidth="10" />
            <path d="M16,0 L16,32 M0,16 L32,16" stroke="#c8102e" strokeWidth="6" />
          </g>
        );
      case 'BY': // Belarus
        return (
          <g>
            <rect width="32" height="21" fill="#d22730" />
            <rect y="21" width="32" height="11" fill="#009739" />
            <rect width="5" height="32" fill="#ffffff" />
            <path d="M0,0 L5,5 L0,10 L5,15 L0,20 L5,25 L0,30" fill="none" stroke="#d22730" strokeWidth="2" />
          </g>
        );
      case 'KZ': // Kazakhstan
        return (
          <g>
            <rect width="32" height="32" fill="#00afca" />
            <circle cx="16" cy="16" r="6" fill="#fec50c" />
          </g>
        );
      case 'JP': // Japan
        return (
          <g>
            <rect width="32" height="32" fill="#ffffff" />
            <circle cx="16" cy="16" r="10" fill="#bc002d" />
          </g>
        );
      case 'CN': // China
        return (
          <g>
            <rect width="32" height="32" fill="#de2910" />
            <text x="4" y="14" fontSize="12" fill="#ffde00">★</text>
            <text x="14" y="8" fontSize="6" fill="#ffde00">★</text>
          </g>
        );
      case 'CH': // Switzerland
        return (
          <g>
            <rect width="32" height="32" fill="#d52b1e" />
            <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
            <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
          </g>
        );
      case 'SE': // Sweden
        return (
            <g>
                <rect width="32" height="32" fill="#006aa7" />
                <rect x="10" width="6" height="32" fill="#fecc00" />
                <rect y="13" width="32" height="6" fill="#fecc00" />
            </g>
        );
      case 'NO': // Norway
        return (
            <g>
                <rect width="32" height="32" fill="#ba0c2f" />
                <rect x="10" width="6" height="32" fill="#ffffff" />
                <rect y="13" width="32" height="6" fill="#ffffff" />
                <rect x="11.5" width="3" height="32" fill="#00205b" />
                <rect y="14.5" width="32" height="3" fill="#00205b" />
            </g>
        );
       case 'DK': // Denmark
        return (
            <g>
                <rect width="32" height="32" fill="#c60c30" />
                <rect x="10" width="6" height="32" fill="#ffffff" />
                <rect y="13" width="32" height="6" fill="#ffffff" />
            </g>
        );
      case 'TR': // Turkey
        return (
            <g>
                <rect width="32" height="32" fill="#e30a17" />
                <circle cx="14" cy="16" r="8" fill="#ffffff" />
                <circle cx="16" cy="16" r="6.5" fill="#e30a17" />
                <path d="M19,16 L23,17 L22,13 L24,15 Z" fill="#ffffff" /> 
            </g>
        );
      default: // Generic or Globe
        return (
            <g>
                <circle cx="16" cy="16" r="16" fill="#475569" />
                <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="none" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M2 16h28M16 2c2.5 5 4 10 4 14s-1.5 9-4 14M16 2c-2.5 5-4 10-4 14s1.5 9 4 14" stroke="#94a3b8" strokeWidth="2" fill="none" />
            </g>
        );
    }
  };

  return (
    <div className={`rounded-full overflow-hidden inline-flex items-center justify-center bg-slate-800 shadow-sm border border-white/10 ${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            {renderSvgContent(code)}
        </svg>
    </div>
  );
};
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBaseCurrency } from '../context/BaseCurrencyContext';
import { Flag } from './Flag';
import { Language, Currency } from '../types';
import { BASE_CURRENCIES } from '../context/BaseCurrencyContext';
import { triggerHaptic } from '../utils/telegram';

const LANGUAGES: { id: Language; labelKey: 'langRu' | 'langEn' | 'langPl' }[] = [
  { id: 'pl', labelKey: 'langPl' },
  { id: 'en', labelKey: 'langEn' },
  { id: 'ru', labelKey: 'langRu' },
];

const CURRENCY_LABEL_KEYS: Record<string, 'currencyRub' | 'currencyByn' | 'currencyPln' | 'currencyUsd' | 'currencyEur'> = {
  [Currency.RUB]: 'currencyRub',
  [Currency.BYN]: 'currencyByn',
  [Currency.PLN]: 'currencyPln',
  [Currency.USD]: 'currencyUsd',
  [Currency.EUR]: 'currencyEur',
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t, language, setLanguage } = useLanguage();
  const { baseCurrency, setBaseCurrency } = useBaseCurrency();

  const handleStart = () => {
    triggerHaptic('medium');
    try {
      localStorage.setItem('fintrack_onboarding_done', '1');
    } catch {}
    onComplete();
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-slate-50">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 text-white">
        {t.onboarding.welcome}
      </h1>

      <p className="text-slate-400 text-sm mb-4 text-center">
        {t.onboarding.chooseLanguage}
      </p>
      <div className="flex gap-3 mb-8 justify-center flex-wrap">
        {LANGUAGES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setLanguage(id);
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all ${
              language === id
                ? 'border-violet-500 bg-violet-500/20 text-white'
                : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/40'
            }`}
          >
            <Flag lang={id} size={28} />
            <span className="font-medium">{t.onboarding[labelKey]}</span>
          </button>
        ))}
      </div>

      <p className="text-slate-400 text-sm mb-4 text-center">
        {t.onboarding.chooseCurrency}
      </p>
      <div className="flex gap-2 mb-10 justify-center flex-wrap">
        {BASE_CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setBaseCurrency(c);
            }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
              baseCurrency === c
                ? 'border-fuchsia-500 bg-fuchsia-500/20 text-white'
                : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/40'
            }`}
          >
            <Flag currency={c} size={24} />
            <span className="text-sm font-medium">{t.onboarding[CURRENCY_LABEL_KEYS[c]]}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg shadow-lg shadow-fuchsia-500/30 active:scale-95 transition-transform"
      >
        {t.onboarding.start}
      </button>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Currency, CurrencySymbols, CurrencyFlags } from '../types';
import { convertToPLN, getRateDisplay, convertCurrency } from '../services/currencyService';
import { useBaseCurrency } from '../context/BaseCurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import { X, Check, Globe } from 'lucide-react';
import { triggerHaptic, triggerNotification } from '../utils/telegram';
import { Flag } from './Flag';

interface AddFormProps {
  onAdd: (t: Transaction) => void;
  onClose: () => void;
}

export const AddForm: React.FC<AddFormProps> = ({ onAdd, onClose }) => {
  const { t } = useLanguage();
  
  // Create localized categories
  const categoryOptions = useMemo(() => ({
    [TransactionType.EXPENSE]: [
      t.categories.food, t.categories.cafe, t.categories.transport, t.categories.housing, t.categories.bills,
      t.categories.health, t.categories.clothes, t.categories.tech, t.categories.games, t.categories.entertainment,
      t.categories.education, t.categories.pets, t.categories.travel, t.categories.beauty, t.categories.charity, t.categories.other
    ],
    [TransactionType.INCOME]: [
      t.categories.salary, t.categories.freelance, t.categories.gift,
      t.categories.invest, t.categories.rent, t.categories.other
    ]
  }), [t]);

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const { baseCurrency } = useBaseCurrency();
  const [currency, setCurrency] = useState<Currency>(Currency.PLN);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoryOptions[TransactionType.EXPENSE][0]);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  // Update default category when type or language changes
  useEffect(() => {
    // If the currently selected category is not in the list (e.g. language changed), reset it
    if (!categoryOptions[type].includes(category)) {
        setCategory(categoryOptions[type][0]);
    }
  }, [type, t, categoryOptions]);

  // Recalculate PLN amount when amount or currency changes
  useEffect(() => {
    if (!amount) {
      setConvertedAmount(null);
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val)) return;

    if (currency === Currency.PLN) {
      setConvertedAmount(val);
    } else {
      setConvertedAmount(convertToPLN(val, currency));
    }
  }, [amount, currency]);

  const handleTypeChange = (newType: TransactionType) => {
      if (type !== newType) {
          triggerHaptic('light');
          setType(newType);
          setCategory(categoryOptions[newType][0]);
      }
  };

  const handleCategorySelect = (cat: string) => {
      if (category !== cat) {
          triggerHaptic('light');
          setCategory(cat);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title) {
        triggerNotification('error');
        return;
    }

    triggerNotification('success');

    const val = parseFloat(amount);
    const finalAmount = convertToPLN(val, currency);

    const newTransaction: Transaction = {
      id: uuidv4(),
      title,
      amount: finalAmount, // Store standardized PLN
      originalAmount: val,
      originalCurrency: currency,
      type,
      category,
      date: new Date().toISOString()
    };

    onAdd(newTransaction);
    onClose();
  };

  return (
    <div className="pb-28 animate-slide-up">
      <div className="flex justify-between items-center mb-6 pt-2">
         <h2 className="text-2xl font-bold text-white">{t.add.title}</h2>
         <button onClick={() => { triggerHaptic('light'); onClose(); }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400">
             <X size={20} />
         </button>
      </div>
      
      {/* Type Toggle */}
      <div className="bg-black/20 p-1 rounded-2xl mb-8 flex border border-white/5 relative">
        <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-700/80 rounded-xl transition-all duration-300 shadow-lg ${
                type === TransactionType.INCOME ? 'translate-x-[calc(100%+4px)] bg-emerald-600/80' : 'translate-x-0 bg-rose-600/80'
            }`} 
        />
        <button
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors relative z-10 ${
            type === TransactionType.EXPENSE ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => handleTypeChange(TransactionType.EXPENSE)}
        >
          {t.add.expense}
        </button>
        <button
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors relative z-10 ${
            type === TransactionType.INCOME ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => handleTypeChange(TransactionType.INCOME)}
        >
          {t.add.income}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Amount and Currency */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{t.add.amount}</label>
          <div className="flex gap-3">
             <div className="relative group flex-1">
                <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white text-2xl font-bold focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-700"
                required
                autoFocus
                />
             </div>
             <div className="relative w-1/3">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                   <Flag currency={currency} size={20} />
                </div>
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-10 pr-4 text-white font-bold text-lg focus:outline-none focus:border-violet-500 appearance-none text-center"
                >
                    {Object.values(Currency).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Globe size={16} />
                </div>
             </div>
          </div>
          
          {/* Conversion Preview */}
          {convertedAmount !== null && currency !== Currency.PLN && (
              <div className="mt-2 px-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{getRateDisplay(currency)}</span>
                  <span className="text-emerald-400 font-medium">
                      ≈ {convertCurrency(convertedAmount, Currency.PLN, baseCurrency).toLocaleString()} {CurrencySymbols[baseCurrency]}
                  </span>
              </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{t.add.desc}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.add.descPlaceholder}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-600"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{t.add.category}</label>
          <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-hide">
            {categoryOptions[type].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
                  category === cat
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/50 scale-105'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-fuchsia-900/30 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
        >
          <Check size={20} />
          {t.add.save} {convertedAmount ? `(${convertedAmount} zł)` : ''}
        </button>
      </form>
    </div>
  );
};

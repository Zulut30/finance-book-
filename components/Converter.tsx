import React, { useState, useEffect, useMemo } from 'react';
import { Currency, CurrencySymbols, CurrencyFlags } from '../types';
import { convertCurrency, getRateSourceInfo } from '../services/currencyService';
import { useLanguage } from '../context/LanguageContext';
import { ArrowDownUp, Search } from 'lucide-react';
import { Flag } from './Flag';

// Priority sort order: Majors -> Neighbors -> Others
const PRIORITY_CURRENCIES = [
    Currency.PLN, Currency.EUR, Currency.USD, 
    Currency.UAH, Currency.GBP, Currency.CHF
];

export const Converter: React.FC = React.memo(() => {
    const { t } = useLanguage();
    const [amount, setAmount] = useState<string>('100');
    const [from, setFrom] = useState<Currency>(Currency.PLN);
    const [to, setTo] = useState<Currency>(Currency.EUR);
    const [result, setResult] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSwap = () => {
        setFrom(to);
        setTo(from);
        setAmount(result.toFixed(2));
    };

    useEffect(() => {
        const val = parseFloat(amount);
        if (!isNaN(val)) {
            setResult(convertCurrency(val, from, to));
        } else {
            setResult(0);
        }
    }, [amount, from, to]);
    
    // Memoize the filtering and sorting to prevent heavy operations on every text input
    const otherCurrencies = useMemo(() => {
        return Object.values(Currency)
        .filter(c => c !== from)
        .filter(c => 
            searchTerm === '' || 
            c.toLowerCase().includes(searchTerm.toLowerCase()) || 
            CurrencyFlags[c].includes(searchTerm)
        )
        .sort((a, b) => {
            const idxA = PRIORITY_CURRENCIES.indexOf(a);
            const idxB = PRIORITY_CURRENCIES.indexOf(b);
            // If both are in priority list, sort by index
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            // If only a is in priority, it comes first
            if (idxA !== -1) return -1;
            // If only b is in priority, it comes first
            if (idxB !== -1) return 1;
            // Otherwise sort alphabetically
            return a.localeCompare(b);
        });
    }, [from, searchTerm]);

    return (
        <div className="pb-32 animate-fade-in flex flex-col h-full min-h-[60vh]">
            <header className="mb-6 pt-2">
                <h1 className="text-2xl font-bold text-white mb-1">{t.converter.title}</h1>
                <p className="text-slate-400 text-sm">{t.converter.subtitle} ({Object.keys(Currency).length})</p>
            </header>

            {/* Main Converter Card */}
            <div className="glass-card rounded-[2rem] p-1 border border-white/10 relative shadow-2xl mb-8">
                
                {/* From Input */}
                <div className="bg-slate-900/40 rounded-t-[1.8rem] p-5 relative transition-colors">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">{t.converter.have}</label>
                    <div className="flex items-center justify-between gap-4">
                        <input 
                            type="number" 
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-transparent text-white text-3xl font-bold focus:outline-none placeholder:text-slate-700"
                            placeholder="0"
                        />
                        <div className="relative shrink-0 flex items-center">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                <Flag currency={from} size={24} />
                            </div>
                            <select 
                                value={from}
                                onChange={(e) => setFrom(e.target.value as Currency)}
                                className="appearance-none bg-slate-800 text-white pl-11 pr-8 py-2 rounded-xl font-bold border border-white/10 outline-none focus:border-violet-500 transition-all shadow-lg min-w-[100px]"
                            >
                                {Object.values(Currency).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {/* Swap Divider */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent relative z-10 flex items-center justify-center -my-3">
                    <button 
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full bg-[#0f172a] border border-slate-700 flex items-center justify-center text-violet-400 hover:text-white hover:bg-violet-600 transition-all shadow-lg active:scale-90 active:rotate-180 duration-300 z-20"
                    >
                        <ArrowDownUp size={16} />
                    </button>
                </div>

                {/* To Input (Read Only / Selectable) */}
                <div className="bg-slate-800/30 rounded-b-[1.8rem] p-5 pt-7 relative transition-colors">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">{t.converter.get}</label>
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-3xl font-bold text-emerald-400 truncate w-full tracking-tight">
                            {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="relative shrink-0 flex items-center">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                <Flag currency={to} size={24} />
                            </div>
                            <select 
                                value={to}
                                onChange={(e) => setTo(e.target.value as Currency)}
                                className="appearance-none bg-slate-800 text-white pl-11 pr-8 py-2 rounded-xl font-bold border border-white/10 outline-none focus:border-emerald-500 transition-all shadow-lg min-w-[100px]"
                            >
                                {Object.values(Currency).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                ▼
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 font-medium text-right font-mono">
                        1 {from} ≈ {(result / parseFloat(amount || '1')).toFixed(4)} {to}
                    </div>
                </div>
            </div>

            {/* Quick Rates Overview */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4 px-1 gap-4">
                    <h3 className="text-sm font-semibold text-white pl-2 border-l-2 border-fuchsia-500 whitespace-nowrap">
                        {t.converter.ratesFor} {parseFloat(amount || '0').toLocaleString()} {from}
                    </h3>
                    <div className="relative flex-1 max-w-[120px]">
                         <input 
                            type="text" 
                            placeholder={t.converter.search} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-all"
                         />
                        <Search size={12} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
                
                <div className="space-y-2.5">
                    {otherCurrencies.map((c, index) => {
                        const val = convertCurrency(parseFloat(amount || '0'), from, c);
                        const rate = convertCurrency(1, from, c);
                        
                        return (
                            <div 
                                key={c} 
                                className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden active:scale-[0.99]"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                        <Flag currency={c} size={40} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-base flex items-center gap-2">
                                            {c}
                                            {index < 5 && searchTerm === '' && (
                                                <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 rounded uppercase tracking-wider font-semibold">
                                                    {t.converter.top}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            1 {from} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <div className="font-bold text-white tracking-wide text-lg group-hover:text-fuchsia-300 transition-colors">
                                        {val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono">
                                        {CurrencySymbols[c]}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {otherCurrencies.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            {t.converter.notFound}
                        </div>
                    )}
                </div>
                
                <div className="mt-8 text-center pb-4">
                    <p className="text-[10px] text-slate-600">
                        {getRateSourceInfo()} · {t.footer.credits}
                    </p>
                </div>
            </div>
        </div>
    );
});
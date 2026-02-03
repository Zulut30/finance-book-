import React, { useState, useMemo } from 'react';
import { Wish, CurrencySymbols, Currency } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Gift, Plus, ExternalLink, Check, Trash2, Share2 } from 'lucide-react';
import { triggerHaptic, triggerNotification, showConfirm } from '../utils/telegram';
import { v4 as uuidv4 } from 'uuid';

interface WishlistProps {
  wishes: Wish[];
  onAdd: (wish: Wish) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export const Wishlist: React.FC<WishlistProps> = ({ wishes, onAdd, onRemove, onToggle }) => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');

  // Fix: Sort creates a new array reference to avoid mutating props directly
  const sortedWishes = useMemo(() => {
    return [...wishes].sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [wishes]);

  const totalNeeded = useMemo(() => {
    return wishes
      .filter(w => !w.isCompleted)
      .reduce((acc, w) => acc + w.price, 0);
  }, [wishes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
        triggerNotification('error');
        return;
    }

    triggerNotification('success');
    
    onAdd({
        id: uuidv4(),
        title,
        price: price ? parseFloat(price) : 0,
        url: url.startsWith('http') ? url : (url ? `https://${url}` : undefined),
        isCompleted: false,
        createdAt: new Date().toISOString()
    });

    setTitle('');
    setPrice('');
    setUrl('');
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
      triggerHaptic('medium');
      showConfirm(t.wishlist.delete + '?', (confirmed) => {
          if (confirmed) {
              onRemove(id);
              triggerNotification('success');
          }
      });
  };

  const handleShare = () => {
    triggerHaptic('light');
    const activeWishes = wishes.filter(w => !w.isCompleted);
    
    if (activeWishes.length === 0) {
        triggerNotification('warning');
        return;
    }

    let message = `🎁 ${t.wishlist.title} (${totalNeeded} ${CurrencySymbols[Currency.PLN]})\n\n`;
    activeWishes.forEach((w, index) => {
        message += `${index + 1}. ${w.title} - ${w.price} ${CurrencySymbols[Currency.PLN]}\n`;
        if (w.url) {
            message += `   🔗 ${w.url}\n`;
        }
    });

    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(message)}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
        window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="pb-28 animate-fade-in flex flex-col h-full min-h-[75vh]">
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Gift className="text-pink-400" /> {t.wishlist.title}
        </h1>
        <p className="text-slate-400 text-sm">{t.wishlist.subtitle}</p>
      </header>

      {/* Summary Card */}
      <div className="glass-card p-5 rounded-3xl mb-6 flex justify-between items-center border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-pink-500 pointer-events-none">
            <Gift size={100} />
        </div>
        <div className="relative z-10">
            <h2 className="text-sm font-semibold text-slate-300 mb-1">{t.wishlist.total}</h2>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                    {totalNeeded.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">{CurrencySymbols[Currency.PLN]}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2 z-10">
            {wishes.filter(w => !w.isCompleted).length > 0 && (
                <button
                    type="button"
                    onClick={handleShare}
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    title={t.wishlist.share}
                >
                    <Share2 size={20} color="white" />
                </button>
            )}

            <button 
                type="button"
                onClick={() => {
                    triggerHaptic('light');
                    setIsFormOpen(!isFormOpen);
                }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${isFormOpen ? 'bg-slate-700 rotate-45' : 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/30'}`}
            >
                <Plus size={24} color="white" />
            </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-5 rounded-2xl border border-white/10 mb-6 animate-slide-in">
             <h3 className="text-sm font-semibold text-white mb-4">{t.wishlist.add}</h3>
             
             <div className="space-y-4">
                 <div>
                     <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t.wishlist.name}</label>
                     <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        placeholder={t.wishlist.placeholderName}
                        className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-pink-500 outline-none"
                        autoFocus
                     />
                 </div>
                 
                 <div>
                     <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t.wishlist.price}</label>
                     <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-pink-500 outline-none"
                     />
                 </div>

                 <div>
                     <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t.wishlist.link}</label>
                     <div className="relative">
                        <input 
                            type="text" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)}
                            placeholder={t.wishlist.placeholderLink}
                            className="w-full bg-black/20 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white placeholder:text-slate-600 focus:border-pink-500 outline-none"
                        />
                        <ExternalLink size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                     </div>
                 </div>

                 <button 
                    type="submit" 
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3.5 rounded-xl font-semibold transition-colors active:scale-95 mt-2"
                 >
                    {t.wishlist.save}
                 </button>
             </div>
        </form>
      )}

      {wishes.length === 0 && !isFormOpen ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 animate-float">
             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <Gift size={24} className="opacity-30" />
             </div>
             <p>{t.wishlist.empty}</p>
          </div>
      ) : (
          <div className="space-y-3">
              {sortedWishes.map(wish => (
                  <div 
                    key={wish.id} 
                    className={`glass-card p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 ${wish.isCompleted ? 'opacity-60 grayscale' : 'hover:bg-white/5'}`}
                    onClick={() => onToggle(wish.id)}
                  >
                     <div className="flex items-center gap-4 overflow-hidden">
                         <div 
                            className={`w-12 h-12 rounded-xl flex shrink-0 items-center justify-center transition-colors ${wish.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'}`}
                         >
                             {wish.isCompleted ? <Check size={24} /> : <Gift size={24} />}
                         </div>
                         <div className="min-w-0">
                             <h4 className={`font-semibold text-base truncate ${wish.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                                 {wish.title}
                             </h4>
                             <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-sm font-bold text-slate-300">
                                     {wish.price} {CurrencySymbols[Currency.PLN]}
                                 </span>
                                 {wish.url && (
                                     <a 
                                        href={wish.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-sky-300 hover:bg-white/20 transition-colors"
                                     >
                                         <ExternalLink size={10} /> Link
                                     </a>
                                 )}
                             </div>
                         </div>
                     </div>
                     
                     <div className="pl-2">
                         <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDelete(wish.id); 
                            }}
                            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                         >
                             <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
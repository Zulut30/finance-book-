import React, { useMemo, useCallback } from 'react';
import { Home, List, Plus, Gift, ArrowDownUp } from 'lucide-react';
import { TabView } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../utils/telegram';

interface NavigationProps {
  activeTab: TabView;
  setActiveTab: (tab: TabView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const handleNavClick = useCallback((tab: TabView) => {
    triggerHaptic('light');
    setActiveTab(tab);
  }, [setActiveTab]);

  const navItems = useMemo(() => [
    { id: 'dashboard', icon: Home, label: t.nav.home },
    { id: 'transactions', icon: List, label: t.nav.history },
    { id: 'add', icon: Plus, label: t.nav.add, isMain: true },
    { id: 'converter', icon: ArrowDownUp, label: t.nav.converter },
    { id: 'wishlist', icon: Gift, label: t.nav.wishlist },
  ], [t]);

  return (
    <div className="fixed bottom-6 left-0 w-full px-4 z-50 pointer-events-none">
      <div className="glass-panel max-w-sm mx-auto rounded-3xl p-2 flex justify-between items-center shadow-2xl shadow-black/50 pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.isMain) {
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNavClick(item.id as TabView)}
                className="mx-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-fuchsia-500/40 translate-y-[-10px]' 
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-indigo-500/40'
                }`}>
                  <Icon size={28} color="white" className="group-hover:rotate-90 transition-transform duration-300" />
                </div>
              </button>
            );
          }

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavClick(item.id as TabView)}
              className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {/* Optional label for mobile */}
              {/* <span className="text-[10px] font-medium">{item.label}</span> */}
            </button>
          );
        })}
      </div>
    </div>
  );
};
import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  Send,
  Zap
} from 'lucide-react';
import { NavigationTab } from '../../types/wallet';

interface BottomNavProps {
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab } = useWallet();

  const primaryTabs: { tab: NavigationTab; label: string; icon: React.ReactNode; isAccent?: boolean }[] = [
    { tab: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { tab: 'send', label: 'Send', icon: <Send className="w-5 h-5" />, isAccent: true },
    { tab: 'swap', label: 'Swap', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { tab: 'transactions', label: 'Activity', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 pb-safe pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto glass-ios-dock rounded-3xl p-1.5 shadow-2xl flex items-center justify-around">
        {primaryTabs.map(item => {
          const isActive = activeTab === item.tab;
          
          if (item.isAccent) {
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className="flex flex-col items-center justify-center p-2 relative -mt-4 active:scale-95 transition-transform"
                aria-label="Send crypto"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-tr from-indigo-500 to-violet-500 ring-2 ring-indigo-400 shadow-indigo-500/40' 
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-indigo-600/30'
                }`}>
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-indigo-300">
                  Send
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all active:scale-95 ${
                isActive 
                  ? 'text-indigo-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium leading-none tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

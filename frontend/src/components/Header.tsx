import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { haptics } from '../lib/haptics';

export function Header() {
  const location = useLocation();
  const { isConnected, address, balance, setShowModal } = useWallet();

  const navItems = [
    { label: 'Overview', path: '/' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Create Campaign', path: '/campaigns/new' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#050608]/90 backdrop-blur-2xl border-b border-white/[0.08] select-none">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            onClick={() => haptics.click()}
            className="flex items-center space-x-2.5 text-inherit no-underline group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#1a1f2c] to-[#0c0e14] border border-white/[0.1] group-hover:border-[#f59e0b]/60 flex items-center justify-center text-[#f59e0b] transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-sans font-bold tracking-tight text-base text-white group-hover:text-[#f59e0b] transition-colors">
              AdAssure
            </span>
          </Link>

          {/* 3 Main Navigation Tabs */}
          <nav className="flex items-center space-x-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs font-sans">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => haptics.tick()}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#f59e0b] text-[#050608] font-semibold shadow-sm'
                      : 'text-[#9499a8] hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Connect Wallet Button */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          {isConnected && address ? (
            <button
              onClick={() => {
                haptics.tick();
                setShowModal(true);
              }}
              className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white text-xs font-mono transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
              <span className="text-[#f59e0b] font-semibold hidden md:inline">({balance})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                haptics.click();
                setShowModal(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#050608] font-sans text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

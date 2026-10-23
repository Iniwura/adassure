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
    { label: 'Insertion Orders', path: '/campaigns' },
    { label: 'Issue Order', path: '/campaigns/new' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#0a0d14]/90 backdrop-blur-2xl border-b border-white/[0.08] select-none">
      <div className="max-w-[1360px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand Identity with Editorial Gravitas */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            onClick={() => haptics.click()}
            className="flex items-center space-x-3 text-inherit no-underline group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#182030] to-[#0d121c] border border-white/[0.12] group-hover:border-[#d4a359]/60 flex items-center justify-center text-[#d4a359] transition-colors shadow-sm">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-tight text-white group-hover:text-[#d4a359] transition-colors leading-none">
                AdAssure
              </span>
              <span className="font-mono text-[9px] text-[#9499a8] tracking-wider uppercase mt-0.5">
                Editorial Escrow Desk
              </span>
            </div>
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
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#d4a359] text-[#07090e] font-semibold shadow-xs'
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
              <span className="text-[#d4a359] font-semibold hidden md:inline">({balance})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                haptics.click();
                setShowModal(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#d4a359] hover:bg-[#b38238] text-[#07090e] font-sans text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(212,163,89,0.3)] transition-all"
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

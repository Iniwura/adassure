import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 border-t border-white/[0.08] bg-[#050608] text-xs font-mono text-[#9499a8]">
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2 text-white">
          <ShieldCheck className="w-4 h-4 text-[#f59e0b]" />
          <span className="font-bold font-sans">AdAssure</span>
          <span className="text-[#5e6475]">/</span>
          <span className="text-[#9499a8]">Autonomous Creator Sponsorship Escrow</span>
        </div>

        <div className="flex items-center space-x-6 text-[#9499a8]">
          <span>GenLayer Studionet</span>
          <a
            href="https://studio.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Explorer
          </a>
          <a
            href="https://github.com/Iniwura/adassure"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>

      </div>
    </footer>
  );
}

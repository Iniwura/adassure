import React from 'react';
import { Lock, Globe, Coins } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Lock campaign escrow',
      desc: 'Brands specify the creator address, target domain, required sponsor link, and disclosure tag, locking the payout in GEN.',
      icon: Lock,
    },
    {
      num: '02',
      title: 'Multi-validator scraping',
      desc: 'When content is published, GenLayer validator nodes scrape the live web page directly to verify links and FTC compliance.',
      icon: Globe,
    },
    {
      num: '03',
      title: 'Direct settlement',
      desc: 'Equivalence consensus confirms verification on-chain, disbursing funds directly to the creator without intermediary fees.',
      icon: Coins,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06] bg-[#07090e]">
      <div className="max-w-[1280px] mx-auto space-y-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Three steps from deliverable to settlement
          </h2>
          <p className="text-[#9499a8] text-base mt-2">
            Eliminating traditional ad network arbiters with decentralized consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16] transition-colors space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-[#9499a8]">{step.num}</div>
                <h3 className="text-lg font-bold text-white font-sans">
                  {step.title}
                </h3>
                <p className="text-sm text-[#9499a8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

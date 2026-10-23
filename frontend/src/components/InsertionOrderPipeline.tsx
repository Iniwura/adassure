import React from 'react';
import { FileCheck, Globe, ShieldCheck, Coins } from 'lucide-react';

export function InsertionOrderPipeline() {
  const stages = [
    {
      step: '01',
      title: 'Issue Insertion Order',
      desc: 'The brand locks escrow in GEN, setting the creator address, target domain, required backlink, and mandatory FTC tag (#ad).',
      icon: FileCheck,
    },
    {
      step: '02',
      title: 'Deliverable Published',
      desc: 'The creator writes, produces, and publishes the sponsored content, then submits the live URL directly to the contract.',
      icon: Globe,
    },
    {
      step: '03',
      title: 'Decentralized Scraping',
      desc: 'GenLayer validator nodes crawl the live webpage HTML, inspecting anchor tags, rel attributes, and FTC disclosures.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Zero-Fee Settlement',
      desc: 'Equivalence consensus verifies compliance on-chain. Escrow releases instantly to the creator with zero agency cuts.',
      icon: Coins,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 border-b border-white/[0.08] bg-[#070a10]">
      <div className="max-w-[1360px] mx-auto space-y-10">
        
        <div className="max-w-xl">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
            How autonomous insertion orders execute
          </h2>
          <p className="text-sm text-[#9499a8] mt-1.5 font-sans">
            A deterministic alternative to net-90 payment terms and manual agency invoice audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#d4a359]/10 border border-[#d4a359]/20 flex items-center justify-center text-[#d4a359]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs text-[#9499a8]">{st.step}</span>
                </div>
                <h3 className="font-sans font-bold text-sm text-white">
                  {st.title}
                </h3>
                <p className="text-xs text-[#9499a8] leading-relaxed font-sans">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

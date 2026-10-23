import React from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { TxProgress } from '../types';

export function TransactionBanner({
  txProgress,
  progress,
  onDismiss
}: {
  txProgress?: TxProgress;
  progress?: TxProgress;
  onDismiss: () => void;
}) {
  const current = txProgress || progress;
  if (!current || current.stage === 'IDLE') return null;

  const isAccepted = current.stage === 'ACCEPTED';
  const isFailed = current.stage === 'FAILED';

  return (
    <section className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 mt-4 relative z-30">
      <div className="p-4 rounded-xl border border-white/[0.1] bg-[#0c0e14] shadow-xl relative backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-white/[0.04] mt-0.5">
              {isAccepted ? (
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              ) : isFailed ? (
                <XCircle className="w-4 h-4 text-[#ef4444]" />
              ) : (
                <Activity className="w-4 h-4 animate-spin text-[#f59e0b]" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white">
                  {current.stage}
                </span>
                <h3 className="font-semibold text-xs text-white">{current.message}</h3>
              </div>
              {current.txHash && (
                <p className="text-xs font-mono text-[#9499a8] mt-1 flex items-center space-x-1.5">
                  <span>Tx: {current.txHash.slice(0, 10)}...{current.txHash.slice(-8)}</span>
                  <a
                    href={`https://studio.genlayer.com/transactions/${current.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#f59e0b] hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </p>
              )}
              {current.error && (
                <p className="text-xs text-[#ef4444] font-mono mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                  {current.error}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-[#9499a8] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

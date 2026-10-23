import React from 'react';
import { X, Wallet, Shield, Check, Copy } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { GENLAYER_CONFIG } from '../services/genlayer';
import { haptics } from '../lib/haptics';

export function WalletModal() {
  const {
    isConnected,
    address,
    balance,
    walletType,
    isConnecting,
    connectMetaMask,
    connectGenLayer,
    disconnect,
    showModal,
    setShowModal,
  } = useWallet();

  const [copied, setCopied] = React.useState(false);

  if (!showModal) return null;

  const handleCopy = () => {
    if (!address) return;
    haptics.tick();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0c10] border border-white/[0.1] rounded-2xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4a359]/15 border border-[#d4a359]/30 flex items-center justify-center text-[#d4a359]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-lg text-white">
                {isConnected ? 'Connected Wallet' : 'Connect Wallet'}
              </h3>
              <span className="text-[11px] font-mono text-[#9499a8]">GenLayer Studionet (Chain ID 61997)</span>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tick();
              setShowModal(false);
            }}
            className="p-1 rounded-lg text-[#9499a8] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isConnected ? (
          <div className="py-5 space-y-4 font-mono text-xs">
            {/* Account Card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-[#9499a8] text-[11px]">
                <span>PROVIDER: {walletType === 'metamask' ? 'MetaMask' : 'GenLayer Key'}</span>
                <span className="text-[#10b981] font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Address */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-white text-xs truncate max-w-[240px] font-mono">
                  {address}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[#9499a8] hover:text-white flex items-center space-x-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#10b981]" />
                      <span className="text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#9499a8]">Available Balance:</span>
                <span className="text-[#d4a359] font-bold text-sm">{balance}</span>
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                disconnect();
                setShowModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-sans font-medium transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="py-5 space-y-3">
            {/* Option 1: MetaMask / Browser Extension */}
            <button
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="w-full p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#d4a359]/40 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4a359]/10 border border-[#d4a359]/20 flex items-center justify-center text-[#d4a359]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-sans text-sm font-semibold group-hover:text-[#d4a359] transition-colors">
                    MetaMask or Injected Wallet
                  </div>
                  <div className="text-[#9499a8] text-xs">
                    Connect browser wallet to Studionet
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#9499a8] group-hover:text-white transition-colors">
                Connect
              </span>
            </button>

            {/* Option 2: GenLayer Test Account */}
            <button
              onClick={connectGenLayer}
              disabled={isConnecting}
              className="w-full p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#10b981]/40 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-sans text-sm font-semibold group-hover:text-[#10b981] transition-colors">
                    Instant Test Account
                  </div>
                  <div className="text-[#9499a8] text-xs">
                    Quick test key with Studionet test balance
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#9499a8] group-hover:text-white transition-colors">
                Generate
              </span>
            </button>

            {isConnecting && (
              <div className="text-center py-2 text-xs font-mono text-[#d4a359] animate-pulse">
                Requesting signature / connection...
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

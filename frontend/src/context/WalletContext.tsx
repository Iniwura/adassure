import React, { createContext, useContext, useState, useEffect } from 'react';
import { createAccount, createClient } from 'genlayer-js';
import { GENLAYER_CONFIG, studionetChain, formatGen } from '../services/genlayer';
import { haptics } from '../lib/haptics';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  walletType: 'metamask' | 'genlayer' | null;
  isConnecting: boolean;
  connectMetaMask: () => Promise<void>;
  connectGenLayer: () => Promise<void>;
  disconnect: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletState>({
  isConnected: false,
  address: null,
  balance: '0.0000 GEN',
  walletType: null,
  isConnecting: false,
  connectMetaMask: async () => {},
  connectGenLayer: async () => {},
  disconnect: () => {},
  showModal: false,
  setShowModal: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.0000 GEN');
  const [walletType, setWalletType] = useState<'metamask' | 'genlayer' | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // STRICTLY DISCONNECTED BY DEFAULT:
  // Only restore connection if the user previously explicitly chose to connect in this browser.
  useEffect(() => {
    const savedType = localStorage.getItem('adassure_wallet_type');
    const savedAddr = localStorage.getItem('adassure_wallet_address');
    if (savedType === 'metamask' && savedAddr) {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum
          .request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              setWalletType('metamask');
              setBalance('2.5000 GEN');
            } else {
              disconnect();
            }
          })
          .catch(() => disconnect());
      }
    } else if (savedType === 'genlayer' && savedAddr) {
      setAddress(savedAddr);
      setWalletType('genlayer');
      setBalance('1.0000 GEN');
    }
  }, []);

  async function connectMetaMask() {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const userAddr = accounts[0];
          setAddress(userAddr);
          setWalletType('metamask');
          localStorage.setItem('adassure_wallet_type', 'metamask');
          localStorage.setItem('adassure_wallet_address', userAddr);

          // Prompt switch/add GenLayer Studionet chain (Chain ID 61997 -> 0xF22D)
          try {
            await eth.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xF22D' }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await eth.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xF22D',
                    chainName: 'GenLayer Studionet',
                    rpcUrls: [GENLAYER_CONFIG.rpcUrl],
                    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
                    blockExplorerUrls: ['https://studio.genlayer.com'],
                  },
                ],
              });
            }
          }

          setBalance('2.5000 GEN');
          haptics.success();
          setShowModal(false);
        }
      } else {
        alert('MetaMask or injected Web3 wallet not detected. Please install MetaMask or use a GenLayer key.');
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }

  async function connectGenLayer() {
    setIsConnecting(true);
    try {
      let storedPk = localStorage.getItem('adassure_private_key');
      let acc;
      if (storedPk) {
        try {
          acc = createAccount(storedPk as any);
        } catch {
          acc = createAccount();
        }
      } else {
        acc = createAccount();
        if ((acc as any).privateKey) {
          localStorage.setItem('adassure_private_key', (acc as any).privateKey);
        }
      }

      const userAddr = acc.address;
      setAddress(userAddr);
      setWalletType('genlayer');
      localStorage.setItem('adassure_wallet_type', 'genlayer');
      localStorage.setItem('adassure_wallet_address', userAddr);
      setBalance('1.0000 GEN');
      haptics.success();
      setShowModal(false);
    } catch (err) {
      console.error('GenLayer account error:', err);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect() {
    haptics.tick();
    setAddress(null);
    setWalletType(null);
    setBalance('0.0000 GEN');
    localStorage.removeItem('adassure_wallet_type');
    localStorage.removeItem('adassure_wallet_address');
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!address,
        address,
        balance,
        walletType,
        isConnecting,
        connectMetaMask,
        connectGenLayer,
        disconnect,
        showModal,
        setShowModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

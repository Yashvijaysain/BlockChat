import '../styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';
import { ChatAppProvider } from '../context/ChatAppContext';

function MyApp({ Component, pageProps }) {
  // You can use 'devnet', 'testnet', or 'mainnet-beta'
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize wallets only on the client to avoid SSR import issues
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const {
      PhantomWalletAdapter,
      SolflareWalletAdapter,
      TorusWalletAdapter,
    } = require('@solana/wallet-adapter-wallets');

    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ChatAppProvider>
            <Component {...pageProps} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ChatAppProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;

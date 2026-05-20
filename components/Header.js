import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useChatApp } from '../context/ChatAppContext'
import { shortenAddress, getInitials, getGradientForAddress } from '../utils/helpers'
import { FiLogOut, FiMessageSquare } from 'react-icons/fi'
import IPFSImage from './IPFSImage'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
  }
)

const Header = () => {
  const { publicKey, disconnect } = useWallet()
  const { currentUser } = useChatApp()

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="h-full px-3 sm:px-6">
        <div className="flex h-full items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25d366] text-[#07130f] shadow-sm sm:h-10 sm:w-10">
              <FiMessageSquare className="text-lg sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight text-white sm:text-lg">Block Chat</h1>
              <p className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25d366]"></span>
                <span>Solana messaging</span>
              </p>
            </div>
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            {publicKey && currentUser ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden min-w-0 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 md:flex">
                  <div className="relative">
                    {currentUser.profilePicture ? (
                      <IPFSImage
                        ipfsHash={currentUser.profilePicture}
                        alt={currentUser.name}
                        className="h-9 w-9 rounded-full object-cover"
                        fallback={
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                            style={{ background: getGradientForAddress(publicKey.toString()) }}
                          >
                            {getInitials(currentUser.name)}
                          </div>
                        }
                      />
                    ) : (
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ background: getGradientForAddress(publicKey.toString()) }}
                      >
                        {getInitials(currentUser.name)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-tertiary)] bg-[#25d366]"></div>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-white">{currentUser.name}</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {shortenAddress(publicKey.toString())}
                    </span>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                  title="Disconnect"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

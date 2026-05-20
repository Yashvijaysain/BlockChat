import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useChatApp } from '../context/ChatAppContext'
import { shortenAddress, getInitials, getGradientForAddress } from '../utils/helpers'
import { FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi'
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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 border-b border-gray-700/50 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <FiMessageSquare className="text-white text-2xl" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Block Chat
              </h1>
              <p className="text-xs text-gray-400 hidden md:block flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span>Decentralized Messaging</span>
              </p>
            </div>
          </div>

          {/* User Info & Wallet */}
          <div className="flex items-center space-x-3">
            {publicKey && currentUser ? (
              <div className="flex items-center space-x-3">
                {/* User Profile */}
                <div className="hidden md:flex items-center space-x-3 px-4 py-2.5 rounded-xl backdrop-blur-xl bg-gray-800/50 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
                  <div className="relative">
                    {currentUser.profilePicture ? (
                      <IPFSImage
                        ipfsHash={currentUser.profilePicture}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
                        fallback={
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-indigo-500/50"
                            style={{ background: getGradientForAddress(publicKey.toString()) }}
                          >
                            {getInitials(currentUser.name)}
                          </div>
                        }
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-indigo-500/50"
                        style={{ background: getGradientForAddress(publicKey.toString()) }}
                      >
                        {getInitials(currentUser.name)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg shadow-green-400/50"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{currentUser.name}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {shortenAddress(publicKey.toString())}
                    </span>
                  </div>
                </div>

                {/* Settings Button */}
                <button
                  className="p-2.5 rounded-xl backdrop-blur-xl bg-gray-800/50 border border-gray-700/50 hover:border-indigo-500/50 hover:bg-indigo-600/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30 group"
                  title="Settings"
                >
                  <FiSettings className="text-gray-300 group-hover:text-indigo-400 text-xl transition-colors" />
                </button>

                {/* Disconnect Button */}
                <button
                  onClick={disconnect}
                  className="p-2.5 rounded-xl backdrop-blur-xl bg-gray-800/50 border border-gray-700/50 hover:border-red-500/50 hover:bg-red-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30 group"
                  title="Disconnect"
                >
                  <FiLogOut className="text-gray-300 group-hover:text-red-400 text-xl transition-colors" />
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

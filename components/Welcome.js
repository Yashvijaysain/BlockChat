import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useChatApp } from '../context/ChatAppContext'
import { FiMessageSquare, FiUsers, FiLock, FiZap, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
  }
)

const Welcome = () => {
  const { publicKey } = useWallet()
  const { createAccount, loading, appState, initializeProgram } = useChatApp()
  const [name, setName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    const result = await createAccount(name)
    if (result) {
      setName('')
      setShowForm(false)
    }
  }

  const handleInitialize = async () => {
    const result = await initializeProgram()
    if (result) {
      toast.success('Program initialized! You can now create your account.')
    }
  }

  const features = [
    {
      icon: <FiLock />,
      title: 'Secure & Decentralized',
      description: 'Built on Solana blockchain with end-to-end encryption',
    },
    {
      icon: <FiZap />,
      title: 'Lightning Fast',
      description: "Instant messaging powered by Solana's high-speed network",
    },
    {
      icon: <FiUsers />,
      title: 'Social Features',
      description: 'Add friends, share media, and send SOL directly in chat',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/50 transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                <FiMessageSquare className="text-white text-5xl" />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-2xl opacity-50 animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Solana Chat
            </span>
          </h1>

          <p className="text-xl md:text-3xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            The future of <span className="text-indigo-400 font-bold">decentralized messaging</span> is here. Connect, chat, and transact on the
            blockchain.
          </p>

          {!publicKey ? (
            <div className="flex flex-col items-center space-y-4">
              <WalletMultiButton />
              <p className="text-sm text-gray-400">Connect your Solana wallet to get started</p>
            </div>
          ) : publicKey && !appState ? (
            <div className="max-w-md mx-auto mt-8 animate-fadeIn">
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-yellow-600/10 to-orange-600/10 p-8 rounded-3xl border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
                <div className="text-center">
                  <div className="relative mx-auto mb-6 inline-block">
                    <div className="w-20 h-20 rounded-2xl bg-yellow-500/20 flex items-center justify-center backdrop-blur-xl border border-yellow-500/30">
                      <FiAlertCircle className="text-5xl text-yellow-400" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-yellow-500 blur-xl opacity-30 animate-pulse"></div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Program Not Initialized
                  </h2>
                  <p className="text-gray-300 mb-6 text-base leading-relaxed">
                    The Solana Chat program needs to be initialized before users can create accounts.
                    This is a one-time setup that must be done by the program owner.
                  </p>
                  <button
                    onClick={handleInitialize}
                    disabled={loading}
                    className="relative w-full px-6 py-4 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? 'Initializing...' : 'Initialize Program'}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
                  </button>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    Note: Only the program owner can initialize. If you're not the owner, please contact them.
                  </p>
                </div>
              </div>
            </div>
          ) : !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="relative px-10 py-5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-indigo-500/50 group"
            >
              Create Your Account
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
            </button>
          ) : (
            <div className="max-w-md mx-auto mt-8 animate-fadeIn">
              <div className="relative backdrop-blur-2xl bg-gray-900/90 p-8 rounded-3xl border-2 border-gray-700/50 shadow-2xl shadow-indigo-500/20">
                <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Create Your Profile
                </h2>

                <form onSubmit={handleCreateAccount} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-xl text-lg"
                      maxLength={32}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">{name.length}/32 characters</p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50 text-white font-bold transition-all duration-300 hover:scale-105"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="relative flex-1 px-6 py-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group backdrop-blur-xl bg-gray-900/50 p-8 rounded-3xl border-2 border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 text-center animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative mx-auto mb-6 inline-block">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl text-white shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { label: 'Fast Transactions', value: '<1s', color: 'from-blue-500 to-cyan-500' },
            { label: 'Low Fees', value: '$0.00025', color: 'from-green-500 to-emerald-500' },
            { label: 'Decentralized', value: '100%', color: 'from-purple-500 to-pink-500' },
            { label: 'Secure', value: '256-bit', color: 'from-orange-500 to-red-500' },
          ].map((stat, index) => (
            <div
              key={index}
              className="relative group backdrop-blur-xl bg-gray-900/50 p-6 rounded-2xl border-2 border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl text-center animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center animate-fadeIn">
          <div className="inline-block relative backdrop-blur-xl bg-gradient-to-br from-green-600/10 to-emerald-600/10 px-8 py-6 rounded-2xl border-2 border-green-500/30 shadow-xl shadow-green-500/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="text-green-400 text-2xl" />
              </div>
              <p className="text-gray-200 text-lg font-semibold">
                No email required. No personal data collected. Just your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome

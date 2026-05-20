import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useChatApp } from '../context/ChatAppContext'
import { FiAlertCircle, FiCheckCircle, FiLock, FiMessageSquare, FiShield, FiUsers, FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
  }
)

const previewMessages = [
  { from: 'Riya', text: 'Profile created on devnet.', side: 'left' },
  { from: 'You', text: 'Nice. Sending my wallet chat invite now.', side: 'right' },
  { from: 'Riya', text: 'Received. The chat feels instant.', side: 'left' },
]

const features = [
  { icon: <FiLock />, title: 'Wallet first', detail: 'No email or password needed.' },
  { icon: <FiZap />, title: 'Fast messages', detail: 'Built around Solana devnet transactions.' },
  { icon: <FiUsers />, title: 'Media and friends', detail: 'Create a profile, add friends, share media.' },
]

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
      toast.success('Program initialized. You can now create your account.')
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] h-[calc(100dvh-64px)] overflow-y-auto bg-[var(--bg-primary)] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <section className="flex min-h-0 min-w-0 flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 shadow-2xl shadow-black/20 sm:min-h-[560px] sm:p-8">
          <div>
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#25d366]/30 bg-[#25d366]/10 px-3 py-1.5 text-xs font-medium text-[#9ff0bd] sm:mb-8 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#25d366]"></span>
              <span className="truncate">Devnet messaging workspace</span>
            </div>

            <h2 className="max-w-2xl break-words text-[1.7rem] font-semibold leading-tight tracking-tight text-white min-[380px]:text-3xl sm:text-5xl">
              A cleaner place to chat with Solana wallets.
            </h2>
            <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-[var(--text-muted)] sm:text-lg sm:leading-7">
              Block Chat now behaves more like a modern messenger: a conversation list on the left,
              focused chat on the right, and wallet actions kept out of the way.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 sm:p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#25d366]/12 text-[#25d366] sm:h-10 sm:w-10">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{feature.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-[var(--border-color)] bg-[#0f1a20] p-3 sm:mt-10 sm:p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[#07130f] sm:h-10 sm:w-10">
                <FiMessageSquare />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">Block Chat Preview</p>
                <p className="text-xs text-[var(--text-muted)]">Connected chat layout</p>
              </div>
            </div>
            <div className="space-y-3">
              {previewMessages.map((message) => (
                <div key={message.text} className={`flex ${message.side === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[78%] sm:px-4 ${
                    message.side === 'right'
                      ? 'rounded-br-md bg-[var(--message-sent)] text-white'
                      : 'rounded-bl-md bg-[var(--message-received)] text-[var(--text-secondary)]'
                  }`}>
                    <p className="mb-1 text-xs font-semibold opacity-75">{message.from}</p>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 shadow-2xl shadow-black/20 sm:p-6">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5865f2] text-white sm:h-11 sm:w-11">
              <FiShield />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white sm:text-xl">Get started</h1>
              <p className="text-sm text-[var(--text-muted)]">Connect wallet, then create your profile.</p>
            </div>
          </div>

          {!publicKey ? (
            <div className="space-y-4">
              <WalletMultiButton />
              <p className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4 text-sm leading-6 text-[var(--text-muted)]">
                Select Phantom or another Solana wallet. Keep Phantom on Devnet for this project.
              </p>
            </div>
          ) : publicKey && !appState ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
              <div className="mb-4 flex items-start gap-3">
                <FiAlertCircle className="mt-0.5 text-2xl text-yellow-300" />
                <div>
                  <h2 className="font-semibold text-yellow-100">Program not initialized</h2>
                  <p className="mt-1 text-sm leading-6 text-yellow-100/75">
                    The deployed program needs one setup transaction before profiles can be created.
                  </p>
                </div>
              </div>
              <button
                onClick={handleInitialize}
                disabled={loading}
                className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-[#241800] hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Initializing...' : 'Initialize Program'}
              </button>
            </div>
          ) : !showForm ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowForm(true)}
                className="w-full rounded-xl bg-[#25d366] px-5 py-3.5 font-semibold text-[#07130f] hover:bg-[#35e173]"
              >
                Create your profile
              </button>
              <div className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4">
                <FiCheckCircle className="mt-0.5 text-[#25d366]" />
                <p className="text-sm leading-6 text-[var(--text-muted)]">
                  Your profile lives on-chain, and your wallet remains your identity.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Display name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input"
                  maxLength={32}
                  required
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">{name.length}/32 characters</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Welcome

import { useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useChatApp } from '../context/ChatAppContext'
import {
  getInitials,
  getGradientForAddress,
  formatTimestamp,
  isMessageFromCurrentUser,
  formatSOL,
  shortenAddress,
} from '../utils/helpers'
import { getIPFSUrl } from '../utils/pinata'
import { FiDollarSign, FiImage, FiMessageSquare, FiMoreVertical, FiMusic, FiPhone, FiVideo } from 'react-icons/fi'
import MessageInput from './MessageInput'
import IPFSImage from './IPFSImage'

const ChatWindow = () => {
  const { publicKey } = useWallet()
  const { selectedFriend, messages } = useChatApp()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const renderTime = (message, isSent) => (
    <span className={`mt-1 block text-right text-[11px] ${isSent ? 'text-emerald-100/70' : 'text-[var(--text-muted)]'}`}>
      {formatTimestamp(message.timestamp.toNumber())}
    </span>
  )

  const renderMessageContent = (message) => {
    const isSent = isMessageFromCurrentUser(message, publicKey)
    const bubbleClass = `message-bubble ${isSent ? 'sent' : 'received'}`

    if (message.msgType.text) {
      return (
        <div className={bubbleClass}>
          <p className="whitespace-pre-wrap break-words text-[15px] leading-6">{message.content}</p>
          {renderTime(message, isSent)}
        </div>
      )
    }

    if (message.msgType.image) {
      return (
        <div className={`${bubbleClass} p-2`}>
          <IPFSImage
            ipfsHash={message.content}
            alt="Shared image"
            className="max-h-80 w-full rounded-xl object-cover"
            fallback={
              <div className="flex min-h-40 items-center justify-center rounded-xl bg-black/20 p-6 text-center text-[var(--text-muted)]">
                <div>
                  <FiImage className="mx-auto mb-2 text-3xl" />
                  <p>Image unavailable</p>
                </div>
              </div>
            }
          />
          {message.metadata && <p className="px-1 pt-2 text-sm leading-6">{message.metadata}</p>}
          {renderTime(message, isSent)}
        </div>
      )
    }

    if (message.msgType.video) {
      return (
        <div className={`${bubbleClass} p-2`}>
          <video
            controls
            className="max-h-80 w-full rounded-xl"
            src={getIPFSUrl(message.content)}
          >
            Your browser does not support video playback.
          </video>
          {message.metadata && <p className="px-1 pt-2 text-sm leading-6">{message.metadata}</p>}
          {renderTime(message, isSent)}
        </div>
      )
    }

    if (message.msgType.audio) {
      return (
        <div className={bubbleClass}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#25d366]">
              <FiMusic />
            </div>
            <div>
              <p className="text-sm font-semibold">Audio message</p>
              <p className="text-xs text-[var(--text-muted)]">Voice recording</p>
            </div>
          </div>
          <audio controls className="w-full max-w-xs" src={getIPFSUrl(message.content)}>
            Your browser does not support audio playback.
          </audio>
          {message.metadata && <p className="mt-2 text-sm leading-6">{message.metadata}</p>}
          {renderTime(message, isSent)}
        </div>
      )
    }

    if (message.msgType.solTransfer) {
      return (
        <div className={`${bubbleClass} border border-[#25d366]/20`}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25d366]/15 text-[#25d366]">
              <FiDollarSign className="text-xl" />
            </div>
            <div>
              <p className="font-semibold">
                {isSent ? 'Sent' : 'Received'} {formatSOL(message.amount.toNumber())} SOL
              </p>
              <p className="text-xs text-[var(--text-muted)]">Blockchain transfer</p>
            </div>
          </div>
          {message.content && <p className="mt-3 text-sm leading-6">{message.content}</p>}
          {renderTime(message, isSent)}
        </div>
      )
    }

    return null
  }

  if (!selectedFriend) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--bg-primary)] p-8 text-center">
        <div className="max-w-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            <FiMessageSquare className="text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-white">Select a conversation</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Pick a friend from the sidebar to open a private wallet-to-wallet chat.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="flex h-full min-w-0 flex-col bg-[var(--bg-primary)]">
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            {selectedFriend.profilePicture ? (
              <IPFSImage
                ipfsHash={selectedFriend.profilePicture}
                alt={selectedFriend.name}
                className="h-11 w-11 rounded-full object-cover"
                fallback={
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: getGradientForAddress(selectedFriend.publicKey) }}
                  >
                    {getInitials(selectedFriend.name)}
                  </div>
                }
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: getGradientForAddress(selectedFriend.publicKey) }}
              >
                {getInitials(selectedFriend.name)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-secondary)] bg-[#25d366]"></span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{selectedFriend.name}</h3>
            <p className="truncate text-xs text-[var(--text-muted)]">
              Online - {shortenAddress(selectedFriend.publicKey, 6)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white" title="Voice call">
            <FiPhone />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white" title="Video call">
            <FiVideo />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white" title="More">
            <FiMoreVertical />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-5">
              <h4 className="font-semibold text-white">No messages yet</h4>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Send the first message to start this chat.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-2">
            {messages.map((message, index) => {
              const isSent = isMessageFromCurrentUser(message, publicKey)
              return (
                <div key={index} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                  {renderMessageContent(message)}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput />
    </section>
  )
}

export default ChatWindow

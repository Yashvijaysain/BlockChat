import { useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useChatApp } from '../context/ChatAppContext'
import {
  getInitials,
  getGradientForAddress,
  formatTimestamp,
  isMessageFromCurrentUser,
  formatSOL,
} from '../utils/helpers'
import { getIPFSUrl } from '../utils/pinata'
import { FiMessageSquare, FiImage, FiMusic, FiDollarSign, FiMoreVertical, FiPhone, FiVideoOff } from 'react-icons/fi'
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

  if (!selectedFriend) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 animate-fadeIn">
          <div className="relative mb-6">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl shadow-purple-500/50">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <FiMessageSquare className="text-5xl text-transparent bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text" style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
          </div>

          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Select a conversation
          </h3>
          <p className="text-gray-400 text-lg">Choose a friend from the list to start chatting</p>

          {/* Decorative Elements */}
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  const renderMessageContent = (message) => {
    const isSent = isMessageFromCurrentUser(message, publicKey)

    // Text message
    if (message.msgType.text) {
      return (
        <div className={`group relative ${isSent ? 'ml-auto' : 'mr-auto'}`} style={{ maxWidth: '75%' }}>
          <div className={`message-bubble ${isSent ? 'sent' : 'received'} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
            isSent
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30'
              : 'bg-gray-800/60 border border-gray-700/50 shadow-lg'
          }`}>
            <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{message.content}</p>
            <div className="flex items-center justify-end mt-2 space-x-1">
              <span className={`text-xs ${isSent ? 'text-indigo-200' : 'text-gray-400'}`}>
                {formatTimestamp(message.timestamp.toNumber())}
              </span>
            </div>
          </div>
          {/* Glow effect */}
          {isSent && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
          )}
        </div>
      )
    }

    // Image message
    if (message.msgType.image) {
      return (
        <div className={`group relative ${isSent ? 'ml-auto' : 'mr-auto'}`} style={{ maxWidth: '75%' }}>
          <div className={`message-bubble ${isSent ? 'sent' : 'received'} p-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
            isSent
              ? 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90 shadow-lg shadow-indigo-500/30'
              : 'bg-gray-800/60 border border-gray-700/50 shadow-lg'
          }`}>
            <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <IPFSImage
                ipfsHash={message.content}
                alt="Shared image"
                className="rounded-xl max-w-xs max-h-96 object-cover transition-transform duration-300 hover:scale-105"
                fallback={
                  <div className="rounded-xl max-w-xs p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 text-center">
                    <FiImage className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Failed to load image</p>
                  </div>
                }
              />
            </div>
            {message.metadata && <p className="mt-3 text-sm leading-relaxed">{message.metadata}</p>}
            <span className={`text-xs mt-2 block ${isSent ? 'text-indigo-200' : 'text-gray-400'}`}>
              {formatTimestamp(message.timestamp.toNumber())}
            </span>
          </div>
          {isSent && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
          )}
        </div>
      )
    }

    // Video message
    if (message.msgType.video) {
      return (
        <div className={`group relative ${isSent ? 'ml-auto' : 'mr-auto'}`} style={{ maxWidth: '75%' }}>
          <div className={`message-bubble ${isSent ? 'sent' : 'received'} p-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
            isSent
              ? 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90 shadow-lg shadow-indigo-500/30'
              : 'bg-gray-800/60 border border-gray-700/50 shadow-lg'
          }`}>
            <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <video
                controls
                className="rounded-xl max-w-xs max-h-96 w-full"
                src={getIPFSUrl(message.content)}
              >
                Your browser does not support video playback.
              </video>
            </div>
            {message.metadata && <p className="mt-3 text-sm leading-relaxed">{message.metadata}</p>}
            <span className={`text-xs mt-2 block ${isSent ? 'text-indigo-200' : 'text-gray-400'}`}>
              {formatTimestamp(message.timestamp.toNumber())}
            </span>
          </div>
          {isSent && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
          )}
        </div>
      )
    }

    // Audio message
    if (message.msgType.audio) {
      return (
        <div className={`group relative ${isSent ? 'ml-auto' : 'mr-auto'}`} style={{ maxWidth: '75%' }}>
          <div className={`message-bubble ${isSent ? 'sent' : 'received'} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
            isSent
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30'
              : 'bg-gray-800/60 border border-gray-700/50 shadow-lg'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSent
                  ? 'bg-white/20 shadow-lg'
                  : 'bg-purple-500/20 shadow-lg shadow-purple-500/30'
              }`}>
                <FiMusic className={`text-2xl ${isSent ? 'text-white' : 'text-purple-400'}`} />
              </div>
              <div>
                <span className="font-semibold block">Audio Message</span>
                <span className="text-xs opacity-75">Voice recording</span>
              </div>
            </div>
            <audio controls className="w-full max-w-xs rounded-lg" src={getIPFSUrl(message.content)}>
              Your browser does not support audio playback.
            </audio>
            {message.metadata && <p className="mt-3 text-sm leading-relaxed">{message.metadata}</p>}
            <span className={`text-xs mt-2 block ${isSent ? 'text-indigo-200' : 'text-gray-400'}`}>
              {formatTimestamp(message.timestamp.toNumber())}
            </span>
          </div>
          {isSent && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
          )}
        </div>
      )
    }

    // SOL transfer message
    if (message.msgType.solTransfer) {
      return (
        <div className={`group relative ${isSent ? 'ml-auto' : 'mr-auto'}`} style={{ maxWidth: '75%' }}>
          <div className={`message-bubble ${isSent ? 'sent' : 'received'} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
            isSent
              ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30'
              : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-green-500/30 shadow-lg shadow-green-500/20'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center relative ${
                isSent
                  ? 'bg-white/20 shadow-lg'
                  : 'bg-green-500/20 shadow-lg shadow-green-500/30'
              }`}>
                <FiDollarSign className={`text-3xl ${isSent ? 'text-white' : 'text-green-400'}`} />
                <div className="absolute inset-0 rounded-full bg-green-400 blur-lg opacity-20 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg leading-tight">
                  {isSent ? 'Sent' : 'Received'} {formatSOL(message.amount.toNumber())} SOL
                </p>
                <p className="text-xs opacity-75 mt-1 flex items-center space-x-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSent ? 'bg-white' : 'bg-green-400'}`}></span>
                  <span>Blockchain Transfer</span>
                </p>
              </div>
            </div>
            {message.content && (
              <div className={`mt-3 p-3 rounded-lg ${
                isSent ? 'bg-white/10' : 'bg-black/20'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            )}
            <span className={`text-xs mt-3 block ${isSent ? 'text-green-200' : 'text-gray-400'}`}>
              {formatTimestamp(message.timestamp.toNumber())}
            </span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Chat Header */}
      <div className="relative z-10 p-5 border-b border-gray-700/50 backdrop-blur-xl bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Friend Avatar */}
            <div className="relative">
              {selectedFriend.profilePicture ? (
                <IPFSImage
                  ipfsHash={selectedFriend.profilePicture}
                  alt={selectedFriend.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/30"
                  fallback={
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-xl"
                      style={{ background: getGradientForAddress(selectedFriend.publicKey) }}
                    >
                      {getInitials(selectedFriend.name)}
                    </div>
                  }
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-xl ring-2 ring-indigo-500/50"
                  style={{ background: getGradientForAddress(selectedFriend.publicKey) }}
                >
                  {getInitials(selectedFriend.name)}
                </div>
              )}
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg shadow-green-400/50"></div>
            </div>

            {/* Friend Info */}
            <div className="flex-1">
              <h3 className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {selectedFriend.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-sm text-green-400 font-medium">Online</p>
                </div>
                <span className="text-gray-500">•</span>
                <p className="text-sm text-gray-400">{selectedFriend.friendCount || 0} friends</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-indigo-600/50 border border-gray-700/50 hover:border-indigo-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30">
              <FiPhone className="text-gray-400 hover:text-white" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-indigo-600/50 border border-gray-700/50 hover:border-indigo-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30">
              <FiVideoOff className="text-gray-400 hover:text-white" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-indigo-600/50 border border-gray-700/50 hover:border-indigo-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30">
              <FiMoreVertical className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-xl border border-indigo-500/30 shadow-2xl">
                <FiMessageSquare className="text-5xl text-indigo-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
            </div>
            <h4 className="text-xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              No messages yet
            </h4>
            <p className="text-gray-400 text-base">Start the conversation and say hello!</p>

            {/* Decorative floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-indigo-500 rounded-full animate-pulse opacity-50"></div>
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isSent = isMessageFromCurrentUser(message, publicKey)
              return (
                <div
                  key={index}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {renderMessageContent(message)}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  )
}

export default ChatWindow

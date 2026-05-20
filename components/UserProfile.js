import { useState, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useChatApp } from '../context/ChatAppContext'
import { uploadImage } from '../utils/pinata'
import { shortenAddress, getInitials, getGradientForAddress } from '../utils/helpers'
import { FiCamera, FiUser, FiUsers, FiCopy, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import IPFSImage from './IPFSImage'

const UserProfile = ({ onClose }) => {
  const { publicKey } = useWallet()
  const { currentUser, updateProfilePicture, loading } = useChatApp()
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      toast.loading('Uploading image...')

      const result = await uploadImage(file)
      toast.dismiss()
      toast.success('Image uploaded to IPFS!')

      await updateProfilePicture(result.ipfsHash)
    } catch (error) {
      toast.dismiss()
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const copyAddress = async () => {
    if (!publicKey) return

    try {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      toast.success('Address copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }
  if (!currentUser) return null

  return (
    <div className="modal-overlay backdrop-blur-md" onClick={onClose}>
      <div className="modal-content backdrop-blur-2xl bg-gray-900/95 border-2 border-gray-700/50 shadow-2xl shadow-indigo-500/20 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Animated Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Profile Picture */}
          <div className="relative inline-block mb-8">
            <div className="relative">
              {currentUser.profilePicture ? (
                <IPFSImage
                  ipfsHash={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-40 h-40 rounded-full object-cover ring-4 ring-indigo-500/50 shadow-2xl shadow-indigo-500/30"
                  fallback={
                    <div
                      className="w-40 h-40 rounded-full flex items-center justify-center text-white font-bold text-5xl ring-4 ring-indigo-500/50 shadow-2xl"
                      style={{ background: getGradientForAddress(publicKey?.toString()) }}
                    >
                      {getInitials(currentUser.name)}
                    </div>
                  }
                />
              ) : (
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center text-white font-bold text-5xl ring-4 ring-indigo-500/50 shadow-2xl"
                  style={{ background: getGradientForAddress(publicKey?.toString()) }}
                >
                  {getInitials(currentUser.name)}
                </div>
              )}

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-2xl opacity-30 animate-pulse"></div>
            </div>

            {/* Camera Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
              className="absolute bottom-2 right-2 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 group disabled:opacity-50 disabled:cursor-not-allowed"
              title="Change profile picture"
            >
              <FiCamera className="text-white text-xl group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {currentUser.name}
          </h2>

          {/* Public Key */}
          <div
            onClick={copyAddress}
            className="inline-flex items-center space-x-3 px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-indigo-500/50 cursor-pointer hover:bg-gray-700/50 transition-all duration-300 mb-8 group"
          >
            <span className="text-gray-300 font-mono text-base font-semibold">
              {shortenAddress(publicKey?.toString(), 6)}
            </span>
            {copied ? (
              <FiCheck className="text-green-400 text-xl animate-pulse" />
            ) : (
              <FiCopy className="text-gray-400 group-hover:text-indigo-400 text-xl transition-colors" />
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="relative group backdrop-blur-xl bg-gray-800/30 p-6 rounded-2xl border-2 border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20">
              <div className="relative mx-auto mb-3 inline-block">
                <div className="w-16 h-16 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <FiUsers className="text-4xl text-indigo-400" />
                </div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {currentUser.friendCount || 0}
              </div>
              <div className="text-sm text-gray-400 font-bold">Friends</div>
            </div>

            <div className="relative group backdrop-blur-xl bg-gray-800/30 p-6 rounded-2xl border-2 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="relative mx-auto mb-3 inline-block">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FiUser className="text-4xl text-purple-400" />
                </div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Active
              </div>
              <div className="text-sm text-gray-400 font-bold">Status</div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="relative w-full px-6 py-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 group"
          >
            Close Profile
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

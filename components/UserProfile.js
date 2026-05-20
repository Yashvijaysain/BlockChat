import { useState, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useChatApp } from '../context/ChatAppContext'
import { uploadImage } from '../utils/pinata'
import { shortenAddress, getInitials, getGradientForAddress } from '../utils/helpers'
import { FiCamera, FiCheck, FiCopy, FiUsers, FiX } from 'react-icons/fi'
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
      toast.success('Image uploaded to IPFS')

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
      toast.success('Address copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy address')
    }
  }

  if (!currentUser) return null

  return (
    <div className="modal-overlay px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl shadow-black/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <p className="text-sm text-[var(--text-muted)]">Manage your Block Chat identity</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white"
            title="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {currentUser.profilePicture ? (
                <IPFSImage
                  ipfsHash={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-full object-cover"
                  fallback={
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold text-white"
                      style={{ background: getGradientForAddress(publicKey?.toString()) }}
                    >
                      {getInitials(currentUser.name)}
                    </div>
                  }
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold text-white"
                  style={{ background: getGradientForAddress(publicKey?.toString()) }}
                >
                  {getInitials(currentUser.name)}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--bg-secondary)] bg-[#25d366] text-[#07130f] hover:bg-[#35e173] disabled:cursor-not-allowed disabled:opacity-60"
                title="Change profile picture"
              >
                <FiCamera />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-2xl font-semibold text-white">{currentUser.name}</h3>
              <button
                onClick={copyAddress}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 font-mono text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                {shortenAddress(publicKey?.toString(), 6)}
                {copied ? <FiCheck className="text-[#25d366]" /> : <FiCopy />}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4">
              <FiUsers className="mb-3 text-[#25d366]" />
              <p className="text-2xl font-semibold text-white">{currentUser.friendCount || 0}</p>
              <p className="text-sm text-[var(--text-muted)]">Friends</p>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4">
              <span className="mb-3 block h-3 w-3 rounded-full bg-[#25d366]"></span>
              <p className="text-2xl font-semibold text-white">Active</p>
              <p className="text-sm text-[var(--text-muted)]">Status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-[#25d366] px-4 py-3 font-semibold text-[#07130f] hover:bg-[#35e173]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

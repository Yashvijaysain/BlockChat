import { useState, useEffect } from 'react'
import { FiX, FiSend } from 'react-icons/fi'

const MediaPreview = ({ file, type, onSend, onCancel }) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')

  useEffect(() => {
    if (!file) return

    // Create preview URL for the file
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Cleanup URL when component unmounts
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleSend = () => {
    onSend(caption)
  }

  const renderPreview = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-96 rounded-lg object-contain mx-auto"
          />
        )

      case 'video':
        return (
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-96 rounded-lg mx-auto"
          >
            Your browser does not support video playback.
          </video>
        )

      case 'audio':
        return (
          <div className="w-full max-w-md mx-auto p-8 rounded-lg glass">
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-pink-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Audio File</h3>
              <p className="text-sm text-gray-400 mb-4">{file.name}</p>
            </div>
            <audio
              src={previewUrl}
              controls
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="modal-overlay backdrop-blur-md" onClick={onCancel}>
      <div className="modal-content max-w-3xl backdrop-blur-2xl bg-gray-900/95 border-2 border-gray-700/50 shadow-2xl shadow-purple-500/20 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Animated Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent capitalize">
              Preview {type}
            </h2>
            <p className="text-sm text-gray-400 mt-1">Review your media before sending</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2.5 rounded-xl bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-110 group"
          >
            <FiX className="text-2xl text-gray-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Preview */}
        <div className="relative z-10 mb-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-xl">
          {renderPreview()}
        </div>

        {/* File Info */}
        <div className="relative z-10 mb-5 p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-400">File name</div>
              <div className="text-white font-semibold truncate">{file?.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                Size: {(file?.size / 1024 / 1024).toFixed(2)} MB • Type: {type}
              </div>
            </div>
          </div>
        </div>

        {/* Caption Input */}
        <div className="relative z-10 mb-6">
          <label className="block text-sm font-bold text-gray-300 mb-3">
            Add a caption (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-xl pr-16"
              maxLength={200}
              autoFocus
            />
            {caption.length > 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                {caption.length}/200
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50 text-white font-bold transition-all duration-300 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="relative flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 group"
          >
            <span className="flex items-center justify-center space-x-2">
              <FiSend className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Send Media</span>
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MediaPreview

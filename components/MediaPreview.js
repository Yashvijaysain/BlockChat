import { useState, useEffect } from 'react'
import { FiFile, FiMusic, FiSend, FiX } from 'react-icons/fi'

const MediaPreview = ({ file, type, onSend, onCancel }) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')

  useEffect(() => {
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const renderPreview = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={previewUrl}
            alt="Preview"
            className="mx-auto max-h-96 max-w-full rounded-xl object-contain"
          />
        )

      case 'video':
        return (
          <video
            src={previewUrl}
            controls
            className="mx-auto max-h-96 max-w-full rounded-xl"
          >
            Your browser does not support video playback.
          </video>
        )

      case 'audio':
        return (
          <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366]/12 text-[#25d366]">
                <FiMusic className="text-xl" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-white">Audio file</h3>
                <p className="truncate text-sm text-[var(--text-muted)]">{file.name}</p>
              </div>
            </div>
            <audio src={previewUrl} controls className="w-full">
              Your browser does not support audio playback.
            </audio>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="modal-overlay px-4" onClick={onCancel}>
      <div className="w-full max-w-3xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl shadow-black/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold capitalize text-white">Preview {type}</h2>
            <p className="text-sm text-[var(--text-muted)]">Review before sending.</p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white"
            title="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 rounded-xl border border-[var(--border-color)] bg-[#071116] p-4">
            {renderPreview()}
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              <FiFile />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{file?.name}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {(file?.size / 1024 / 1024).toFixed(2)} MB - {type}
              </p>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Caption
            </label>
            <div className="relative">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="input pr-16"
                maxLength={200}
                autoFocus
              />
              {caption.length > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                  {caption.length}/200
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={() => onSend(caption)} className="btn btn-primary flex-1">
              <span className="flex items-center justify-center gap-2">
                <FiSend />
                <span>Send media</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaPreview

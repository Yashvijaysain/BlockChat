import { useState, useRef } from 'react';
import { useChatApp } from '../context/ChatAppContext';
import { uploadImage, uploadVideo, uploadAudio } from '../utils/pinata';
import { FiDollarSign, FiImage, FiMusic, FiPaperclip, FiSend, FiVideo, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MediaPreview from './MediaPreview';

const MessageInput = () => {
  const { selectedFriend, sendMessage, sendMediaMessage, sendSolWithMessage, loading } = useChatApp();
  const [message, setMessage] = useState('');
  const [showSolInput, setShowSolInput] = useState(false);
  const [solAmount, setSolAmount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() && !showSolInput) {
      return;
    }

    if (showSolInput) {
      const amount = parseFloat(solAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid SOL amount');
        return;
      }

      await sendSolWithMessage(selectedFriend.publicKey, message.trim() || 'SOL Transfer', amount);
      setMessage('');
      setSolAmount('');
      setShowSolInput(false);
    } else {
      await sendMessage(selectedFriend.publicKey, message.trim());
      setMessage('');
    }
  };

  const handleFileUpload = (type) => {
    fileInputRef.current?.setAttribute('data-type', type);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = fileInputRef.current.getAttribute('data-type');
    setPreviewData({ file, type });
    e.target.value = '';
  };

  const handleSendMedia = async (caption) => {
    if (!previewData) return;

    const { file, type } = previewData;

    try {
      setUploading(true);
      setPreviewData(null);
      toast.loading('Uploading...');

      let result;
      let msgType;

      if (type === 'image') {
        result = await uploadImage(file);
        msgType = 'image';
      } else if (type === 'video') {
        result = await uploadVideo(file);
        msgType = 'video';
      } else if (type === 'audio') {
        result = await uploadAudio(file);
        msgType = 'audio';
      }

      toast.dismiss();
      await sendMediaMessage(selectedFriend.publicKey, result.ipfsHash, msgType, caption || file.name);
      toast.success('Media sent successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (!selectedFriend) return null;

  const disabled = uploading || loading;

  return (
    <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
      {showSolInput && (
        <div className="mx-auto mb-3 max-w-4xl rounded-xl border border-[#25d366]/25 bg-[#25d366]/10 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#b7f7cb]">
              <FiDollarSign />
              <span>SOL transfer</span>
            </div>
            <button
              onClick={() => {
                setShowSolInput(false);
                setSolAmount('');
              }}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white"
              type="button"
            >
              <FiX />
            </button>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            placeholder="Amount in SOL"
            className="input"
            disabled={disabled}
          />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl items-end gap-1.5 sm:gap-2">
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-tertiary)] p-1">
          <button
            type="button"
            onClick={() => handleFileUpload('image')}
            disabled={disabled}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            title="Send image"
          >
            <FiImage />
          </button>
          <button
            type="button"
            onClick={() => handleFileUpload('video')}
            disabled={disabled}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            title="Send video"
          >
            <FiVideo />
          </button>
          <button
            type="button"
            onClick={() => handleFileUpload('audio')}
            disabled={disabled}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            title="Send audio"
          >
            <FiMusic />
          </button>
          <button
            type="button"
            onClick={() => setShowSolInput(!showSolInput)}
            disabled={disabled}
            className={`flex h-10 w-10 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50 ${
              showSolInput
                ? 'bg-[#25d366] text-[#07130f]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white'
            }`}
            title="Send SOL"
          >
            <FiDollarSign />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-[var(--bg-tertiary)] px-3 py-2">
          <FiPaperclip className="hidden text-[var(--text-muted)] sm:block" />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={showSolInput ? 'Add a note...' : 'Message'}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-[var(--text-muted)] focus:outline-none"
            maxLength={500}
            disabled={disabled}
          />
          {message.length > 0 && (
            <span className="hidden text-xs text-[var(--text-muted)] sm:block">
              {message.length}/500
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={(!message.trim() && !showSolInput) || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[#07130f] hover:bg-[#35e173] disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-muted)] sm:h-12 sm:w-12"
          title="Send"
        >
          <FiSend className="text-lg" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />
      </form>

      {previewData && (
        <MediaPreview
          file={previewData.file}
          type={previewData.type}
          onSend={handleSendMedia}
          onCancel={() => setPreviewData(null)}
        />
      )}
    </div>
  );
};

export default MessageInput;

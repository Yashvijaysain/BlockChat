import { useState, useRef } from 'react';
import { useChatApp } from '../context/ChatAppContext';
import { uploadImage, uploadVideo, uploadAudio } from '../utils/pinata';
import { FiSend, FiImage, FiVideo, FiMusic, FiDollarSign, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MediaPreview from './MediaPreview';

const MessageInput = () => {
  const { selectedFriend, sendMessage, sendMediaMessage, sendSolWithMessage, loading } = useChatApp();
  const [message, setMessage] = useState('');
  const [showSolInput, setShowSolInput] = useState(false);
  const [solAmount, setSolAmount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null); // { file, type }
  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() && !showSolInput) {
      return;
    }

    if (showSolInput) {
      // Send SOL with message
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
      // Send text message
      await sendMessage(selectedFriend.publicKey, message.trim());
      setMessage('');
    }
  };

  const handleFileUpload = async (type) => {
    fileInputRef.current?.click();
    fileInputRef.current.setAttribute('data-type', type);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = fileInputRef.current.getAttribute('data-type');

    // Show preview modal
    setPreviewData({ file, type });

    // Reset file input
    e.target.value = '';
  };

  const handleSendMedia = async (caption) => {
    if (!previewData) return;

    const { file, type } = previewData;

    try {
      setUploading(true);
      setPreviewData(null); // Close preview
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
      toast.success('Media sent successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
  };

  if (!selectedFriend) return null;

  return (
    <div className="relative z-10 p-5 border-t border-gray-700/50 backdrop-blur-xl bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 shadow-2xl">
      {/* SOL Transfer Input */}
      {showSolInput && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/50 backdrop-blur-xl animate-fadeIn shadow-lg shadow-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FiDollarSign className="text-green-400" />
              </div>
              <span className="text-sm font-bold text-green-400">Send SOL Transfer</span>
            </div>
            <button
              onClick={() => {
                setShowSolInput(false);
                setSolAmount('');
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors group"
            >
              <FiX className="text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            placeholder="Amount in SOL (e.g., 0.5)"
            className="w-full px-4 py-3 bg-gray-800/50 border border-green-500/30 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 backdrop-blur-xl font-semibold"
            disabled={uploading || loading}
          />
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
        {/* Media Buttons */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleFileUpload('image')}
            disabled={uploading || loading}
            className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 group"
            title="Send Image"
          >
            <FiImage className="text-xl text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => handleFileUpload('video')}
            disabled={uploading || loading}
            className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 group"
            title="Send Video"
          >
            <FiVideo className="text-xl text-purple-400 group-hover:scale-110 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => handleFileUpload('audio')}
            disabled={uploading || loading}
            className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30 group"
            title="Send Audio"
          >
            <FiMusic className="text-xl text-pink-400 group-hover:scale-110 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => setShowSolInput(!showSolInput)}
            disabled={uploading || loading}
            className={`p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 group ${
              showSolInput
                ? 'bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-2 border-green-500/50 shadow-lg shadow-green-500/30'
                : 'bg-gray-800/50 border border-gray-700/50 hover:border-green-500/50 hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/30'
            }`}
            title="Send SOL"
          >
            <FiDollarSign className={`text-xl transition-transform group-hover:scale-110 ${
              showSolInput ? 'text-green-400' : 'text-green-400'
            }`} />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={showSolInput ? 'Optional message...' : 'Type a message...'}
            className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-xl pr-16"
            maxLength={500}
            disabled={uploading || loading}
          />
          {message.length > 0 && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
              {message.length}/500
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !showSolInput) || uploading || loading}
          className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/50 group"
          title="Send"
        >
          <FiSend className="text-xl text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />
      </form>

      {/* Media Preview Modal */}
      {previewData && (
        <MediaPreview
          file={previewData.file}
          type={previewData.type}
          onSend={handleSendMedia}
          onCancel={handleCancelPreview}
        />
      )}
    </div>
  );
};

export default MessageInput;

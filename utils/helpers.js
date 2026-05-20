import moment from 'moment';

// Shorten wallet address
export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Format timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';

  const date = moment.unix(timestamp);
  const now = moment();

  if (now.diff(date, 'days') === 0) {
    return date.format('HH:mm');
  } else if (now.diff(date, 'days') === 1) {
    return 'Yesterday';
  } else if (now.diff(date, 'days') < 7) {
    return date.format('dddd');
  } else {
    return date.format('MMM DD, YYYY');
  }
};

// Format full date
export const formatFullDate = (timestamp) => {
  if (!timestamp) return '';
  return moment.unix(timestamp).format('MMMM DD, YYYY HH:mm');
};

// Format SOL amount
export const formatSOL = (lamports, decimals = 4) => {
  if (!lamports) return '0';
  const sol = lamports / 1000000000; // LAMPORTS_PER_SOL
  return sol.toFixed(decimals);
};

// Validate Solana public key
export const isValidPublicKey = (address) => {
  try {
    if (!address) return false;
    // Basic validation - Solana addresses are 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Get message type display name
export const getMessageTypeDisplay = (msgType) => {
  if (msgType.text) return 'Text';
  if (msgType.image) return 'Image';
  if (msgType.video) return 'Video';
  if (msgType.audio) return 'Audio';
  if (msgType.solTransfer) return 'SOL Transfer';
  return 'Unknown';
};

// Check if message is from current user
export const isMessageFromCurrentUser = (message, currentUserPublicKey) => {
  if (!message || !currentUserPublicKey) return false;
  return message.sender.toString() === currentUserPublicKey.toString();
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Generate random gradient for avatar
export const getGradientForAddress = (address) => {
  if (!address) return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
  ];

  const index = parseInt(address.slice(0, 8), 16) % gradients.length;
  return gradients[index];
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if user is online (placeholder - you can enhance with WebSocket)
export const isUserOnline = (lastSeen) => {
  if (!lastSeen) return false;
  const now = moment();
  const lastSeenMoment = moment.unix(lastSeen);
  return now.diff(lastSeenMoment, 'minutes') < 5;
};

// Sort messages by timestamp
export const sortMessagesByTimestamp = (messages) => {
  return [...messages].sort((a, b) => a.timestamp - b.timestamp);
};

// Sort friends by last message time
export const sortFriendsByLastMessage = (friends) => {
  return [...friends].sort((a, b) => {
    const aTime = a.lastMessageTime || 0;
    const bTime = b.lastMessageTime || 0;
    return bTime - aTime;
  });
};

// Get explorer URL
export const getExplorerUrl = (signature, cluster = 'devnet') => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

// Get address explorer URL
export const getAddressExplorerUrl = (address, cluster = 'devnet') => {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
};

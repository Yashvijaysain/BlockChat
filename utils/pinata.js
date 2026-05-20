import axios from 'axios';

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// Alternative IPFS gateways for fallback
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

// Upload file to IPFS via Pinata
export const uploadFileToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/pinata/file', formData);

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      url: `${PINATA_GATEWAY}${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload file to IPFS');
  }
};

// Upload JSON data to IPFS via Pinata
export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const response = await axios.post('/api/pinata/json', jsonData);

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      url: `${PINATA_GATEWAY}${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload JSON to IPFS');
  }
};

// Get file from IPFS
export const getFromIPFS = async (ipfsHash) => {
  try {
    const url = `${PINATA_GATEWAY}${ipfsHash}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch from IPFS');
  }
};

// Get IPFS URL with fallback gateways
export const getIPFSUrl = (ipfsHash, gatewayIndex = 0) => {
  if (!ipfsHash) return '';

  // Use the specified gateway or default to the first one
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}${ipfsHash}`;
};

// Get all possible IPFS URLs for fallback
export const getAllIPFSUrls = (ipfsHash) => {
  if (!ipfsHash) return [];
  return IPFS_GATEWAYS.map(gateway => `${gateway}${ipfsHash}`);
};

// Validate file size (max 100MB)
export const validateFileSize = (file, maxSizeMB = 100) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
  return true;
};

// Validate file type
export const validateFileType = (file, allowedTypes) => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }
  return true;
};

// Get file type from MIME type
export const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
};

// Allowed file types for different categories
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

// Upload image with validation
export const uploadImage = async (file) => {
  validateFileSize(file, 4); // Vercel serverless request limit
  validateFileType(file, ALLOWED_IMAGE_TYPES);
  return await uploadFileToIPFS(file);
};

// Upload video with validation
export const uploadVideo = async (file) => {
  validateFileSize(file, 4); // Vercel serverless request limit
  validateFileType(file, ALLOWED_VIDEO_TYPES);
  return await uploadFileToIPFS(file);
};

// Upload audio with validation
export const uploadAudio = async (file) => {
  validateFileSize(file, 4); // Vercel serverless request limit
  validateFileType(file, ALLOWED_AUDIO_TYPES);
  return await uploadFileToIPFS(file);
};

import React, { useState } from 'react'
import { getAllIPFSUrls } from '../utils/pinata'

const IPFSImage = ({ ipfsHash, alt, className, fallback }) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [hasError, setHasError] = useState(false)

  if (!ipfsHash || hasError) {
    return fallback || null
  }

  const urls = getAllIPFSUrls(ipfsHash)

  const handleError = () => {
    // Try next gateway
    if (currentUrlIndex < urls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1)
    } else {
      // All gateways failed, show fallback
      setHasError(true)
    }
  }

  return (
    <img
      src={urls[currentUrlIndex]}
      alt={alt}
      className={className}
      onError={handleError}
      crossOrigin="anonymous"
    />
  )
}

export default IPFSImage

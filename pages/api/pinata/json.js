export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

const getPinataHeaders = () => {
  if (process.env.PINATA_JWT) {
    return {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      'Content-Type': 'application/json',
    };
  }

  if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
    return {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      'Content-Type': 'application/json',
    };
  }

  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeaders = getPinataHeaders();
  if (!authHeaders) {
    res.status(500).json({ error: 'Pinata credentials are not configured on the server' });
    return;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data?.error || 'Failed to upload JSON to IPFS' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Pinata JSON upload failed:', error);
    res.status(500).json({ error: 'Failed to upload JSON to IPFS' });
  }
}

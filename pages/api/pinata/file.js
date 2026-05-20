export const config = {
  api: {
    bodyParser: false,
  },
};

const getPinataHeaders = () => {
  if (process.env.PINATA_JWT) {
    return {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    };
  }

  if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
    return {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
    };
  }

  return null;
};

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const maxSize = 4 * 1024 * 1024;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        reject(new Error('File is too large'));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

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
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('multipart/form-data')) {
      res.status(400).json({ error: 'Expected multipart form data' });
      return;
    }

    const body = await readRawBody(req);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': contentType,
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data?.error || 'Failed to upload file to IPFS' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Pinata file upload failed:', error);
    res.status(500).json({ error: 'Failed to upload file to IPFS' });
  }
}

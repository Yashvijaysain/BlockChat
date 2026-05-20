# BlockChat

Decentralized chat app built with Next.js, Solana wallet adapter, Anchor, and Pinata-backed IPFS media uploads.

## Deploy

1. Import this repository into Vercel.
2. Set the build command to `npm run build`.
3. Add these environment variables in Vercel:

```env
NEXT_PUBLIC_PROGRAM_ID=51TsZDgA6j8wp1zPSxTga6oLW6gj1kqxAbQQu6FxaWmn
NEXT_PUBLIC_CONTRACT_DEPLOYER_ADDRESS_ADMIN=E8YfFJutWYW5WrWg98wMgtdrXzGwHsNgpy3MNAAbxQKo
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_JWT=your_pinata_jwt
```

`PINATA_JWT`, `PINATA_API_KEY`, and `PINATA_SECRET_KEY` are server-only. Do not create `NEXT_PUBLIC_` versions for Pinata secrets.

Media uploads are proxied through Next.js API routes so Pinata credentials stay private. On Vercel, keep uploaded files under 4 MB unless you replace this with a signed direct-upload flow.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 3001
```

Open `http://localhost:3001`.

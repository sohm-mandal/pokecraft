import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube.com https://youtube.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig

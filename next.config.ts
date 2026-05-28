import type { NextConfig } from 'next'

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8080'

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ]
  },
}

export default nextConfig

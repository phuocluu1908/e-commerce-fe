import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/cart/:path*',
          destination: 'http://localhost:5173/cart/:path*',
        },
        {
          source: '/cart',
          destination: 'http://localhost:5173/cart',
        },
        {
          source: '/account/:path*',
          destination: 'http://localhost:5174/account/:path*',
        },
        {
          source: '/account',
          destination: 'http://localhost:5174/account',
        },
        {
          source: '/admin/:path*',
          destination: 'http://localhost:5175/admin/:path*',
        },
        {
          source: '/admin',
          destination: 'http://localhost:5175/admin',
        },
      ],
    };
  },
};

export default nextConfig;

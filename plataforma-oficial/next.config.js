// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better dev experience
  reactStrictMode: true,
  // Rewrites to proxy '/nextapi/*' to the actual API routes under '/api/*'
  async rewrites() {
    return [
      {
        source: '/nextapi/:path*',
        destination: '/api/:path*', // will map to src/app/api/*
      },
    ];
  },
  // Optional: custom headers for security and CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

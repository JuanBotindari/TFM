import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignora los errores de ESLint durante el despliegue
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora los errores de TypeScript durante el despliegue
    ignoreBuildErrors: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/pyapi/:path*',
          destination: 'http://127.0.0.1:8000/pyapi/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

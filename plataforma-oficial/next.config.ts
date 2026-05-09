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
};

export default nextConfig;

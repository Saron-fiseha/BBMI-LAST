import path from 'path';
import { fileURLToPath } from 'url';

/** Fix __dirname in ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: '',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true, // valid boolean in Next.js 15
    optimizeCss: true,
  },
  images: {
    domains: ['images.unsplash.com', 'placeholder.svg'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Set up @ alias to project root
    config.resolve.alias['@'] = path.resolve(__dirname);

    // Polyfill Node built-ins for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;

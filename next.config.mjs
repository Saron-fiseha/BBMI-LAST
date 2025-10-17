import path from 'path';

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
  serverComponentsExternalPackages: ['bcryptjs'],
  experimental: {
    serverActions: true,
    optimizeCss: true,
  },
  images: {
    domains: ['images.unsplash.com', 'placeholder.svg'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Alias @ to project root
    config.resolve.alias['@'] = path.resolve(__dirname);

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

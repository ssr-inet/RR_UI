import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        "**/node_modules/**",
        "**/.next/**",
        "**/C:/Users/Sathyaswaruban/Application Data/**",
        "**/C:/Users/Sathyaswaruban/Cookies/**",
        "**/C:/Users/Sathyaswaruban/**",
      ],
    };
    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile monorepo packages
  transpilePackages: [
    '@ivylevel/agents',
    '@ivylevel/data-loaders',
    '@ivylevel/rendering',
    '@ivylevel/schema',
    '@ivylevel/rag',
    '@ivylevel/llm',
    '@ivylevel/adapters',
  ],
  // Allow importing from parent directories
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@artemis/types', '@artemis/db'],
  experimental: {
    typedRoutes: false
  }
};

module.exports = nextConfig;

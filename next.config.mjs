/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This will disable ESLint checks during the build
  },
};

export default nextConfig;
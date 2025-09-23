/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/ecidade/:path*',
        destination: `${process.env.ECIDADE_API_URL || 'http://localhost:8000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

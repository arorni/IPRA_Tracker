/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from Replit proxy
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;

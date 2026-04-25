/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://mithun41.pythonanywhere.com/", // তোমার actual backend domain
      },
    ],
  },
};
export default nextConfig;

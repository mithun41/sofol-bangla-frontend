/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "mithun41.pythonanywhere.com",
        pathname: "/media/**",
      },
    ],
  },
  // eslint এবং typescript এর অপশনগুলো বাদ দিয়ে দাও যদি ওগুলো ওয়ার্নিং দেয়
};

export default nextConfig;

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
        port: "", // PythonAnywhere এ পোর্ট লাগে না
        pathname: "/media/**",
      },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ibb.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;

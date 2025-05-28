/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',           // Đường dẫn gốc
        destination: '/home',  // Đường dẫn bạn muốn chuyển đến
        permanent: true,       // Chuyển hướng vĩnh viễn (301)
      },
    ];
  },

  // 👇 Thêm đoạn này để React-PDF không bị lỗi "Module not found: Can't resolve 'canvas'"
  webpack: (config) => {
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf';
    config.resolve.alias.canvas = false;
    return config;
  }
};

export default nextConfig;

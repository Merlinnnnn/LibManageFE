/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/', // Đường dẫn gốc
          destination: '/home', // Đường dẫn bạn muốn chuyển đến
          permanent: true, // Chuyển hướng vĩnh viễn (301) hoặc tạm thời (302)
        },
      ];
    },
  };
  
  export default nextConfig;
  
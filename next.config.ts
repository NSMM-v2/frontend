// next.config.js
import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/csddd/:path*', // 프론트엔드가 요청하는 경로
        destination: 'http://localhost:8083/api/v1/csddd/:path*' // 실제 백엔드 서비스 주소
      }
    ]
  }
}

export default nextConfig

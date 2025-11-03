/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // ✅ Validar ESLint en builds
  },
  typescript: {
    ignoreBuildErrors: false, // ✅ Validar TypeScript en builds
  },
  images: {
    unoptimized: true, // Mantener temporalmente hasta verificar dominios
  },
}

export default nextConfig

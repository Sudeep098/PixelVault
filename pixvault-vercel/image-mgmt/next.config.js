/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  api: {
    bodyParser: false,
  },
}

module.exports = nextConfig

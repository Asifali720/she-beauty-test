/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,

  env: {
    mongoUrl: process.env.DB_URL,

    DOMAIN: process.env.PUBLIC_URL,

    productionMongoUrl: process.env.PRODUCTION_DB_URL,

    TOKEN_SECRET: process.env.TOKEN_ENV_SECRET,
    REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_ENV_SECRET
  },

  // TODO: below line is added to resolve twice event dispatch in the calendar reducer
  reactStrictMode: false,

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
  },
  images: {
    domains: ['shebeauty-erp.netlify.app', 'firebasestorage.googleapis.com', 'cdn.shopify.com', 'plus.unsplash.com']
  }
  // webpack: config => {
  //   config.module.rules.push({
  //     test: /\.m?js/,
  //     resolve: {
  //       fullySpecified: false
  //     }
  //   })

  //   config.ignoreWarnings = [
  //     {
  //       module: /node_modules\/undici/,
  //       message: /Unexpected token/
  //     }
  //   ]

  //   return config
  // }
}

module.exports = nextConfig

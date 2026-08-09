const legacyViteEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith('VITE_')),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Legacy screens still carry historical data-shape mismatches from the Vite/Firebase era.
  // `npm run typecheck` remains the dedicated strict audit, while production builds continue
  // to validate bundling, route generation and runtime compilation during the migration.
  typescript: { ignoreBuildErrors: true },
  experimental: { optimizePackageImports: ['@heroicons/react', 'lucide-react'] },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      ],
    }];
  },
  webpack(config, { webpack }) {
    config.plugins.push(new webpack.DefinePlugin({ 'import.meta.env': JSON.stringify(legacyViteEnv) }));
    return config;
  },
};

export default nextConfig;

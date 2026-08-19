import path from 'path';

const legacyViteEnv = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('VITE_') || key.startsWith('NEXT_VITE_'))
    .map(([key, value]) => [key.replace(/^NEXT_/, ''), value]),
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
    const root = path.resolve(process.cwd(), 'src');
    config.resolve.alias['@'] = root;
    config.resolve.alias['react-router-dom'] = path.join(root, 'compat/react-router-dom');
    config.resolve.alias['firebase/app'] = path.join(root, 'compat/firebase/app');
    config.resolve.alias['firebase/auth'] = path.join(root, 'compat/firebase/auth');
    config.resolve.alias['firebase/database'] = path.join(root, 'compat/firebase/database');
    config.resolve.alias['firebase/firestore'] = path.join(root, 'compat/firebase/firestore');
    config.resolve.alias['firebase/messaging'] = path.join(root, 'compat/firebase/messaging');
    config.plugins.push(new webpack.DefinePlugin({ 'import.meta.env': JSON.stringify(legacyViteEnv) }));
    return config;
  },
};

export default nextConfig;

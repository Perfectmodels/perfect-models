import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'local-api',
        configureServer(server) {
          server.middlewares.use('/api/send-email', async (req, res) => {
            if (req.method !== 'POST') {
              res.writeHead(405); res.end(JSON.stringify({ error: 'Method not allowed' })); return;
            }
            const chunks: Buffer[] = [];
            req.on('data', (c: Buffer) => chunks.push(c));
            req.on('end', async () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString());
                const { to, subject, htmlContent, replyTo } = body;
                if (!to?.length || !subject || !htmlContent) {
                  res.writeHead(400); res.end(JSON.stringify({ error: 'Missing fields' })); return;
                }
                const apiKey = env.BREVO_API_KEY;
                if (!apiKey) {
                  res.writeHead(500); res.end(JSON.stringify({ error: 'BREVO_API_KEY not set' })); return;
                }
                const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
                  body: JSON.stringify({
                    sender: { name: 'Perfect Models Management', email: env.DEFAULT_FROM_EMAIL || 'contact@perfectmodels.online' },
                    to,
                    subject,
                    htmlContent,
                    ...(replyTo ? { replyTo } : {}),
                  }),
                });
                const data = await brevoRes.json().catch(() => ({}));
                res.writeHead(brevoRes.ok ? 200 : brevoRes.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(brevoRes.ok ? { success: true } : { error: (data as any).message || 'Brevo error' }));
              } catch (e: any) {
                res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
              }
            });
          });
        },
      },
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-firebase-app': ['firebase/app'],
            'vendor-firebase-auth': ['firebase/auth'],
            'vendor-firebase-db': ['firebase/database'],
            'vendor-firebase-firestore': ['firebase/firestore'],
            'vendor-firebase-messaging': ['firebase/messaging'],
            'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
            'vendor-html2canvas': ['html2canvas'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
    },
    resolve: {
      conditions: ['import', 'module', 'browser', 'default', 'require'],
    },
  }
})

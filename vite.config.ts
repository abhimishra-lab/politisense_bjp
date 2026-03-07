import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const n8nTarget = env.VITE_N8N_WEBHOOK_URL ?? '';
  const n8nBriefingTarget = env.VITE_N8N_BRIEFING_WEBHOOK ?? '';

  // Extract origin and pathname separately for correct proxy routing
  const parseProxyTarget = (fullUrl: string) => {
    if (!fullUrl) return { origin: '', pathname: '/' };
    try {
      const u = new URL(fullUrl);
      return { origin: u.origin, pathname: u.pathname };
    } catch {
      return { origin: fullUrl, pathname: '/' };
    }
  };
  const n8nBriefing = parseProxyTarget(n8nBriefingTarget);
  const n8nWebhook = parseProxyTarget(n8nTarget);

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['xlsx'],
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    server: {
      proxy: {
        ...(n8nTarget ? {
          '/n8n-webhook': {
            target: n8nWebhook.origin,
            changeOrigin: true,
            rewrite: () => n8nWebhook.pathname,
            secure: true,
          },
        } : {}),
        ...(n8nBriefingTarget ? {
          '/n8n-brief': {
            target: n8nBriefing.origin,
            changeOrigin: true,
            rewrite: () => n8nBriefing.pathname,
            secure: true,
          },
        } : {}),
      },
    },
  };
});


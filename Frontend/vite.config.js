import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://rpi.truexplainer.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('Proxying request to:', path);
          return path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending request to target:', {
              method: req.method,
              url: req.url,
              headers: req.headers,
              body: req.body
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response from target:', {
              statusCode: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              url: req.url,
              headers: proxyRes.headers
            });
          });
        }
      }
    }
  }
})

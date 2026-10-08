import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json' with { type: 'json' }

const base = new URL(packageJson.homepage).pathname.replace(/\/?$/, '/')

const apacheSpaFallback = {
  name: 'apache-spa-fallback',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: '.htaccess',
      source: [
        'DirectoryIndex index.html',
        'RewriteEngine On',
        `RewriteBase ${base}`,
        'RewriteCond %{REQUEST_FILENAME} -f [OR]',
        'RewriteCond %{REQUEST_FILENAME} -d',
        'RewriteRule ^ - [L]',
        'RewriteRule ^ index.html [L]'
      ].join('\n')
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), apacheSpaFallback],
})

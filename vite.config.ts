import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Derive correct base for GitHub Pages project sites
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? '';
  const isGhPagesBuild = Boolean(process.env.GITHUB_REPOSITORY);
  const base = isGhPagesBuild && repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/';

  return {
    base,
    esbuild: {
      charset: 'utf8',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});

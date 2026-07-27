import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const pkg = (name: string) =>
  fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@monarch/shared': pkg('shared'),
      '@monarch/pal-compiler': pkg('pal-compiler'),
    },
  },
});

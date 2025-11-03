import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'tasks/index': 'src/tasks/index.ts',
    'subagents/index': 'src/subagents/index.ts',
    'subagents/metadata': 'src/subagents/metadata.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  shims: true,
  outDir: 'dist',
});

const esbuild = require('esbuild');
const path = require('path');

const production = process.env.NODE_ENV === 'production';

const baseConfig = {
  bundle: true,
  minify: production,
  sourcemap: !production,
  target: 'ES2020',
  format: 'cjs',
  external: ['vscode'], // VS Code runtime provides vscode
  loader: {
    '.node': 'file',
  },
  define: {
    'process.env.NODE_ENV': production ? '"production"' : '"development"',
  },
};

const main = esbuild.buildSync({
  ...baseConfig,
  entryPoints: [path.join(__dirname, 'src', 'extension.ts')],
  outfile: path.join(__dirname, 'dist', 'extension.js'),
});

console.log('Build complete:', main);

#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = [
  '--loader', 
  '@esbuild-kit/esm-loader',
  join(__dirname, 'server/index.ts')
];

const env = {
  ...process.env,
  NODE_ENV: 'development'
};

const child = spawn('node', args, {
  stdio: 'inherit',
  env,
  cwd: __dirname
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start development server:', err);
  process.exit(1);
});
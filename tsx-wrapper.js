#!/usr/bin/env node
// Wrapper script to replace tsx functionality with esbuild-kit loader
const { spawn } = require('child_process');
const { join } = require('path');

// Get the TypeScript file from arguments
const tsFile = process.argv[2];

if (!tsFile) {
  console.error('Usage: node tsx-wrapper.js <typescript-file>');
  process.exit(1);
}

const args = [
  '--loader', 
  '@esbuild-kit/esm-loader',
  tsFile
];

const child = spawn('node', args, {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
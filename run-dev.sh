#!/bin/bash
cd /home/runner/workspace
export NODE_ENV=development
node --loader @esbuild-kit/esm-loader server/index.ts
#!/usr/bin/env node
/**
 * Runs the website and the booking server together.
 *
 *   npm run dev:full
 *
 * Vite serves the site on 5173 and proxies /api to the booking server on 8787,
 * so `VITE_API_BASE=/api` works in development exactly as it will in
 * production. No extra dependency: two child processes and one signal handler.
 */

import { spawn } from 'node:child_process';

const children = [];

function run(name, command, args, env = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
    shell: process.platform === 'win32',
  });

  const prefix = `[${name}]`;
  const pipe = (stream, to) => {
    stream.on('data', (chunk) => {
      for (const line of String(chunk).split('\n')) {
        if (line.trim()) to.write(`${prefix} ${line}\n`);
      }
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code) => {
    console.log(`${prefix} exited with code ${code}`);
    // If either half dies the pair is useless, so take the other down too
    // rather than leaving a half-working setup that is confusing to debug.
    shutdown(code ?? 0);
  });

  children.push(child);
  return child;
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 120);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting the booking server and the site.\n');

run('api ', process.execPath, ['api/server.mjs'], {
  PORT: process.env.PORT ?? '8787',
  KM_SITE_ORIGIN: process.env.KM_SITE_ORIGIN ?? 'http://localhost:5173',
});

run('site', 'npx', ['vite'], {
  VITE_API_BASE: process.env.VITE_API_BASE ?? '/api',
});

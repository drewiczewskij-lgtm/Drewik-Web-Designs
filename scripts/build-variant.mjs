#!/usr/bin/env node
/**
 * Builds one of the alternative outputs, on any operating system.
 *
 *   node scripts/build-variant.mjs static   → dist/, for plain static hosting
 *   node scripts/build-variant.mjs single   → one double-clickable HTML file
 *
 * This exists because `VITE_ROUTER=hash npm run build` is shell syntax that
 * only works in bash. In PowerShell it fails with "The term 'VITE_ROUTER=hash'
 * is not recognized", which is a confusing way to find out your build script
 * was never portable. Setting the variables in Node works everywhere.
 */

import { spawn } from 'node:child_process';

const variant = process.argv[2];

if (!['static', 'single'].includes(variant)) {
  console.error('Usage: node scripts/build-variant.mjs <static|single>');
  process.exit(1);
}

/** Hash routing and relative asset paths: needed by both variants. */
const base = { VITE_ROUTER: 'hash', VITE_BASE: './' };
const env = {
  ...process.env,
  ...base,
  ...(variant === 'single' ? { VITE_SINGLE: '1' } : {}),
};

/** Runs a command and resolves only if it exits cleanly. */
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env,
      // Windows needs a shell to resolve `npx`/`tsc` from node_modules/.bin.
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`)),
    );
  });
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

try {
  await run(npx, ['tsc', '-b']);
  await run(npx, ['vite', 'build']);
  if (variant === 'single') {
    await run(process.execPath, ['scripts/bundle-single.mjs']);
  } else {
    console.log('\nBuilt to dist/ with hash routing and relative paths.');
    console.log('Drop that folder on any static host — no server configuration needed.\n');
  }
} catch (e) {
  console.error(`\n${e.message}\n`);
  process.exit(1);
}

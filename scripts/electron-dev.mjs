import { spawn } from 'node:child_process';
import process from 'node:process';

const vite = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
  stdio: 'inherit',
  shell: true,
});

const waitForServer = async (url, timeoutMs = 30000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return;
    } catch {
      // Keep polling until Vite is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const electron = async () => {
  await waitForServer('http://127.0.0.1:5173');
  const child = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173',
    },
  });

  child.on('exit', (code) => {
    if (code && code !== 0) process.exitCode = code;
    vite.kill();
  });
};

electron().catch((error) => {
  console.error(error);
  vite.kill();
  process.exit(1);
});

process.on('SIGINT', () => {
  vite.kill();
  process.exit(130);
});

process.on('SIGTERM', () => {
  vite.kill();
  process.exit(143);
});

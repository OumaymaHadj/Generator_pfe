import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

async function isDockerRunning() {
  try {
    await execAsync('docker info');
    return true;
  } catch (error) {
    return false;
  }
}

async function startDocker() {
  try {
    await execAsync('sudo systemctl start docker');
    return true;
  } catch (error) {
    return false;
  }
}

async function runDockerCompose() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '../');
  const composeFile = path.resolve(rootDir, 'docker-compose.yml');
  if (!fs.existsSync(composeFile)) {
    return;
  }

  try {
    const { stdout } = await execAsync('docker-compose up -d');
    console.log(stdout);
  } catch (error) {
    console.error('Failed to run docker-compose:', error.message);
  }
}

export default async function ensureDockerRunningAndCompose() {
  const isRunning = await isDockerRunning();

  if (!isRunning) {
    const started = await startDocker();
    if (started) {
      await runDockerCompose();
    }
  } else {
    await runDockerCompose();
  }
}
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\Admn';
const defaultPythonPath = path.join(userProfile, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe');
const pythonPath = fs.existsSync(defaultPythonPath) ? defaultPythonPath : 'python';
const npmPath = 'C:\\Program Files\\nodejs\\npm.cmd';
const nodeDirectory = 'C:\\Program Files\\nodejs';

console.log('🚀 Starting AgriAI Platform Services...');

// Append node directory to system PATH so spawned scripts can resolve 'node' executable
const env = { ...process.env };
env.PATH = `${env.PATH || ''};${nodeDirectory}`;

// Helper to spawn processes with quoted paths on Windows
function spawnNpm(dir, args) {
  return spawn('cmd.exe', ['/c', `"${npmPath}"`, ...args], {
    cwd: path.join(__dirname, dir),
    shell: true,
    env
  });
}

// 1. Start ML Service
console.log('⚡ Starting ML sidecar service (port 5001)...');
const mlService = spawn('cmd.exe', ['/c', `"${pythonPath}"`, 'app.py'], {
  cwd: path.join(__dirname, 'ml-service'),
  shell: true,
  env
});

// 2. Start Backend
console.log('⚡ Starting Express/TypeScript backend (port 5000)...');
const backend = spawnNpm('backend', ['run', 'dev']);

// 3. Start Frontend
console.log('⚡ Starting Vite/React frontend...');
const frontend = spawnNpm('frontend', ['run', 'dev']);

function logData(prefix, data) {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line) {
      console.log(`[${prefix}] ${line}`);
    }
  });
}

mlService.stdout.on('data', data => logData('ML-SERVICE', data));
mlService.stderr.on('data', data => logData('ML-SERVICE', data));

backend.stdout.on('data', data => logData('BACKEND', data));
backend.stderr.on('data', data => logData('BACKEND', data));

frontend.stdout.on('data', data => logData('FRONTEND', data));
frontend.stderr.on('data', data => logData('FRONTEND', data));

// Handle process termination
const cleanup = () => {
  console.log('\n🛑 Stopping all services...');
  try { mlService.kill(); } catch (e) {}
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

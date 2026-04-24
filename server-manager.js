const { spawn } = require('child_process');
const fs = require('fs');
const log = (msg) => fs.appendFileSync('/home/z/my-project/server-manager.log', new Date().toISOString() + ' ' + msg + '\n');

function startServer() {
    log('Starting next server...');
    const child = spawn('node', [
        'node_modules/.bin/next', 'start', '--port', '3000', '-H', '0.0.0.0'
    ], {
        cwd: '/home/z/my-project',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' }
    });
    
    child.stdout.on('data', (d) => {
        const msg = d.toString().trim();
        if (msg) console.log(msg);
    });
    
    child.stderr.on('data', (d) => {
        const msg = d.toString().trim();
        if (msg) console.error(msg);
    });
    
    child.on('exit', (code, signal) => {
        log('Server died: code=' + code + ' signal=' + signal);
        setTimeout(startServer, 2000);
    });
}

startServer();
log('Manager process started');

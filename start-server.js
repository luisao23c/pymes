const { exec } = require('child_process');
process.env.PORT = '3000';
const child = exec('node server.js', { env: { ...process.env, PORT: '3000' } });
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('exit', (code) => { console.log('Server exited with code', code); });

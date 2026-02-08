import { execSync } from 'child_process';

const PORTS = [3000, 8081, 19000, 19001, 19002, 19006];

console.log('🧹 Cleaning up zombie processes...');

PORTS.forEach(port => {
    try {
        console.log(`🔍 Checking port ${port}...`);
        const pids = execSync(`lsof -t -i :${port}`).toString().trim().split('\n').filter(p => p.trim());
        if (pids.length > 0) {
            console.log(`🔫 Killing processes ${pids.join(', ')} on port ${port}...`);
            pids.forEach(p => {
                try {
                    execSync(`kill -9 ${p}`);
                } catch (e) { }
            });
        }
    } catch (e) {
        // Port is likely free
    }
});

try {
    console.log('🔫 Killing any remaining Expo/LT processes...');
    if (process.platform === 'win32') {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
    } else {
        execSync('pkill -f "expo"', { stdio: 'ignore' });
        execSync('pkill -f "localtunnel"', { stdio: 'ignore' });
    }
} catch (e) { }

console.log('✨ Environment cleared. You can now restart your services.');

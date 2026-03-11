const { execSync } = require('child_process');
const fs = require('fs');

try {
    const status = execSync('git status', { encoding: 'utf8' });
    const remote = execSync('git remote -v', { encoding: 'utf8' });
    const unpushed = execSync('git cherry -v', { encoding: 'utf8' });
    const log = execSync('git log -n 5 --oneline --graph --decorate', { encoding: 'utf8' });
    
    const output = `
=== GIT STATUS ===
${status}

=== GIT REMOTES ===
${remote}

=== UNPUSHED COMMITS ===
${unpushed}

=== RECENT LOG ===
${log}
`;
    fs.writeFileSync('git_sync_report.txt', output);
    console.log('Report generated correctly.');
} catch (error) {
    fs.writeFileSync('git_sync_report.txt', 'Error running git commands: ' + error.message);
}

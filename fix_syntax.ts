import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (file: string) => void) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const dirsToSearch = ['src/components', 'src/ai', 'src/app'];

dirsToSearch.forEach(dir => {
    if (fs.existsSync(dir)) {
        walk(dir, (file) => {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                let content = fs.readFileSync(file, 'utf8');
                if (content.includes('\\\`') || content.includes('\\\${')) {
                    console.log(`Fixing ${file}`);
                    const fixed = content.replace(/\\\`/g, '`').replace(/\\\$\{/g, '${');
                    fs.writeFileSync(file, fixed);
                }
            }
        });
    }
});

import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (path: string) => void) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        walk(filePath, callback);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        callback(filePath);
      }
    }
  }
}

walk('./src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/gemini25Flash/g, 'gemini15Flash');
  newContent = newContent.replace(/gemini25Pro/g, 'gemini15Pro');
  if (newContent !== content) {
    console.log(`Updated ${filePath}`);
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
});

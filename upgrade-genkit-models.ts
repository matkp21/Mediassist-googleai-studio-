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

walk('./src/ai', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace model references
  content = content.replace(/model:\s*(gemini15Flash|gemini15Pro|gemini20Flash|gemini20Pro|gemini25Flash|gemini25Pro)/g, "model: 'googleai/gemini-3.0-flash'");
  
  // Also if someone did `import { gemini... } from`
  content = content.replace(/import\s*{\s*([^}]*gemini[^}]*)\s*}\s*from\s*['"]@genkit-ai\/googleai["'];?/g, (match, p1) => {
      // If it also imports googleAI, we need to keep it
      if (p1.includes('googleAI')) {
          return "import { googleAI } from '@genkit-ai/googleai';";
      }
      return "";
  });

  // some places pass { model: gemini15Flash } in the second argument
  content = content.replace(/{\s*model:\s*(gemini15Flash|gemini15Pro|gemini20Flash|gemini20Pro|gemini25Flash|gemini25Pro)\s*}/g, "{ model: 'googleai/gemini-3.0-flash' }");

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    console.log(`Updated ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  { url: 'https://raw.githubusercontent.com/matkp21/studio/master/src/app/(auth)/login/page.tsx', dest: 'src/app/(auth)/login/page.tsx' },
  { url: 'https://raw.githubusercontent.com/matkp21/studio/master/src/app/(auth)/signup/page.tsx', dest: 'src/app/(auth)/signup/page.tsx' },
  { url: 'https://raw.githubusercontent.com/matkp21/studio/master/src/components/onboarding/onboarding-modal.tsx', dest: 'src/components/onboarding/onboarding-modal.tsx' }
];

files.forEach(file => {
  const destPath = path.resolve(process.cwd(), file.dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  https.get(file.url, (res) => {
    const fileStream = fs.createWriteStream(destPath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file.dest} to ${destPath}`);
    });
  });
});

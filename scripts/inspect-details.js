const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\แฟนฉัน\\งานรับจ้าง';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(fullPath));
        } else {
          results.push({ path: fullPath, name: file, size: stat.size, ext: path.extname(file).toLowerCase() });
        }
      } catch (e) {}
    });
  } catch (e) {}
  return results;
}

const allFiles = walk(srcDir);
const topFolders = fs.readdirSync(srcDir).filter(f => {
  try { return fs.statSync(path.join(srcDir, f)).isDirectory(); } catch (e) { return false; }
});

for (const folder of topFolders) {
  const folderPath = path.join(srcDir, folder);
  const images = allFiles.filter(f => f.path.startsWith(folderPath) && ['.jpg', '.jpeg', '.png', '.webp'].includes(f.ext));
  const docs = allFiles.filter(f => f.path.startsWith(folderPath) && ['.docx', '.xlsx', '.pdf', '.pptx', '.doc'].includes(f.ext));
  
  console.log(`\n=== Folder: ${folder} ===`);
  console.log(`Total images: ${images.length}, Total docs: ${docs.length}`);
  if (images.length > 0) {
    console.log('Sample images:');
    images.slice(0, 5).forEach(img => {
      console.log(`  - ${path.relative(folderPath, img.path)} (${Math.round(img.size / 1024)} KB)`);
    });
  }
  if (docs.length > 0) {
    console.log('Sample docs:');
    docs.slice(0, 5).forEach(d => {
      console.log(`  - ${path.relative(folderPath, d.path)} (${Math.round(d.size / 1024)} KB)`);
    });
  }
}

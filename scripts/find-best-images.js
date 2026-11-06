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

const all = walk(srcDir);
const imgs = all.filter(f => ['.jpg', '.jpeg', '.png'].includes(f.ext) && f.size > 20000 && f.size < 5000000);

console.log('Total usable images (>20KB, <5MB):', imgs.length);

// Group by top folder
const topDirs = fs.readdirSync(srcDir).filter(f => {
  try { return fs.statSync(path.join(srcDir, f)).isDirectory(); } catch (e) { return false; }
});

topDirs.forEach(d => {
  const fImgs = imgs.filter(i => i.path.startsWith(path.join(srcDir, d)));
  console.log(`\nFolder: ${d} -> ${fImgs.length} images`);
  fImgs.slice(0, 3).forEach(img => {
    console.log(`  - ${path.basename(img.path)} (${Math.round(img.size/1024)} KB)`);
  });
});

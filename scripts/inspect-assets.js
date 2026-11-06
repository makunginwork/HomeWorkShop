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
          results.push({ type: 'dir', path: fullPath, name: file });
          results = results.concat(walk(fullPath));
        } else {
          results.push({ type: 'file', path: fullPath, name: file, size: stat.size, ext: path.extname(file).toLowerCase() });
        }
      } catch (e) {}
    });
  } catch (e) {}
  return results;
}

const items = walk(srcDir);
const exts = {};
items.filter(i => i.type === 'file').forEach(f => {
  exts[f.ext] = (exts[f.ext] || 0) + 1;
});

console.log('File extensions breakdown:', exts);

const topDirs = fs.readdirSync(srcDir).filter(f => {
  try { return fs.statSync(path.join(srcDir, f)).isDirectory(); } catch(e) { return false; }
});

console.log('Top level folders (' + topDirs.length + '):');
topDirs.forEach(d => {
  const dirFiles = items.filter(i => i.type === 'file' && i.path.startsWith(path.join(srcDir, d)));
  const imgFiles = dirFiles.filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(f.ext));
  const docFiles = dirFiles.filter(f => ['.docx', '.doc', '.xlsx', '.xls', '.pdf', '.pptx'].includes(f.ext));
  console.log(`- ${d}: total ${dirFiles.length} files (images: ${imgFiles.length}, docs: ${docFiles.length})`);
});

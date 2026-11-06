const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\แฟนฉัน\\งานรับจ้าง';

function searchFiles(dir, filterFn) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      try {
        const s = fs.statSync(full);
        if (s.isDirectory()) {
          results = results.concat(searchFiles(full, filterFn));
        } else if (filterFn(f, s)) {
          results.push(full);
        }
      } catch (e) {}
    }
  } catch (e) {}
  return results;
}

const folders = [
  '[วิชาวิศวกรรม] วิชาสมบัติ 1',
  '[วิชากฎหมาย] กฎหมายการบัญชี',
  '[10700401] การรู้สารสนเทศ',
  '[PA 1102-69] ระบบบริหารราชการไทย (มรภ.เชียงใหม่)'
];

folders.forEach(f => {
  const fPath = path.join(srcDir, f);
  const found = searchFiles(fPath, (name, s) => ['.png', '.jpg', '.jpeg'].includes(path.extname(name).toLowerCase()));
  console.log(`\nFolder ${f}: found ${found.length} images`);
  found.slice(0, 5).forEach(img => {
    console.log(' - ' + path.relative(srcDir, img));
  });
});

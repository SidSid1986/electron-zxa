// check-icon.js
const fs = require('fs');
const path = require('path');

const iconPath = path.resolve(__dirname, 'build/icons/icon.ico');
console.log('图标路径:', iconPath);
console.log('文件是否存在:', fs.existsSync(iconPath));

if (fs.existsSync(iconPath)) {
  const stats = fs.statSync(iconPath);
  console.log('文件大小:', stats.size, '字节');
  console.log('文件最后修改时间:', stats.mtime);
  
  // 读取文件头，检查是否是有效的 ICO 文件
  const buffer = Buffer.alloc(4);
  const fd = fs.openSync(iconPath, 'r');
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);
  
  const header = buffer.toString('hex');
  console.log('文件头(十六进制):', header);
  console.log('是否是有效ICO(应该以00 00 01 00开头):', header.startsWith('00000100'));
} else {
  console.log('错误: 图标文件不存在！');
  console.log('当前工作目录:', __dirname);
  console.log('build目录内容:');
  if (fs.existsSync(path.resolve(__dirname, 'build'))) {
    console.log(fs.readdirSync(path.resolve(__dirname, 'build')));
  }
  if (fs.existsSync(path.resolve(__dirname, 'build/icons'))) {
    console.log('icons目录内容:');
    console.log(fs.readdirSync(path.resolve(__dirname, 'build/icons')));
  }
}
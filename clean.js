/*
 * @Author: Sid Li
 * @Date: 2025-12-06 10:52:54
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-06 10:52:58
 * @FilePath: \ai\clean.js
 * @Description: 
 */
// clean.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('清理构建缓存...');

// 删除构建目录
const dirs = [
  'dist',
  'electron_dist',
  'node_modules/.cache',
  'node_modules/.vite'
];

dirs.forEach(dir => {
  const dirPath = path.resolve(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`删除: ${dir}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
});

// 重新生成图标
console.log('重新生成图标...');
try {
  execSync('npm run electron:generate-icons', { stdio: 'inherit' });
} catch (error) {
  console.log('注意: 图标生成可能失败，但继续构建...');
}

console.log('清理完成！');
/**
 * 图标生成脚本
 * 运行方式: node generate-icons.js
 *
 * 如果没有 canvas 模块，请先安装: npm install canvas
 * 或者直接在浏览器中打开 icons/generate-icons.html 下载图标
 */

const fs = require('fs');
const path = require('path');

// 尝试使用 canvas 模块
try {
  const { createCanvas } = require('canvas');

  const sizes = [16, 32, 48, 128];
  const iconsDir = path.join(__dirname, 'icons');

  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    // 圆角矩形
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制刺绣针的图标
    ctx.strokeStyle = 'white';
    ctx.lineWidth = Math.max(1, size * 0.06);
    ctx.lineCap = 'round';

    const centerX = size / 2;
    const centerY = size / 2;
    const needleLength = size * 0.5;

    // 针
    ctx.beginPath();
    ctx.moveTo(centerX - needleLength * 0.3, centerY + needleLength * 0.3);
    ctx.lineTo(centerX + needleLength * 0.3, centerY - needleLength * 0.3);
    ctx.stroke();

    // 针眼
    ctx.beginPath();
    ctx.arc(centerX + needleLength * 0.2, centerY - needleLength * 0.2, Math.max(1, size * 0.06), 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // 线
    ctx.beginPath();
    ctx.moveTo(centerX + needleLength * 0.3, centerY - needleLength * 0.3);
    ctx.quadraticCurveTo(
      centerX + needleLength * 0.5,
      centerY - needleLength * 0.1,
      centerX + needleLength * 0.35,
      centerY + needleLength * 0.15
    );
    ctx.stroke();

    // 保存文件
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
    console.log(`Generated icon${size}.png`);
  });

  console.log('All icons generated successfully!');
} catch (error) {
  console.log('canvas 模块未安装。请使用以下方法之一生成图标:');
  console.log('1. npm install canvas && node generate-icons.js');
  console.log('2. 在浏览器中打开 icons/generate-icons.html 并下载图标');
  console.log('');
  console.log('或者使用以下默认占位图标...');

  // 创建简单的占位 PNG 文件（1x1 紫色像素，可被 Chrome 接受）
  const sizes = [16, 32, 48, 128];
  const iconsDir = path.join(__dirname, 'icons');

  // 这是一个最小的有效 PNG 文件结构（紫色背景）
  // 我们使用预生成的 base64 编码的简单图标
  const placeholderPNGs = {
    16: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4jWNgGAWjIUBISEjw/8uXLxn+//8PZzMwMDAwkqKZZM0MDEiamZiYGEZBfAAAVr4I4VvXLZkAAAAASUVORK5CYII=',
    32: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAPklEQVRYhe3OsQ0AIAwDwez/aZgBCopIWI6bHr38AwDgL9pquwYAAOCd7WkDAACAx5YbAAAA/KGNXQMAAL6bATPVCgFNBN5qAAAAAElFTkSuQmCC',
    48: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAASklEQVRoge3PMQEAIAwEsAP/nsMKHJBQ0N1N8gMA+Jt6dQEAAODJfpQBAADgta0zAAAA4BdnGQAAAD63OgEAAODJTgMAAOAjDXdQNAHAkAUwWPj3gAAAAABJRU5ErkJggg==',
    128: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAZklEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GcGxAABltXq0QAAAABJRU5ErkJggg=='
  };

  sizes.forEach(size => {
    const buffer = Buffer.from(placeholderPNGs[size], 'base64');
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
    console.log(`Created placeholder icon${size}.png`);
  });

  console.log('Placeholder icons created. For better icons, use the browser method.');
}

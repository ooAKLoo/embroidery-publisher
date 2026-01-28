import * as THREE from 'three';

export function createChatCardTexture(isSelf = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 0, 0, 512, 256, 40);
    ctx.fill();

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 4;
    ctx.stroke();

    const avatarX = isSelf ? 430 : 50;
    const bubbleX = isSelf ? 50 : 150;

    ctx.fillStyle = isSelf ? '#3b82f6' : '#9ca3af';
    ctx.beginPath();
    ctx.arc(avatarX, 60, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = isSelf ? 'right' : 'left';
    ctx.fillText(isSelf ? 'Me' : `User ${Math.floor(Math.random() * 100)}`, isSelf ? 380 : 100, 65);

    ctx.fillStyle = isSelf ? '#eff6ff' : '#f3f4f6';
    const bubbleWidth = 350;
    const bubbleHeight = 120;
    const bx = isSelf ? 430 - 50 - bubbleWidth : 100;

    roundRect(ctx, bx, 100, bubbleWidth, bubbleHeight, 20);
    ctx.fill();

    ctx.fillStyle = isSelf ? '#1e3a8a' : '#374151';
    const lx = bubbleX + 20;
    const ly = 140;

    ctx.fillRect(lx, ly, 200, 10);
    ctx.fillRect(lx, ly + 25, 280, 10);
    ctx.fillRect(lx, ly + 50, 150, 10);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 1024);

    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, 512, 120);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Messages', 256, 80);

    for (let i = 0; i < 6; i += 1) {
      const y = 150 + i * 140;

      ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#10b981';
      ctx.beginPath();
      ctx.arc(60, y + 40, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.fillRect(110, y + 20, 200, 15);
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(110, y + 55, 300, 12);

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(20, y + 100, 472, 2);
    }
  }

  return new THREE.CanvasTexture(canvas);
}

function roundRect(ctx, x, y, w, h, r) {
  let radius = r;
  if (w < 2 * radius) radius = w / 2;
  if (h < 2 * radius) radius = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function sampleTextPoints({
  text,
  width = 900,
  height = 260,
  font = '700 160px "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
  step = 6,
  threshold = 50
} = {}) {
  if (typeof document === 'undefined') {
    const points = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if ((x + y) % (step * 2) === 0) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font;

  const lines = String(text || '').split('\n');
  const lineHeight = Math.min(180, height / Math.max(1, lines.length));
  const startY = height / 2 - (lines.length - 1) * lineHeight * 0.5;

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  const { data } = ctx.getImageData(0, 0, width, height);
  const points = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > threshold) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

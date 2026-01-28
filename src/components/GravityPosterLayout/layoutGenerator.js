export function generateLayout(style, count, spread, depth, images) {
  const items = [];

  const getImage = (index) => {
    if (images.length === 0) return `https://picsum.photos/seed/${index + 100}/400/600`;
    return images[index % images.length];
  };

  for (let i = 0; i < count; i += 1) {
    let x = 0;
    let y = 0;
    let z = 0;
    let rX = 0;
    let rY = 0;
    let rZ = 0;
    const scale = 0.8 + Math.random() * 0.4;

    if (style === 'orbit') {
      const angle = (i / count) * Math.PI * 2 * 2;
      const radius = spread * (0.5 + Math.random() * 0.5);
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = (Math.random() - 0.5) * depth * 2;

      rX = -y * 0.05;
      rY = x * 0.05;
      rZ = (Math.random() - 0.5) * 20;
    } else if (style === 'vortex') {
      const angle = i * 0.5;
      const radius = (i / count) * spread * 1.2 + 200;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = (i / count) * depth - depth / 2;

      rZ = angle * (180 / Math.PI) + 90;
      rX = 20;
      rY = 10;
    }

    items.push({
      id: `item-${i}`,
      src: getImage(i),
      x,
      y,
      z,
      rotateX: rX,
      rotateY: rY,
      rotateZ: rZ,
      scale
    });
  }

  return items;
}

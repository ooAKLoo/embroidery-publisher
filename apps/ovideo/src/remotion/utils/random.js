export function createSeededRandom(seed = 1) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed(list, seed = 1) {
  const rng = createSeededRandom(seed);
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickIndices(count, total, seed = 1) {
  if (total <= 0 || count <= 0) return [];
  const indices = Array.from({ length: total }, (_, i) => i);
  const shuffled = shuffleWithSeed(indices, seed);
  return shuffled.slice(0, Math.min(count, total));
}

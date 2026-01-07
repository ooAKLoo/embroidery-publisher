// 3D旋转矩阵
export const rotateX = (v, a) => [v[0], v[1]*Math.cos(a) - v[2]*Math.sin(a), v[1]*Math.sin(a) + v[2]*Math.cos(a)];
export const rotateY = (v, a) => [v[0]*Math.cos(a) + v[2]*Math.sin(a), v[1], -v[0]*Math.sin(a) + v[2]*Math.cos(a)];
export const rotateZ = (v, a) => [v[0]*Math.cos(a) - v[1]*Math.sin(a), v[0]*Math.sin(a) + v[1]*Math.cos(a), v[2]];

// 4D旋转矩阵
export const rotateXW = (v, a) => [v[0]*Math.cos(a) - v[3]*Math.sin(a), v[1], v[2], v[0]*Math.sin(a) + v[3]*Math.cos(a)];
export const rotateYW = (v, a) => [v[0], v[1]*Math.cos(a) - v[3]*Math.sin(a), v[2], v[1]*Math.sin(a) + v[3]*Math.cos(a)];
export const rotateZW = (v, a) => [v[0], v[1], v[2]*Math.cos(a) - v[3]*Math.sin(a), v[2]*Math.sin(a) + v[3]*Math.cos(a)];

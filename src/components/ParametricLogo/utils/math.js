/**
 * 计算超公式曲线上的点
 * 公式: r(φ) = [ (|cos(mφ/4)/a|^n2 + |sin(mφ/4)/b|^n3) ] ^ (-1/n1)
 */
export const calculateSuperformulaPoint = (phi, params) => {
  const { m, n1, n2, n3, a, b } = params;

  // 避免除零
  if (n1 === 0) return 0;
  if (a === 0 || b === 0) return 0;

  const t1 = Math.cos((m * phi) / 4) / a;
  const t1Abs = Math.abs(t1);
  const t1Pow = Math.pow(t1Abs, n2);

  const t2 = Math.sin((m * phi) / 4) / b;
  const t2Abs = Math.abs(t2);
  const t2Pow = Math.pow(t2Abs, n3);

  const r = Math.pow(t1Pow + t2Pow, -1 / n1);
  return r;
};

/**
 * 生成形状的坐标点数组
 */
export const getShapePoints = (params, resolution = 360, sizeScale = 100) => {
  const points = [];
  const step = (Math.PI * 2) / resolution;

  for (let phi = 0; phi <= Math.PI * 2; phi += step) {
    let r = calculateSuperformulaPoint(phi, params);

    // 处理无穷或 NaN
    if (!isFinite(r)) r = 0;
    
    // 极坐标转笛卡尔坐标
    const x = r * Math.cos(phi) * sizeScale;
    const y = r * Math.sin(phi) * sizeScale;

    points.push({ x, y });
  }

  return points;
};

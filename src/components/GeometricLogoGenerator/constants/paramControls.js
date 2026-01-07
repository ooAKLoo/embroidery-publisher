import { PLATONIC_SOLIDS } from '../constants/polyhedra';

// 参数控制配置
export const PARAM_CONTROLS = {
  platonic: [
    { key: 'solid', type: 'select', label: '立体类型', options: Object.keys(PLATONIC_SOLIDS).map(k => ({ value: k, label: PLATONIC_SOLIDS[k].name })) },
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationZ', type: 'range', label: 'Z轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'scale', type: 'range', label: '缩放', min: 40, max: 120, step: 1 },
  ],
  tesseract: [
    { key: 'rotationXW', type: 'range', label: 'XW旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationYW', type: 'range', label: 'YW旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationXZ', type: 'range', label: 'XZ旋转', min: 0, max: Math.PI * 2, step: 0.01 },
  ],
  mobius: [
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
  ],
  squircle: [
    { key: 'n', type: 'range', label: '圆角指数 n', min: 2, max: 10, step: 0.5, hint: 'n=2 圆形, n=4 iOS图标, n→∞ 方形' },
  ],
  koch: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 1, max: 6, step: 1 },
  ],
  sierpinski: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 1, max: 7, step: 1 },
  ],
  tree: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 4, max: 12, step: 1 },
    { key: 'angle', type: 'range', label: '分支角度', min: 10, max: 45, step: 1, suffix: '°' },
  ],
  dragon: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 6, max: 15, step: 1 },
  ],
  spirograph: [
    { key: 'R', type: 'range', label: '外圆 R', min: 40, max: 120, step: 1 },
    { key: 'r', type: 'range', label: '内圆 r', min: 10, max: 80, step: 1 },
    { key: 'd', type: 'range', label: '笔距 d', min: 10, max: 100, step: 1 },
  ],
  rose: [
    { key: 'k', type: 'range', label: '花瓣 k', min: 2, max: 12, step: 0.5 },
  ],
  lissajous: [
    { key: 'a', type: 'range', label: '频率 a', min: 1, max: 10, step: 1 },
    { key: 'b', type: 'range', label: '频率 b', min: 1, max: 10, step: 1 },
  ],
  logspiral: [
    { key: 'b', type: 'range', label: '增长率 b', min: 0.05, max: 0.3, step: 0.01 },
    { key: 'turns', type: 'range', label: '圈数', min: 2, max: 8, step: 1 },
  ],
  wireframe: [
    { key: 'vertices', type: 'range', label: '顶点数', min: 3, max: 12, step: 1 },
    { key: 'innerConnections', type: 'checkbox', label: '内部连接' },
  ],
  islamic: [
    { key: 'rings', type: 'range', label: '环数', min: 1, max: 5, step: 1 },
    { key: 'petals', type: 'range', label: '花瓣数', min: 4, max: 16, step: 1 },
  ],
  radial: [
    { key: 'lines', type: 'range', label: '线条数量', min: 3, max: 16, step: 1 },
    { key: 'length', type: 'range', label: '线条长度', min: 30, max: 100, step: 5 },
    { key: 'thickness', type: 'range', label: '线条粗细', min: 4, max: 24, step: 2 },
    { key: 'gap', type: 'range', label: '中心间距', min: 0, max: 80, step: 5 },
    { key: 'spiral', type: 'range', label: '螺旋偏移', min: -45, max: 45, step: 1, suffix: '°', hint: '产生旋转动感' },
    { key: 'gradientDirection', type: 'select', label: '渐变方向', options: [{ value: 'outward', label: '向外渐变' }, { value: 'inward', label: '向内渐变' }] },
    { key: 'roundCap', type: 'checkbox', label: '圆角端点' },
  ],
  segmented: [
    { key: 'sides', type: 'range', label: '边数', min: 3, max: 12, step: 1 },
    { key: 'radius', type: 'range', label: '半径', min: 60, max: 130, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: -180, max: 180, step: 5, suffix: '°' },
    { key: 'segmentRatio', type: 'range', label: '线段长度', min: 0.3, max: 0.95, step: 0.05, hint: '控制间隙大小' },
    { key: 'thickness', type: 'range', label: '线条粗细', min: 4, max: 24, step: 2 },
    { key: 'gapPosition', type: 'select', label: '间隙位置', options: [{ value: 'start', label: '起始端' }, { value: 'center', label: '居中' }, { value: 'end', label: '末端' }] },
    { key: 'gradientDirection', type: 'select', label: '渐变方向', options: [{ value: 'clockwise', label: '顺时针' }, { value: 'counterclockwise', label: '逆时针' }] },
    { key: 'roundCap', type: 'checkbox', label: '圆角端点' },
  ],
  gradientArc: [
    { key: 'arcs', type: 'range', label: '弧线数量', min: 2, max: 12, step: 1 },
    { key: 'radius', type: 'range', label: '弧线半径', min: 60, max: 130, step: 5 },
    { key: 'arcSpan', type: 'range', label: '弧度跨度', min: 15, max: 90, step: 5, suffix: '°', hint: '每段弧的角度' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
    { key: 'thickness', type: 'range', label: '线条粗细', min: 4, max: 24, step: 2 },
    { key: 'gradientDirection', type: 'select', label: '渐变方向', options: [{ value: 'clockwise', label: '顺时针' }, { value: 'counterclockwise', label: '逆时针' }] },
    { key: 'roundCap', type: 'checkbox', label: '圆角端点' },
  ],
  // 网格/点阵类
  grid: [
    { key: 'gridType', type: 'select', label: '网格类型', options: [
      { value: 'square', label: '方形网格' },
      { value: 'isometric', label: '等距网格' },
      { value: 'radial', label: '极坐标网格' },
      { value: 'contour', label: '等高线' },
    ]},
    { key: 'lineCount', type: 'range', label: '线条数量', min: 4, max: 16, step: 1 },
    { key: 'distortion', type: 'range', label: '扭曲程度', min: 0, max: 50, step: 5, hint: '仅等高线模式' },
  ],
  particle: [
    { key: 'particleCount', type: 'range', label: '粒子数量', min: 20, max: 100, step: 5 },
    { key: 'distribution', type: 'select', label: '分布方式', options: [
      { value: 'random', label: '随机分布' },
      { value: 'circular', label: '环形分布' },
      { value: 'spiral', label: '螺旋分布' },
      { value: 'grid', label: '网格分布' },
    ]},
    { key: 'connectLines', type: 'checkbox', label: '显示连线' },
    { key: 'connectionDistance', type: 'range', label: '连线距离', min: 20, max: 80, step: 5 },
    { key: 'particleSize', type: 'range', label: '粒子大小', min: 2, max: 8, step: 1 },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1, hint: '改变随机分布' },
  ],
  honeycomb: [
    { key: 'rings', type: 'range', label: '环数', min: 1, max: 5, step: 1 },
    { key: 'cellSize', type: 'range', label: '单元格大小', min: 15, max: 40, step: 5 },
    { key: 'fillMode', type: 'select', label: '填充模式', options: [
      { value: 'outline', label: '仅描边' },
      { value: 'gradient', label: '渐变填充' },
      { value: 'alternating', label: '交替填充' },
    ]},
    { key: 'gap', type: 'range', label: '间距', min: 0, max: 8, step: 1 },
  ],
  constellation: [
    { key: 'starCount', type: 'range', label: '星星数量', min: 10, max: 40, step: 2 },
    { key: 'connectionMethod', type: 'select', label: '连接方式', options: [
      { value: 'nearest', label: '最近邻' },
      { value: 'delaunay', label: '三角网' },
      { value: 'all', label: '全连接' },
    ]},
    { key: 'maxConnections', type: 'range', label: '最大连接数', min: 1, max: 5, step: 1, hint: '最近邻模式' },
    { key: 'maxDistance', type: 'range', label: '连接距离', min: 40, max: 120, step: 10 },
    { key: 'starSize', type: 'range', label: '星星大小', min: 2, max: 8, step: 1 },
    { key: 'glowEffect', type: 'checkbox', label: '发光效果' },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1 },
  ],
  // 圆形/环形类
  concentric: [
    { key: 'ringCount', type: 'range', label: '圆环数量', min: 3, max: 12, step: 1 },
    { key: 'maxRadius', type: 'range', label: '最大半径', min: 80, max: 130, step: 5 },
    { key: 'ringStyle', type: 'select', label: '线条样式', options: [
      { value: 'solid', label: '实线' },
      { value: 'dashed', label: '虚线' },
      { value: 'dotted', label: '点线' },
      { value: 'wave', label: '波浪' },
    ]},
    { key: 'spacing', type: 'select', label: '间距方式', options: [
      { value: 'equal', label: '等距' },
      { value: 'fibonacci', label: '斐波那契' },
      { value: 'exponential', label: '指数' },
    ]},
    { key: 'waveAmplitude', type: 'range', label: '波动幅度', min: 0, max: 20, step: 2, hint: '仅波浪模式' },
  ],
  spiral: [
    { key: 'spiralType', type: 'select', label: '螺旋类型', options: [
      { value: 'archimedean', label: '阿基米德' },
      { value: 'golden', label: '黄金螺旋' },
      { value: 'fermat', label: '费马螺旋' },
      { value: 'hyperbolic', label: '双曲螺旋' },
    ]},
    { key: 'turns', type: 'range', label: '圈数', min: 2, max: 10, step: 1 },
    { key: 'direction', type: 'select', label: '方向', options: [
      { value: 'outward', label: '向外展开' },
      { value: 'inward', label: '向内收缩' },
    ]},
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  mandala: [
    { key: 'symmetry', type: 'range', label: '对称轴数', min: 4, max: 16, step: 1 },
    { key: 'layers', type: 'range', label: '层数', min: 2, max: 6, step: 1 },
    { key: 'complexity', type: 'range', label: '复杂度', min: 1, max: 5, step: 1 },
    { key: 'style', type: 'select', label: '风格', options: [
      { value: 'petals', label: '花瓣' },
      { value: 'geometric', label: '几何' },
      { value: 'dots', label: '点阵' },
      { value: 'mixed', label: '混合' },
    ]},
    { key: 'innerRadius', type: 'range', label: '内半径', min: 10, max: 40, step: 5 },
  ],
  // 动态/流体类
  flowing: [
    { key: 'curveCount', type: 'range', label: '曲线数量', min: 2, max: 10, step: 1 },
    { key: 'flowDirection', type: 'select', label: '流动方向', options: [
      { value: 'horizontal', label: '水平' },
      { value: 'vertical', label: '垂直' },
      { value: 'circular', label: '环形' },
      { value: 'wave', label: 'S形波浪' },
    ]},
    { key: 'amplitude', type: 'range', label: '振幅', min: 10, max: 80, step: 5 },
    { key: 'frequency', type: 'range', label: '频率', min: 1, max: 5, step: 0.5 },
    { key: 'phase', type: 'range', label: '相位', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  waveform: [
    { key: 'waveCount', type: 'range', label: '波形数量', min: 1, max: 6, step: 1 },
    { key: 'frequency', type: 'range', label: '频率', min: 1, max: 5, step: 0.5 },
    { key: 'amplitude', type: 'range', label: '振幅', min: 10, max: 60, step: 5 },
    { key: 'phase', type: 'range', label: '相位', min: 0, max: 360, step: 15, suffix: '°' },
    { key: 'waveType', type: 'select', label: '波形类型', options: [
      { value: 'sine', label: '正弦波' },
      { value: 'square', label: '方波' },
      { value: 'triangle', label: '三角波' },
      { value: 'sawtooth', label: '锯齿波' },
    ]},
    { key: 'orientation', type: 'select', label: '方向', options: [
      { value: 'horizontal', label: '水平' },
      { value: 'vertical', label: '垂直' },
      { value: 'circular', label: '环形' },
    ]},
  ],
  glowOrb: [
    { key: 'orbCount', type: 'range', label: '光球数量', min: 1, max: 6, step: 1 },
    { key: 'arrangement', type: 'select', label: '排列方式', options: [
      { value: 'center', label: '中心叠加' },
      { value: 'scattered', label: '散布' },
      { value: 'orbital', label: '轨道环绕' },
      { value: 'cluster', label: '簇状' },
    ]},
    { key: 'blurAmount', type: 'range', label: '模糊程度', min: 5, max: 40, step: 5 },
    { key: 'intensity', type: 'range', label: '强度', min: 0.3, max: 1, step: 0.1 },
    { key: 'orbSize', type: 'range', label: '光球大小', min: 30, max: 100, step: 10 },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1, hint: '改变分布' },
  ],
  // 纹理/碎片类
  noise: [
    { key: 'resolution', type: 'range', label: '分辨率', min: 10, max: 30, step: 2 },
    { key: 'noiseScale', type: 'range', label: '噪声缩放', min: 0.05, max: 0.3, step: 0.05 },
    { key: 'noiseType', type: 'select', label: '噪声类型', options: [
      { value: 'circles', label: '圆点' },
      { value: 'lines', label: '线条' },
      { value: 'mesh', label: '网格' },
      { value: 'cloud', label: '云状' },
    ]},
    { key: 'intensity', type: 'range', label: '强度', min: 0.5, max: 2, step: 0.1 },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1 },
  ],
  shard: [
    { key: 'shardCount', type: 'range', label: '碎片数量', min: 6, max: 20, step: 2 },
    { key: 'layers', type: 'range', label: '层数', min: 2, max: 5, step: 1 },
    { key: 'irregularity', type: 'range', label: '不规则度', min: 0, max: 0.6, step: 0.1, hint: '边缘扭曲程度' },
    { key: 'fillOpacity', type: 'range', label: '填充透明度', min: 0.1, max: 0.6, step: 0.1 },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1 },
  ],
  maze: [
    { key: 'mazeType', type: 'select', label: '迷宫类型', options: [
      { value: 'concentric', label: '同心圆' },
      { value: 'rectangular', label: '矩形' },
      { value: 'hexagonal', label: '六边形' },
    ]},
    { key: 'layers', type: 'range', label: '层数/复杂度', min: 2, max: 6, step: 1 },
    { key: 'openings', type: 'range', label: '开口数', min: 1, max: 4, step: 1, hint: '每层的通道数' },
    { key: 'lineWeight', type: 'select', label: '线条粗细', options: [
      { value: 'thin', label: '细' },
      { value: 'medium', label: '中' },
      { value: 'thick', label: '粗' },
    ]},
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1 },
  ],
};

// 获取参数控制配置
export const getParamControls = (type) => PARAM_CONTROLS[type] || [];

import { PLATONIC_SOLIDS } from '../constants/polyhedra';

// 参数控制配置
export const PARAM_CONTROLS = {
  // 通用多边形
  polygon: [
    { key: 'sides', type: 'range', label: '边数', min: 3, max: 12, step: 1, hint: '3=三角, 4=方形, 6=六边形' },
    { key: 'radius', type: 'range', label: '大小', min: 60, max: 130, step: 5 },
    { key: 'roundness', type: 'range', label: '圆角程度', min: 0, max: 1, step: 0.1, hint: '0=尖角, 1=圆滑' },
    { key: 'hollowRatio', type: 'range', label: '镂空比例', min: 0, max: 0.8, step: 0.1, hint: '0=实心' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
    { key: 'skewX', type: 'range', label: 'X倾斜', min: -30, max: 30, step: 5, suffix: '°' },
    { key: 'skewY', type: 'range', label: 'Y倾斜', min: -30, max: 30, step: 5, suffix: '°' },
    { key: 'scaleX', type: 'range', label: 'X缩放', min: 0.5, max: 1.5, step: 0.1 },
    { key: 'scaleY', type: 'range', label: 'Y缩放', min: 0.5, max: 1.5, step: 0.1 },
    { key: 'splitMode', type: 'select', label: '切割模式', options: [
      { value: 'none', label: '无' },
      { value: 'horizontal', label: '水平切割' },
      { value: 'vertical', label: '垂直切割' },
      { value: 'diagonal', label: '对角切割' },
      { value: 'radial', label: '径向切割' },
    ]},
    { key: 'splitGap', type: 'range', label: '切割间隙', min: 2, max: 30, step: 2 },
    { key: 'innerPolygons', type: 'range', label: '嵌套层数', min: 0, max: 5, step: 1 },
    { key: 'innerRotation', type: 'range', label: '嵌套旋转', min: 0, max: 45, step: 5, suffix: '°' },
    { key: 'showVertices', type: 'checkbox', label: '显示顶点' },
    { key: 'vertexSize', type: 'range', label: '顶点大小', min: 2, max: 12, step: 2 },
    { key: 'filled', type: 'checkbox', label: '填充' },
  ],
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
  // 新增3D立体
  nestedCubes: [
    { key: 'layers', type: 'range', label: '嵌套层数', min: 2, max: 5, step: 1 },
    { key: 'styleType', type: 'select', label: '样式类型', options: [{ value: 'line', label: '线条' }, { value: 'solid', label: '实心' }] },
    { key: 'layerScale', type: 'range', label: '层缩放比', min: 0.4, max: 0.8, step: 0.05, hint: '每层相对上层的缩放' },
    { key: 'layerRotation', type: 'range', label: '层旋转', min: 0, max: 45, step: 5, suffix: '°', hint: '每层额外旋转' },
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationZ', type: 'range', label: 'Z轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'scale', type: 'range', label: '缩放', min: 50, max: 100, step: 5 },
  ],
  stellated: [
    { key: 'baseShape', type: 'select', label: '基础形状', options: [
      { value: 'tetrahedron', label: '正四面体' },
      { value: 'octahedron', label: '正八面体' },
      { value: 'icosahedron', label: '正二十面体' },
    ]},
    { key: 'stellationDepth', type: 'range', label: '星形深度', min: 0.5, max: 3, step: 0.1, hint: '尖角突出程度' },
    { key: 'styleType', type: 'select', label: '样式类型', options: [{ value: 'line', label: '线条' }, { value: 'solid', label: '实心' }] },
    { key: 'showBase', type: 'checkbox', label: '显示基础形状' },
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationZ', type: 'range', label: 'Z轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'scale', type: 'range', label: '缩放', min: 40, max: 100, step: 5 },
  ],
  buckyball: [
    { key: 'styleType', type: 'select', label: '样式类型', options: [{ value: 'line', label: '线条' }, { value: 'solid', label: '实心' }] },
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationZ', type: 'range', label: 'Z轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'scale', type: 'range', label: '缩放', min: 50, max: 110, step: 5 },
  ],
  torusKnot: [
    { key: 'p', type: 'range', label: 'P值', min: 1, max: 5, step: 1, hint: '绕大圆圈数' },
    { key: 'styleType', type: 'select', label: '样式类型', options: [{ value: 'line', label: '线条' }, { value: 'solid', label: '实心' }] },
    { key: 'q', type: 'range', label: 'Q值', min: 1, max: 8, step: 1, hint: '绕小圆圈数' },
    { key: 'tubeRadius', type: 'range', label: '管道半径', min: 0.1, max: 0.6, step: 0.05 },
    { key: 'segments', type: 'range', label: '细分数', min: 100, max: 300, step: 50, hint: '曲线平滑度' },
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationZ', type: 'range', label: 'Z轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'scale', type: 'range', label: '缩放', min: 50, max: 100, step: 5 },
  ],
  stereographic: [
    { key: 'latitudeLines', type: 'range', label: '纬线数', min: 3, max: 12, step: 1 },
    { key: 'longitudeLines', type: 'range', label: '经线数', min: 6, max: 24, step: 2 },
    { key: 'styleType', type: 'select', label: '样式类型', options: [{ value: 'line', label: '线条' }, { value: 'solid', label: '实心' }] },
    { key: 'gridStyle', type: 'select', label: '网格样式', options: [
      { value: 'full', label: '完整球面' },
      { value: 'hemisphere', label: '半球' },
      { value: 'quarter', label: '四分之一' },
    ]},
    { key: 'showEquator', type: 'checkbox', label: '强调赤道' },
    { key: 'rotationX', type: 'range', label: 'X轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationY', type: 'range', label: 'Y轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'rotationZ', type: 'range', label: 'Z轴旋转', min: 0, max: Math.PI * 2, step: 0.01 },
    { key: 'scale', type: 'range', label: '缩放', min: 60, max: 110, step: 5 },
  ],
  // 参数曲线类
  butterfly: [
    { key: 'scale', type: 'range', label: '缩放', min: 20, max: 50, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  cardioid: [
    { key: 'scale', type: 'range', label: '缩放', min: 30, max: 70, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  astroid: [
    { key: 'scale', type: 'range', label: '缩放', min: 60, max: 120, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  lemniscate: [
    { key: 'scale', type: 'range', label: '缩放', min: 50, max: 100, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  squircle: [
    { key: 'n', type: 'range', label: '圆角指数 n', min: 2, max: 10, step: 0.5, hint: 'n=2 圆形, n=4 iOS图标, n→∞ 方形' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  koch: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 1, max: 6, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  sierpinski: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 1, max: 7, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  tree: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 4, max: 12, step: 1 },
    { key: 'angle', type: 'range', label: '分支角度', min: 10, max: 45, step: 1, suffix: '°' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  dragon: [
    { key: 'iterations', type: 'range', label: '迭代次数', min: 6, max: 15, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  spirograph: [
    { key: 'R', type: 'range', label: '外圆 R', min: 40, max: 120, step: 1 },
    { key: 'r', type: 'range', label: '内圆 r', min: 10, max: 80, step: 1 },
    { key: 'd', type: 'range', label: '笔距 d', min: 10, max: 100, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  rose: [
    { key: 'k', type: 'range', label: '花瓣 k', min: 2, max: 12, step: 0.5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  lissajous: [
    { key: 'a', type: 'range', label: '频率 a', min: 1, max: 10, step: 1 },
    { key: 'b', type: 'range', label: '频率 b', min: 1, max: 10, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  logspiral: [
    { key: 'b', type: 'range', label: '增长率 b', min: 0.05, max: 0.3, step: 0.01 },
    { key: 'turns', type: 'range', label: '圈数', min: 2, max: 8, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  wireframe: [
    // 基础形状
    { key: 'shapeType', type: 'select', label: '形状类型', options: [
      { value: 'regular', label: '正多边形' },
      { value: 'star', label: '星形' },
      { value: 'rounded', label: '圆角多边形' },
    ]},
    { key: 'vertices', type: 'range', label: '顶点数', min: 3, max: 12, step: 1 },
    { key: 'innerRadiusRatio', type: 'range', label: '内圈比例', min: 0.1, max: 0.8, step: 0.05, hint: '星形内圈大小', showWhen: { shapeType: 'star' } },
    { key: 'roundness', type: 'range', label: '圆角程度', min: 0, max: 1, step: 0.1, hint: '0=直角, 1=最大圆角', showWhen: { shapeType: 'rounded' } },
    // 连接样式
    { key: 'connectionStyle', type: 'select', label: '连接方式', options: [
      { value: 'none', label: '无连接' },
      { value: 'center', label: '连接中心' },
      { value: 'adjacent', label: '隔点连接' },
      { value: 'all', label: '全连接网络' },
    ]},
    { key: 'showVertices', type: 'checkbox', label: '显示顶点' },
    { key: 'vertexRadius', type: 'range', label: '顶点大小', min: 2, max: 10, step: 1, showWhen: { showVertices: true } },
    // 层次嵌套
    { key: 'layers', type: 'range', label: '嵌套层数', min: 1, max: 5, step: 1 },
    { key: 'layerScale', type: 'range', label: '层缩放比', min: 0.4, max: 0.9, step: 0.05, hint: '每层相对上层的缩放', showWhen: (params) => params.layers > 1 },
    { key: 'layerRotation', type: 'range', label: '层旋转偏移', min: 0, max: 60, step: 5, suffix: '°', hint: '每层相对上层的旋转', showWhen: (params) => params.layers > 1 },
    // 整体旋转
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  islamic: [
    { key: 'rings', type: 'range', label: '环数', min: 1, max: 5, step: 1 },
    { key: 'petals', type: 'range', label: '花瓣数', min: 4, max: 16, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  radial: [
    { key: 'lines', type: 'range', label: '线条数量', min: 3, max: 16, step: 1 },
    { key: 'length', type: 'range', label: '线条长度', min: 30, max: 100, step: 5 },
    { key: 'thickness', type: 'range', label: '线条粗细', min: 4, max: 24, step: 2 },
    { key: 'gap', type: 'range', label: '中心间距', min: 0, max: 80, step: 5 },
    { key: 'spiral', type: 'range', label: '螺旋偏移', min: -45, max: 45, step: 1, suffix: '°', hint: '产生旋转动感' },
    { key: 'gradientDirection', type: 'select', label: '渐变方向', options: [{ value: 'outward', label: '向外渐变' }, { value: 'inward', label: '向内渐变' }] },
    { key: 'roundCap', type: 'checkbox', label: '圆角端点' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  shard: [
    { key: 'shardCount', type: 'range', label: '碎片数量', min: 6, max: 20, step: 2 },
    { key: 'layers', type: 'range', label: '层数', min: 2, max: 5, step: 1 },
    { key: 'irregularity', type: 'range', label: '不规则度', min: 0, max: 0.6, step: 0.1, hint: '边缘扭曲程度' },
    { key: 'fillOpacity', type: 'range', label: '填充透明度', min: 0.1, max: 0.6, step: 0.1 },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
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
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 旋转叶片
  spinner: [
    { key: 'bladeCount', type: 'range', label: '叶片数量', min: 3, max: 12, step: 1 },
    { key: 'curvature', type: 'range', label: '弯曲度', min: 0, max: 90, step: 5, suffix: '°', hint: '叶片弯曲角度' },
    { key: 'innerRadius', type: 'range', label: '内半径', min: 10, max: 60, step: 5 },
    { key: 'outerRadius', type: 'range', label: '外半径', min: 60, max: 120, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 凯尔特结
  celticKnot: [
    { key: 'knotType', type: 'select', label: '结型', options: [
      { value: 'triquetra', label: '三叶结' },
      { value: 'quaternary', label: '四元结' },
      { value: 'endless', label: '无尽结' },
      { value: 'triskele', label: '三旋臂' },
    ]},
    { key: 'complexity', type: 'range', label: '复杂度', min: 1, max: 4, step: 1 },
    { key: 'weaveWidth', type: 'range', label: '编织宽度', min: 6, max: 20, step: 2 },
    { key: 'showBorder', type: 'checkbox', label: '显示边框' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 太极变体
  yinYang: [
    { key: 'divisions', type: 'range', label: '分割数', min: 2, max: 6, step: 1, hint: '2=传统太极' },
    { key: 'innerDots', type: 'checkbox', label: '显示阴阳点' },
    { key: 'dotSize', type: 'range', label: '点大小', min: 0.1, max: 0.25, step: 0.05 },
    { key: 'spiralEffect', type: 'range', label: '螺旋效果', min: 0, max: 50, step: 5 },
    { key: 'outline', type: 'checkbox', label: '显示轮廓' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 禅圆
  enso: [
    { key: 'openingSize', type: 'range', label: '开口大小', min: 5, max: 60, step: 5, suffix: '°' },
    { key: 'openingPosition', type: 'range', label: '开口位置', min: 0, max: 360, step: 15, suffix: '°' },
    { key: 'brushWidth', type: 'range', label: '笔刷宽度', min: 10, max: 40, step: 5 },
    { key: 'taperStart', type: 'range', label: '起笔渐变', min: 0.1, max: 0.5, step: 0.1 },
    { key: 'taperEnd', type: 'range', label: '收笔渐变', min: 0.1, max: 0.5, step: 0.1 },
    { key: 'roughness', type: 'range', label: '粗糙度', min: 0, max: 0.1, step: 0.01, hint: '笔触不规则感' },
    { key: 'inkSplash', type: 'checkbox', label: '墨迹飞溅' },
    { key: 'innerCircle', type: 'checkbox', label: '内圈装饰' },
    { key: 'seed', type: 'range', label: '随机种子', min: 1, max: 100, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 彭罗斯拼贴
  penrose: [
    { key: 'tileType', type: 'select', label: '拼贴类型', options: [
      { value: 'kite-dart', label: '风筝飞镖' },
      { value: 'rhombus', label: '菱形' },
      { value: 'pentagons', label: '五边形' },
      { value: 'stars', label: '星形' },
    ]},
    { key: 'iterations', type: 'range', label: '迭代层数', min: 1, max: 4, step: 1 },
    { key: 'showOutline', type: 'checkbox', label: '显示外框' },
    { key: 'fillAlternate', type: 'checkbox', label: '交替填充' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 梅塔特隆立方
  metatron: [
    { key: 'showCircles', type: 'checkbox', label: '显示基础圆' },
    { key: 'showConnections', type: 'checkbox', label: '显示连接线' },
    { key: 'showInnerPatterns', type: 'checkbox', label: '显示内部图案' },
    { key: 'circleStyle', type: 'select', label: '圆形样式', options: [
      { value: 'solid', label: '实线' },
      { value: 'dashed', label: '虚线' },
      { value: 'dotted', label: '点线' },
    ]},
    { key: 'complexity', type: 'range', label: '复杂度', min: 1, max: 4, step: 1 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 生命之花
  flowerOfLife: [
    { key: 'pattern', type: 'select', label: '图案类型', options: [
      { value: 'seed', label: '生命种子' },
      { value: 'flower', label: '生命之花' },
      { value: 'fruit', label: '生命之果' },
      { value: 'full', label: '完整版' },
    ]},
    { key: 'rings', type: 'range', label: '圈数', min: 1, max: 5, step: 1 },
    { key: 'showOuterCircle', type: 'checkbox', label: '显示外圈' },
    { key: 'fillPetals', type: 'checkbox', label: '填充花瓣' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 衔尾蛇
  ouroboros: [
    { key: 'style', type: 'select', label: '风格', options: [
      { value: 'serpent', label: '蛇形' },
      { value: 'dragon', label: '龙形' },
      { value: 'geometric', label: '几何' },
      { value: 'double', label: '双蛇缠绕' },
    ]},
    { key: 'bodySegments', type: 'range', label: '身体节数', min: 12, max: 36, step: 4 },
    { key: 'headSize', type: 'range', label: '头部大小', min: 0.8, max: 1.5, step: 0.1 },
    { key: 'bodyTaper', type: 'range', label: '身体渐细', min: 0.1, max: 0.5, step: 0.1 },
    { key: 'scales', type: 'checkbox', label: '显示鳞片' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: -180, max: 180, step: 15, suffix: '°' },
  ],
  // 迷宫
  labyrinth: [
    { key: 'labyrinthType', type: 'select', label: '迷宫类型', options: [
      { value: 'chartres', label: '沙特尔' },
      { value: 'classical', label: '经典克里特' },
      { value: 'meander', label: '希腊回纹' },
      { value: 'roman', label: '罗马' },
    ]},
    { key: 'circuits', type: 'range', label: '回路数', min: 3, max: 11, step: 1 },
    { key: 'showCenter', type: 'checkbox', label: '显示中心' },
    { key: 'pathWidth', type: 'range', label: '路径宽度', min: 4, max: 16, step: 2 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 欧普艺术
  opArt: [
    { key: 'pattern', type: 'select', label: '图案类型', options: [
      { value: 'checkerboard', label: '棋盘格' },
      { value: 'stripes', label: '条纹' },
      { value: 'circles', label: '同心圆' },
      { value: 'bulge', label: '膨胀格' },
      { value: 'spiral', label: '螺旋' },
    ]},
    { key: 'density', type: 'range', label: '密度', min: 5, max: 20, step: 1 },
    { key: 'distortion', type: 'range', label: '扭曲程度', min: 0, max: 1, step: 0.1, hint: '视觉错觉强度' },
    { key: 'contrast', type: 'checkbox', label: '高对比度' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 字母组合
  monogram: [
    { key: 'letters', type: 'text', label: '字母', hint: '输入1-3个字母' },
    { key: 'style', type: 'select', label: '风格', options: [
      { value: 'overlap', label: '重叠' },
      { value: 'interlock', label: '交织' },
      { value: 'mirror', label: '镜像' },
      { value: 'geometric', label: '几何' },
    ]},
    { key: 'arrangement', type: 'select', label: '排列', options: [
      { value: 'horizontal', label: '水平' },
      { value: 'vertical', label: '垂直' },
      { value: 'diagonal', label: '对角' },
      { value: 'circular', label: '环形' },
    ]},
    { key: 'letterWeight', type: 'select', label: '字重', options: [
      { value: 'light', label: '细体' },
      { value: 'regular', label: '常规' },
      { value: 'bold', label: '粗体' },
    ]},
    { key: 'showFrame', type: 'checkbox', label: '显示外框' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 15, suffix: '°' },
  ],
  // 连笔书法
  script: [
    { key: 'text', type: 'text', label: '文字', hint: '输入1-8个字母' },
    { key: 'style', type: 'select', label: '风格', options: [
      { value: 'elegant', label: '优雅' },
      { value: 'playful', label: '活泼' },
      { value: 'formal', label: '正式' },
      { value: 'brush', label: '毛笔' },
    ]},
    { key: 'connectLetters', type: 'checkbox', label: '字母连接' },
    { key: 'slant', type: 'range', label: '倾斜角度', min: 0, max: 30, step: 5, suffix: '°' },
    { key: 'thickness', type: 'select', label: '粗细', options: [
      { value: 'thin', label: '细' },
      { value: 'medium', label: '中' },
      { value: 'thick', label: '粗' },
    ]},
    { key: 'flourish', type: 'checkbox', label: '装饰花饰' },
    { key: 'gradientEffect', type: 'checkbox', label: '渐变效果' },
  ],
  // 镂空模板
  stencil: [
    { key: 'text', type: 'text', label: '文字', hint: '输入1-8个字母' },
    { key: 'style', type: 'select', label: '风格', options: [
      { value: 'military', label: '军事' },
      { value: 'industrial', label: '工业' },
      { value: 'modern', label: '现代' },
    ]},
    { key: 'cutStyle', type: 'select', label: '镂空样式', options: [
      { value: 'center', label: '居中' },
      { value: 'edge', label: '边缘' },
      { value: 'random', label: '随机' },
    ]},
    { key: 'spacing', type: 'select', label: '字间距', options: [
      { value: 'tight', label: '紧凑' },
      { value: 'normal', label: '正常' },
      { value: 'wide', label: '宽松' },
    ]},
    { key: 'borderFrame', type: 'checkbox', label: '显示边框' },
  ],
  // 霓虹灯
  neon: [
    { key: 'text', type: 'text', label: '文字', hint: '输入1-8个字母' },
    { key: 'glowIntensity', type: 'range', label: '发光强度', min: 0.3, max: 1, step: 0.1 },
    { key: 'tubeStyle', type: 'select', label: '灯管样式', options: [
      { value: 'round', label: '圆管' },
      { value: 'flat', label: '扁平' },
      { value: 'vintage', label: '复古' },
    ]},
    { key: 'flicker', type: 'checkbox', label: '闪烁效果' },
    { key: 'backing', type: 'checkbox', label: '显示背板' },
  ],
  // 复古排版
  retro: [
    { key: 'text', type: 'text', label: '文字', hint: '输入1-8个字母' },
    { key: 'style', type: 'select', label: '风格', options: [
      { value: 'vintage', label: '复古' },
      { value: 'art-deco', label: 'Art Deco' },
      { value: 'groovy', label: '70年代' },
      { value: 'western', label: '西部' },
    ]},
    { key: 'layers', type: 'range', label: '层数', min: 1, max: 5, step: 1 },
    { key: 'layerOffset', type: 'range', label: '层偏移', min: 1, max: 6, step: 1 },
    { key: 'inline', type: 'checkbox', label: '内线装饰' },
    { key: 'serifs', type: 'checkbox', label: '衬线' },
  ],
  // 渐变文字
  gradientText: [
    { key: 'text', type: 'text', label: '文字', hint: '输入1-8个字母' },
    { key: 'gradientType', type: 'select', label: '渐变类型', options: [
      { value: 'linear', label: '线性' },
      { value: 'radial', label: '径向' },
      { value: 'conic', label: '锥形' },
    ]},
    { key: 'gradientAngle', type: 'range', label: '渐变角度', min: 0, max: 360, step: 15, suffix: '°' },
    { key: 'colorStops', type: 'range', label: '颜色节点', min: 2, max: 5, step: 1 },
    { key: 'strokeOutline', type: 'checkbox', label: '描边轮廓' },
    { key: 'glossy', type: 'checkbox', label: '光泽效果' },
    { key: 'fontWeight', type: 'select', label: '字重', options: [
      { value: 'light', label: '细体' },
      { value: 'regular', label: '常规' },
      { value: 'bold', label: '粗体' },
    ]},
  ],
  // 3D阴影
  shadowText: [
    { key: 'text', type: 'text', label: '文字', hint: '输入1-8个字母' },
    { key: 'shadowDepth', type: 'range', label: '阴影深度', min: 2, max: 15, step: 1 },
    { key: 'shadowAngle', type: 'range', label: '阴影方向', min: 0, max: 360, step: 15, suffix: '°' },
    { key: 'perspective', type: 'select', label: '透视类型', options: [
      { value: 'flat', label: '平面' },
      { value: 'isometric', label: '等轴测' },
      { value: 'extrude', label: '挤压' },
    ]},
    { key: 'fillStyle', type: 'select', label: '填充样式', options: [
      { value: 'solid', label: '实心' },
      { value: 'outline', label: '轮廓' },
      { value: 'striped', label: '条纹' },
    ]},
    { key: 'fontWeight', type: 'select', label: '字重', options: [
      { value: 'light', label: '细体' },
      { value: 'regular', label: '常规' },
      { value: 'bold', label: '粗体' },
    ]},
  ],
  // 花瓣
  petal: [
    { key: 'petals', type: 'range', label: '花瓣数', min: 4, max: 16, step: 1 },
    { key: 'petalLength', type: 'range', label: '花瓣长度', min: 20, max: 70, step: 5 },
    { key: 'petalWidth', type: 'range', label: '花瓣宽度', min: 8, max: 35, step: 2 },
    { key: 'spread', type: 'range', label: '距中心', min: 5, max: 50, step: 5 },
    { key: 'centerRadius', type: 'range', label: '中心圆大小', min: 0, max: 20, step: 2 },
    { key: 'petalShape', type: 'select', label: '形状', options: [
      { value: 'ellipse', label: '椭圆' },
      { value: 'teardrop', label: '水滴' },
      { value: 'round', label: '圆形' },
    ]},
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 旋涡
  swirl: [
    { key: 'blades', type: 'range', label: '叶片数', min: 2, max: 8, step: 1 },
    { key: 'twist', type: 'range', label: '扭曲角度', min: 20, max: 120, step: 5, suffix: '°' },
    { key: 'innerRadius', type: 'range', label: '内半径', min: 10, max: 50, step: 5 },
    { key: 'outerRadius', type: 'range', label: '外半径', min: 50, max: 100, step: 5 },
    { key: 'bladeWidth', type: 'range', label: '叶片宽度', min: 0.3, max: 0.9, step: 0.1, hint: '叶片占比' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 旋转三角
  spinningTriangles: [
    { key: 'count', type: 'range', label: '三角形数', min: 3, max: 12, step: 1 },
    { key: 'innerRadius', type: 'range', label: '内半径', min: 20, max: 60, step: 5 },
    { key: 'outerRadius', type: 'range', label: '外半径', min: 60, max: 120, step: 5 },
    { key: 'triangleRotation', type: 'range', label: '自身旋转', min: -90, max: 90, step: 5, suffix: '°' },
    { key: 'gap', type: 'range', label: '间隙', min: 0.1, max: 0.6, step: 0.1 },
    { key: 'strokeWidth', type: 'range', label: '线条粗细', min: 1, max: 6, step: 1 },
    { key: 'filled', type: 'checkbox', label: '填充' },
    { key: 'centerDot', type: 'checkbox', label: '显示中心点' },
    { key: 'centerRadius', type: 'range', label: '中心点大小', min: 2, max: 12, step: 2 },
    { key: 'rotation', type: 'range', label: '整体旋转', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 风车
  pinwheel: [
    { key: 'blades', type: 'range', label: '叶片数', min: 2, max: 8, step: 1 },
    { key: 'radius', type: 'range', label: '半径', min: 50, max: 120, step: 5 },
    { key: 'curve', type: 'range', label: '曲率', min: 0, max: 0.8, step: 0.05, hint: '叶片弯曲程度' },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
  // 圆形花
  circleFlower: [
    { key: 'petals', type: 'range', label: '花瓣数', min: 3, max: 12, step: 1 },
    { key: 'petalRadius', type: 'range', label: '花瓣大小', min: 20, max: 60, step: 5 },
    { key: 'spread', type: 'range', label: '展开距离', min: 15, max: 60, step: 5 },
    { key: 'centerRadius', type: 'range', label: '中心大小', min: 5, max: 30, step: 5 },
    { key: 'rotation', type: 'range', label: '旋转角度', min: 0, max: 360, step: 5, suffix: '°' },
  ],
};

// 获取参数控制配置
export const getParamControls = (type) => PARAM_CONTROLS[type] || [];

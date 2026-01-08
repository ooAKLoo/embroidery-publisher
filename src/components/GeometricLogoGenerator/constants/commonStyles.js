// 通用样式配置 - 所有图形共享的样式参数

// 端点样式选项
export const LINE_CAP_OPTIONS = [
  { value: 'round', label: '圆角' },
  { value: 'square', label: '方角' },
  { value: 'butt', label: '平头' },
];

// 转角样式选项
export const LINE_JOIN_OPTIONS = [
  { value: 'round', label: '圆角' },
  { value: 'miter', label: '尖角' },
  { value: 'bevel', label: '斜角' },
];

// 线条样式选项
export const DASH_STYLE_OPTIONS = [
  { value: 'solid', label: '实线', dashArray: null },
  { value: 'dashed', label: '虚线', dashArray: '8,4' },
  { value: 'dotted', label: '点线', dashArray: '2,4' },
  { value: 'dash-dot', label: '点划线', dashArray: '8,4,2,4' },
];

// 渲染模式选项
export const RENDER_MODE_OPTIONS = [
  { value: 'stroke', label: '边线' },
  { value: 'fill', label: '填充' },
  { value: 'both', label: '边线+填充' },
];

// 默认通用样式
export const DEFAULT_COMMON_STYLES = {
  lineCap: 'round',      // 端点样式
  lineJoin: 'round',     // 转角样式
  dashStyle: 'solid',    // 线条样式
  renderMode: 'stroke',  // 渲染模式: stroke | fill | both
  fillOpacity: 0.3,      // 填充透明度
  showOuterBorder: true, // 显示外边界（部分图形支持）
};

// 通用样式控件配置
export const COMMON_STYLE_CONTROLS = [
  {
    key: 'renderMode',
    type: 'select',
    label: '渲染模式',
    options: RENDER_MODE_OPTIONS,
    hint: '边线、填充或两者兼有',
  },
  {
    key: 'fillOpacity',
    type: 'slider',
    label: '填充透明度',
    min: 0.1,
    max: 1,
    step: 0.1,
    hint: '填充颜色的透明度',
    showWhen: (styles) => styles.renderMode === 'fill' || styles.renderMode === 'both',
  },
  {
    key: 'lineCap',
    type: 'select',
    label: '端点样式',
    options: LINE_CAP_OPTIONS,
    hint: '线条端点的形状',
    showWhen: (styles) => styles.renderMode === 'stroke' || styles.renderMode === 'both',
  },
  {
    key: 'lineJoin',
    type: 'select',
    label: '转角样式',
    options: LINE_JOIN_OPTIONS,
    hint: '线条转角的处理方式',
    showWhen: (styles) => styles.renderMode === 'stroke' || styles.renderMode === 'both',
  },
  {
    key: 'dashStyle',
    type: 'select',
    label: '线条样式',
    options: DASH_STYLE_OPTIONS,
    hint: '实线、虚线或点线',
    showWhen: (styles) => styles.renderMode === 'stroke' || styles.renderMode === 'both',
  },
];

// 获取 dashArray 值
export const getDashArray = (dashStyle, strokeWidth = 2) => {
  const style = DASH_STYLE_OPTIONS.find(s => s.value === dashStyle);
  if (!style || !style.dashArray) return null;

  // 根据线条粗细缩放 dashArray
  const scale = strokeWidth / 2;
  return style.dashArray.split(',').map(n => parseFloat(n) * scale).join(',');
};

// 生成 SVG 样式属性对象
export const getSvgStrokeProps = (commonStyles = {}, strokeWidth = 2) => {
  const {
    lineCap = DEFAULT_COMMON_STYLES.lineCap,
    lineJoin = DEFAULT_COMMON_STYLES.lineJoin,
    dashStyle = DEFAULT_COMMON_STYLES.dashStyle,
  } = commonStyles;

  const props = {
    strokeLinecap: lineCap,
    strokeLinejoin: lineJoin,
  };

  const dashArray = getDashArray(dashStyle, strokeWidth);
  if (dashArray) {
    props.strokeDasharray = dashArray;
  }

  return props;
};

// 特定图形的边界控制配置
// 这些图形支持 "显示外边界" 选项
export const BORDER_SUPPORTED_TYPES = [
  'islamic',      // 花窗图案
  'flowerOfLife', // 生命之花
  'concentric',   // 同心圆环
  'mandala',      // 曼陀罗
  'spiral',       // 螺旋线
  'labyrinth',    // 迷宫
  'metatron',     // 梅塔特隆
  'penrose',      // 彭罗斯拼贴
  'opArt',        // 欧普艺术
];

// 检查图形是否支持边界控制
export const supportsBorderControl = (typeId) => {
  return BORDER_SUPPORTED_TYPES.includes(typeId);
};

/**
 * 根据渲染模式获取 SVG 渲染属性
 * @param {object} commonStyles - 通用样式配置
 * @param {string} colorValue - 颜色值（可以是渐变 URL 或纯色）
 * @param {number} strokeWidth - 线条宽度
 * @returns {object} 包含 stroke, fill, fillOpacity 和其他 stroke 属性
 */
export const getRenderProps = (commonStyles = {}, colorValue, strokeWidth = 2) => {
  const {
    renderMode = DEFAULT_COMMON_STYLES.renderMode,
    fillOpacity = DEFAULT_COMMON_STYLES.fillOpacity,
  } = commonStyles;

  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);

  const props = {
    ...strokeProps,
  };

  switch (renderMode) {
    case 'stroke':
      props.stroke = colorValue;
      props.strokeWidth = strokeWidth;
      props.fill = 'none';
      break;
    case 'fill':
      props.stroke = 'none';
      props.strokeWidth = 0;
      props.fill = colorValue;
      props.fillOpacity = fillOpacity;
      break;
    case 'both':
      props.stroke = colorValue;
      props.strokeWidth = strokeWidth;
      props.fill = colorValue;
      props.fillOpacity = fillOpacity;
      break;
    default:
      props.stroke = colorValue;
      props.strokeWidth = strokeWidth;
      props.fill = 'none';
  }

  return props;
};

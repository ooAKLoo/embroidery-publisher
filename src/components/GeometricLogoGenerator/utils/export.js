/**
 * Logo 导出工具函数
 *
 * 导出逻辑说明：
 * - 导出与预览缩放(zoom)无关，始终生成标准化的图标
 * - 图案居中并占据画布的合理比例（默认 70%），四周留有安全边距
 * - 支持圆角导出（macOS Dock 风格）
 * - 符合 Apple、Google 等平台的 App Icon 设计规范
 *
 * 导出目录结构：
 * - resources/icon.svg - 原始矢量图
 * - resources/icon.png - 高清 PNG (1024x1024)
 * - resources/icon.icns - macOS 应用图标
 * - public/icon.svg - 网站用 SVG
 * - public/favicon.png - 网站 favicon
 * - public/{name}.svg - 品牌 Logo
 */
import JSZip from 'jszip';

const normalizeBlendModes = (svgElement, fallback = 'normal') => {
  if (!svgElement?.querySelectorAll) return;
  svgElement.querySelectorAll('*').forEach((el) => {
    if (!el?.style?.mixBlendMode) return;
    if (el.style.mixBlendMode !== fallback) {
      el.style.mixBlendMode = fallback;
    }
  });
};

/**
 * 获取 SVG 中实际图形内容的边界框
 * @param {SVGElement} svgElement - SVG 元素
 * @returns {Object} 边界框 {x, y, width, height}
 */
const getContentBBox = (svgElement) => {
  try {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const applyBBox = (bbox) => {
      if (!bbox || !Number.isFinite(bbox.width) || bbox.width <= 0) return;
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    };

    let rootBBox;
    try {
      try {
        rootBBox = svgElement.getBBox({ stroke: true });
      } catch (e) {
        rootBBox = svgElement.getBBox();
      }
    } catch (e) {
      rootBBox = null;
    }
    applyBBox(rootBBox);

    const contentElements = Array.from(svgElement.children).filter(
      child => child.tagName.toLowerCase() !== 'defs'
    );
    contentElements.forEach(el => {
      if (!el.getBBox) return;
      try {
        let bbox;
        try {
          bbox = el.getBBox({ stroke: true });
        } catch (e) {
          bbox = el.getBBox();
        }
        applyBBox(bbox);
      } catch (e) {
        // 某些元素可能无法获取 bbox
      }
    });

    if (minX === Infinity) {
      const viewBox = svgElement?.viewBox?.baseVal;
      if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
        return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
      }
      return { x: 0, y: 0, width: 300, height: 300 };
    }

    let strokePadding = 0;
    try {
      const strokeEls = svgElement.querySelectorAll('[stroke-width], [style]');
      strokeEls.forEach(el => {
        let width = 0;
        const attr = el.getAttribute('stroke-width');
        if (attr) {
          width = parseFloat(attr);
        } else if (el.style && el.style.strokeWidth) {
          width = parseFloat(el.style.strokeWidth);
        } else if (typeof window !== 'undefined' && window.getComputedStyle) {
          const computed = window.getComputedStyle(el);
          if (computed && computed.strokeWidth) {
            width = parseFloat(computed.strokeWidth);
          }
        }
        if (Number.isFinite(width)) {
          strokePadding = Math.max(strokePadding, width / 2);
        }
      });
    } catch (e) {
      strokePadding = 0;
    }

    if (strokePadding > 0) {
      minX -= strokePadding;
      minY -= strokePadding;
      maxX += strokePadding;
      maxY += strokePadding;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      const viewBox = svgElement?.viewBox?.baseVal;
      if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
        return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
      }
      return { x: 0, y: 0, width: 300, height: 300 };
    }

    return {
      x: minX,
      y: minY,
      width,
      height
    };
  } catch (e) {
    return { x: 0, y: 0, width: 300, height: 300 };
  }
};

/**
 * 创建 macOS 风格的图标 SVG（带透明边距）
 *
 * macOS Dock 图标规范：
 * - 图标内容（包括背景）应占画布的约 80%
 * - 四周留出约 10% 的透明边距
 * - 系统会自动添加阴影效果
 *
 * @param {SVGElement} svgElement - 原始 SVG 元素
 * @param {number} exportSize - 导出画布尺寸
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图案占背景的比例 (0-1)
 * @param {number} borderRadius - 圆角半径比例 (0-0.5)
 * @param {number} contentRatio - 整体内容占画布比例，macOS 推荐 0.8
 */
const createMacOSIconSvg = (svgElement, exportSize, bgColor, iconScale = 0.7, borderRadius = 0.22, contentRatio = 0.8) => {
  const contentBBox = getContentBBox(svgElement);

  const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', exportSize);
  exportSvg.setAttribute('height', exportSize);
  exportSvg.setAttribute('viewBox', `0 0 ${exportSize} ${exportSize}`);

  // 计算内容区域（整体缩小到 contentRatio）
  const contentSize = exportSize * contentRatio;
  const contentOffset = (exportSize - contentSize) / 2;

  // 复制 defs（渐变、滤镜等定义）
  const originalDefs = svgElement.querySelector('defs');
  if (originalDefs) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    Array.from(originalDefs.children).forEach(child => {
      defs.appendChild(child.cloneNode(true));
    });
    exportSvg.appendChild(defs);
  }

  // 创建内容组
  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // 添加圆角背景矩形
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', contentSize);
  bgRect.setAttribute('height', contentSize);
  bgRect.setAttribute('x', contentOffset);
  bgRect.setAttribute('y', contentOffset);
  bgRect.setAttribute('fill', bgColor);
  const radius = contentSize * borderRadius;
  bgRect.setAttribute('rx', radius);
  bgRect.setAttribute('ry', radius);
  mainGroup.appendChild(bgRect);

  // 创建裁剪路径（确保图案不超出圆角）
  const defs = exportSvg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  if (!exportSvg.querySelector('defs')) {
    exportSvg.insertBefore(defs, exportSvg.firstChild);
  }

  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', 'macos-clip');
  clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
  const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  clipRect.setAttribute('width', contentSize);
  clipRect.setAttribute('height', contentSize);
  clipRect.setAttribute('x', contentOffset);
  clipRect.setAttribute('y', contentOffset);
  clipRect.setAttribute('rx', radius);
  clipRect.setAttribute('ry', radius);
  clipPath.appendChild(clipRect);
  defs.appendChild(clipPath);

  // 外层裁剪（保证导出画布本身是圆角）
  const outerClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  outerClipPath.setAttribute('id', 'macos-outer-clip');
  outerClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
  const outerClipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  outerClipRect.setAttribute('width', exportSize);
  outerClipRect.setAttribute('height', exportSize);
  outerClipRect.setAttribute('x', 0);
  outerClipRect.setAttribute('y', 0);
  const outerRadius = exportSize * borderRadius;
  outerClipRect.setAttribute('rx', outerRadius);
  outerClipRect.setAttribute('ry', outerRadius);
  outerClipPath.appendChild(outerClipRect);
  defs.appendChild(outerClipPath);

  // 计算图标在内容区域中的位置
  const targetIconSize = contentSize * iconScale;
  const contentMaxSize = Math.max(contentBBox.width, contentBBox.height);
  const scaleRatio = targetIconSize / contentMaxSize;

  const scaledWidth = contentBBox.width * scaleRatio;
  const scaledHeight = contentBBox.height * scaleRatio;
  const iconOffsetX = (contentSize - scaledWidth) / 2 - contentBBox.x * scaleRatio;
  const iconOffsetY = (contentSize - scaledHeight) / 2 - contentBBox.y * scaleRatio;

  // 创建图标内容组
  const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  iconGroup.setAttribute('transform', `translate(${contentOffset + iconOffsetX}, ${contentOffset + iconOffsetY}) scale(${scaleRatio})`);

  Array.from(svgElement.children).forEach(child => {
    if (child.tagName.toLowerCase() !== 'defs') {
      iconGroup.appendChild(child.cloneNode(true));
    }
  });

  mainGroup.appendChild(iconGroup);
  mainGroup.setAttribute('clip-path', 'url(#macos-clip)');
  const rootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rootGroup.setAttribute('clip-path', 'url(#macos-outer-clip)');
  rootGroup.appendChild(mainGroup);
  exportSvg.appendChild(rootGroup);

  return exportSvg;
};

/**
 * 创建导出专用的标准化 SVG
 * @param {SVGElement} svgElement - 原始 SVG 元素
 * @param {number} exportSize - 导出画布尺寸
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图标占画布比例 (0-1)
 * @param {number} borderRadius - 圆角半径比例 (0-0.5)，0 表示无圆角
 */
const createExportSvg = (svgElement, exportSize, bgColor, iconScale = 0.7, borderRadius = 0) => {
  const contentBBox = getContentBBox(svgElement);

  const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', exportSize);
  exportSvg.setAttribute('height', exportSize);
  exportSvg.setAttribute('viewBox', `0 0 ${exportSize} ${exportSize}`);

  // 如果需要圆角，创建 clipPath
  if (borderRadius > 0) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'rounded-clip');

    const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const radius = exportSize * borderRadius;
    clipRect.setAttribute('width', exportSize);
    clipRect.setAttribute('height', exportSize);
    clipRect.setAttribute('rx', radius);
    clipRect.setAttribute('ry', radius);

    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);
    exportSvg.appendChild(defs);
  }

  // 创建主内容组（可能被裁剪）
  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  if (borderRadius > 0) {
    mainGroup.setAttribute('clip-path', 'url(#rounded-clip)');
  }

  // 添加背景矩形
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', exportSize);
  bgRect.setAttribute('height', exportSize);
  bgRect.setAttribute('fill', bgColor);
  if (borderRadius > 0) {
    const radius = exportSize * borderRadius;
    bgRect.setAttribute('rx', radius);
    bgRect.setAttribute('ry', radius);
  }
  mainGroup.appendChild(bgRect);

  // 计算图标在导出画布中的目标尺寸
  const targetIconSize = exportSize * iconScale;
  const contentSize = Math.max(contentBBox.width, contentBBox.height);
  const scaleRatio = targetIconSize / contentSize;

  const scaledWidth = contentBBox.width * scaleRatio;
  const scaledHeight = contentBBox.height * scaleRatio;
  const offsetX = (exportSize - scaledWidth) / 2 - contentBBox.x * scaleRatio;
  const offsetY = (exportSize - scaledHeight) / 2 - contentBBox.y * scaleRatio;

  // 复制 defs（渐变、滤镜等定义）- 合并到现有 defs 或创建新的
  const originalDefs = svgElement.querySelector('defs');
  if (originalDefs) {
    let existingDefs = exportSvg.querySelector('defs');
    if (!existingDefs) {
      existingDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      exportSvg.insertBefore(existingDefs, exportSvg.firstChild);
    }
    Array.from(originalDefs.children).forEach(child => {
      existingDefs.appendChild(child.cloneNode(true));
    });
  }

  // 创建内容组
  const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  contentGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scaleRatio})`);

  Array.from(svgElement.children).forEach(child => {
    if (child.tagName.toLowerCase() !== 'defs') {
      contentGroup.appendChild(child.cloneNode(true));
    }
  });

  mainGroup.appendChild(contentGroup);
  exportSvg.appendChild(mainGroup);

  return exportSvg;
};

/**
 * 将 SVG 转换为指定尺寸的 PNG Blob
 * @param {SVGElement} svgElement - 原始 SVG 元素
 * @param {number} size - 输出 PNG 尺寸
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图标占画布比例
 * @param {number} borderRadius - 圆角半径比例
 */
const svgToPngBlob = (svgElement, size, bgColor = null, iconScale = 0.7, borderRadius = 0) => {
  return new Promise((resolve) => {
    const exportSvg = createExportSvg(svgElement, size, bgColor, iconScale, borderRadius);
    normalizeBlendModes(exportSvg);
    const svgData = new XMLSerializer().serializeToString(exportSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png');
    };

    img.src = url;
  });
};

/**
 * 生成 macOS 风格的 PNG（带透明边距）
 * @param {SVGElement} svgElement - 原始 SVG 元素
 * @param {number} size - 输出 PNG 尺寸
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图案占背景比例
 * @param {number} borderRadius - 圆角半径比例
 * @param {number} contentRatio - 内容占画布比例（推荐 0.8）
 */
const svgToMacOSPngBlob = (svgElement, size, bgColor, iconScale = 0.7, borderRadius = 0.22, contentRatio = 0.8) => {
  return new Promise((resolve) => {
    const exportSvg = createMacOSIconSvg(svgElement, size, bgColor, iconScale, borderRadius, contentRatio);
    normalizeBlendModes(exportSvg);
    const svgData = new XMLSerializer().serializeToString(exportSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      // 保持透明背景
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png');
    };

    img.src = url;
  });
};

/**
 * 生成 ICO 文件 (包含多个尺寸)
 */
const generateICO = async (svgElement, sizes, bgColor, iconScale = 0.7, borderRadius = 0) => {
  const pngBlobs = await Promise.all(
    sizes.map(size => svgToPngBlob(svgElement, size, bgColor, iconScale, borderRadius))
  );

  const pngBuffers = await Promise.all(
    pngBlobs.map(blob => blob.arrayBuffer())
  );

  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = sizes.length;

  let totalSize = headerSize + (dirEntrySize * numImages);
  const imageOffsets = [];
  for (const buffer of pngBuffers) {
    imageOffsets.push(totalSize);
    totalSize += buffer.byteLength;
  }

  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, numImages, true);

  let offset = headerSize;
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i];
    const pngSize = pngBuffers[i].byteLength;

    view.setUint8(offset, size >= 256 ? 0 : size);
    view.setUint8(offset + 1, size >= 256 ? 0 : size);
    view.setUint8(offset + 2, 0);
    view.setUint8(offset + 3, 0);
    view.setUint16(offset + 4, 1, true);
    view.setUint16(offset + 6, 32, true);
    view.setUint32(offset + 8, pngSize, true);
    view.setUint32(offset + 12, imageOffsets[i], true);

    offset += dirEntrySize;
  }

  const uint8View = new Uint8Array(icoBuffer);
  for (let i = 0; i < numImages; i++) {
    uint8View.set(new Uint8Array(pngBuffers[i]), imageOffsets[i]);
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
};

/**
 * 生成 ICNS 文件 (macOS 应用图标)
 * ICNS 格式包含多种尺寸的 PNG 图像
 *
 * 重要：macOS 图标需要透明边距，内容占画布约 80%
 */
const generateICNS = async (svgElement, bgColor, iconScale = 0.7, borderRadius = 0.22, contentRatio = 0.8) => {
  // macOS 图标尺寸和对应的类型码
  const icnsTypes = [
    { type: 'icp4', size: 16 },   // 16x16
    { type: 'icp5', size: 32 },   // 32x32
    { type: 'icp6', size: 64 },   // 64x64
    { type: 'ic07', size: 128 },  // 128x128
    { type: 'ic08', size: 256 },  // 256x256
    { type: 'ic09', size: 512 },  // 512x512
    { type: 'ic10', size: 1024 }, // 1024x1024 (10.7+)
  ];

  // 生成所有尺寸的 PNG（使用 macOS 专用函数，带透明边距）
  const pngBlobs = await Promise.all(
    icnsTypes.map(({ size }) => svgToMacOSPngBlob(svgElement, size, bgColor, iconScale, borderRadius, contentRatio))
  );

  const pngBuffers = await Promise.all(
    pngBlobs.map(blob => blob.arrayBuffer())
  );

  // 计算 ICNS 文件总大小
  // ICNS 头: 4 字节 magic + 4 字节 fileLength
  // 每个图像: 4 字节 type + 4 字节 length + PNG 数据
  let totalSize = 8; // ICNS 文件头
  for (const buffer of pngBuffers) {
    totalSize += 8 + buffer.byteLength; // 每个图像条目
  }

  const icnsBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icnsBuffer);
  const uint8View = new Uint8Array(icnsBuffer);

  // ICNS 文件头
  // Magic number: 'icns'
  uint8View[0] = 0x69; // 'i'
  uint8View[1] = 0x63; // 'c'
  uint8View[2] = 0x6E; // 'n'
  uint8View[3] = 0x73; // 's'
  // 文件总长度 (big-endian)
  view.setUint32(4, totalSize, false);

  // 写入每个图像
  let offset = 8;
  for (let i = 0; i < icnsTypes.length; i++) {
    const { type } = icnsTypes[i];
    const pngData = new Uint8Array(pngBuffers[i]);
    const entrySize = 8 + pngData.byteLength;

    // 类型码 (4 ASCII 字符)
    for (let j = 0; j < 4; j++) {
      uint8View[offset + j] = type.charCodeAt(j);
    }
    // 条目长度 (big-endian，包含 8 字节头)
    view.setUint32(offset + 4, entrySize, false);
    // PNG 数据
    uint8View.set(pngData, offset + 8);

    offset += entrySize;
  }

  return new Blob([icnsBuffer], { type: 'image/x-icns' });
};

/**
 * 导出所有格式到 ZIP
 * @param {SVGElement} svgElement - SVG 元素
 * @param {string} logoName - Logo 名称
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图标占画布比例 (0-1)
 * @param {number} borderRadius - 圆角半径比例 (0-0.5)，macOS 风格约为 0.22
 */
export const exportAllFormats = async (
  svgElement,
  logoName = 'logo',
  bgColor = '#0f172a',
  iconScale = 0.7,
  borderRadius = 0.22,
  readmeMeta = null
) => {
  if (!svgElement) return;

  const zip = new JSZip();

  // ==================== resources/ 目录 ====================
  // 核心资源文件，用于应用开发

  // SVG 矢量图（无圆角，保持原始形状）
  const resourceSvg = createExportSvg(svgElement, 512, bgColor, iconScale, 0);
  const resourceSvgData = new XMLSerializer().serializeToString(resourceSvg);
  zip.file('resources/icon.svg', resourceSvgData);

  // 高清 PNG (1024x1024，macOS 风格带透明边距)
  const iconPng = await svgToMacOSPngBlob(svgElement, 1024, bgColor, iconScale, borderRadius, 0.8);
  zip.file('resources/icon.png', iconPng);

  // macOS ICNS 文件（带透明边距，符合 Apple 规范）
  const icnsBlob = await generateICNS(svgElement, bgColor, iconScale, borderRadius, 0.8);
  zip.file('resources/icon.icns', icnsBlob);

  // Windows ICO 文件
  const icoBlob = await generateICO(svgElement, [16, 32, 48, 256], bgColor, iconScale, borderRadius);
  zip.file('resources/icon.ico', icoBlob);

  // ==================== public/ 目录 ====================
  // 网站公共资源

  // 网站用 SVG
  zip.file('public/icon.svg', resourceSvgData);

  // 品牌 Logo SVG
  zip.file(`public/${logoName}.svg`, resourceSvgData);

  // Favicon PNG (32x32，带轻微圆角)
  const faviconPng = await svgToPngBlob(svgElement, 32, bgColor, iconScale, borderRadius * 0.5);
  zip.file('public/favicon.png', faviconPng);

  // Favicon ICO
  const faviconIco = await generateICO(svgElement, [16, 32, 48], bgColor, iconScale, borderRadius * 0.5);
  zip.file('public/favicon.ico', faviconIco);

  // Apple Touch Icon (180x180，带圆角)
  const appleTouchIcon = await svgToPngBlob(svgElement, 180, bgColor, iconScale, borderRadius);
  zip.file('public/apple-touch-icon.png', appleTouchIcon);

  // ==================== 各平台专用目录 ====================

  // iOS 尺寸
  const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
  for (const size of iosSizes) {
    const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, 0); // iOS 系统会自动加圆角
    zip.file(`ios/icon-${size}x${size}.png`, blob);
  }

  // Android 尺寸
  const androidSizes = [
    { name: 'mdpi', size: 48 },
    { name: 'hdpi', size: 72 },
    { name: 'xhdpi', size: 96 },
    { name: 'xxhdpi', size: 144 },
    { name: 'xxxhdpi', size: 192 },
  ];
  for (const { name, size } of androidSizes) {
    // Android 自适应图标 - 前景层（无背景）
    const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, 0);
    zip.file(`android/mipmap-${name}/ic_launcher.png`, blob);
  }
  // Android 高清图
  const android512 = await svgToPngBlob(svgElement, 512, bgColor, iconScale, 0);
  zip.file('android/playstore-icon.png', android512);

  // macOS 各尺寸（带透明边距，符合 Apple 规范）
  const macosSizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of macosSizes) {
    const blob = await svgToMacOSPngBlob(svgElement, size, bgColor, iconScale, borderRadius, 0.8);
    zip.file(`macos/icon_${size}x${size}.png`, blob);
  }

  // Windows 各尺寸
  const windowsSizes = [16, 24, 32, 48, 64, 128, 256];
  for (const size of windowsSizes) {
    const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, borderRadius);
    zip.file(`windows/icon-${size}.png`, blob);
  }

  // ==================== Web 配置文件 ====================

  // Web Manifest
  const manifest = {
    name: logoName,
    short_name: logoName,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ],
    theme_color: bgColor,
    background_color: bgColor,
    display: 'standalone'
  };
  zip.file('public/manifest.json', JSON.stringify(manifest, null, 2));

  // PWA 图标
  const pwa192 = await svgToPngBlob(svgElement, 192, bgColor, iconScale, borderRadius);
  const pwa512 = await svgToPngBlob(svgElement, 512, bgColor, iconScale, borderRadius);
  zip.file('public/icon-192.png', pwa192);
  zip.file('public/icon-512.png', pwa512);

  // Maskable 图标（更小的 iconScale 确保安全区）
  const maskable192 = await svgToPngBlob(svgElement, 192, bgColor, iconScale * 0.8, 0);
  const maskable512 = await svgToPngBlob(svgElement, 512, bgColor, iconScale * 0.8, 0);
  zip.file('public/icon-maskable-192.png', maskable192);
  zip.file('public/icon-maskable-512.png', maskable512);

  // browserconfig.xml (Windows)
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>${bgColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  zip.file('public/browserconfig.xml', browserconfig);

  // MS Tile
  const mstile = await svgToPngBlob(svgElement, 150, bgColor, iconScale, 0);
  zip.file('public/mstile-150x150.png', mstile);

  // ==================== README ====================
  const readmeMetaBlock = readmeMeta
    ? `
## 生成参数
以下参数可用于复现当前图像效果：

\`\`\`json
${JSON.stringify(readmeMeta, null, 2)}
\`\`\`
`
    : "";

  const readme = `# ${logoName} 图标资源包

## 目录结构

\`\`\`
├── resources/          # 核心资源
│   ├── icon.svg        # 矢量图标
│   ├── icon.png        # 高清 PNG (1024x1024)
│   ├── icon.icns       # macOS 应用图标
│   └── icon.ico        # Windows 应用图标
│
├── public/             # 网站公共资源
│   ├── icon.svg        # 网站图标
│   ├── ${logoName}.svg # 品牌 Logo
│   ├── favicon.png     # Favicon
│   ├── favicon.ico     # Favicon ICO
│   ├── apple-touch-icon.png  # iOS 主屏图标
│   ├── icon-192.png    # PWA 图标
│   ├── icon-512.png    # PWA 图标
│   ├── manifest.json   # Web App Manifest
│   └── browserconfig.xml
│
├── ios/                # iOS App 图标
├── android/            # Android App 图标
├── macos/              # macOS 各尺寸 PNG
└── windows/            # Windows 各尺寸 PNG
\`\`\`

## 快速使用

### HTML 引用
\`\`\`html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${bgColor}">
\`\`\`

### Electron / Tauri
- macOS: 使用 \`resources/icon.icns\`
- Windows: 使用 \`resources/icon.ico\`
- Linux: 使用 \`resources/icon.png\`

### iOS / Android
将对应目录下的图标文件复制到项目中
${readmeMetaBlock}

---
导出时间: ${new Date().toLocaleString('zh-CN')}
`;
  zip.file('README.md', readme);

  // 生成并下载 ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${logoName}-icons.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 生成非正方形 PNG（用于 Windows 宽磁贴等）
 */
const svgToRectPngBlob = (svgElement, width, height, bgColor = null, iconScale = 0.7) => {
  return new Promise((resolve) => {
    const baseSize = Math.min(width, height);
    const exportSvg = createExportSvg(svgElement, baseSize, bgColor, iconScale);
    const svgData = new XMLSerializer().serializeToString(exportSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      const x = (width - baseSize) / 2;
      const y = (height - baseSize) / 2;
      ctx.drawImage(img, x, y, baseSize, baseSize);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png');
    };

    img.src = url;
  });
};

/**
 * 单独导出 SVG
 */
export const exportSvg = (svgElement, logoName = 'logo', bgColor = '#0f172a', iconScale = 0.7) => {
  if (!svgElement) return;

  const exportSvg = createExportSvg(svgElement, 512, bgColor, iconScale, 0);
  const svgData = new XMLSerializer().serializeToString(exportSvg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${logoName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 单独导出 PNG
 */
export const exportPng = async (svgElement, logoName = 'logo', bgColor = '#0f172a', iconScale = 0.7, size = 1024, borderRadius = 0) => {
  if (!svgElement) return;

  const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, borderRadius);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${logoName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Logo 导出工具函数
 *
 * 导出逻辑说明：
 * - 导出与预览缩放(zoom)无关，始终生成标准化的图标
 * - 图案居中并占据画布的合理比例（默认 70%），四周留有安全边距
 * - 符合 Apple、Google 等平台的 App Icon 设计规范
 */
import JSZip from 'jszip';

/**
 * 获取 SVG 中实际图形内容的边界框
 * @param {SVGElement} svgElement - SVG 元素
 * @returns {Object} 边界框 {x, y, width, height}
 */
const getContentBBox = (svgElement) => {
  // 尝试获取实际的图形边界
  try {
    // 获取所有非 defs 的子元素
    const contentElements = Array.from(svgElement.children).filter(
      child => child.tagName.toLowerCase() !== 'defs'
    );

    if (contentElements.length === 0) {
      return { x: 0, y: 0, width: 300, height: 300 };
    }

    // 计算所有内容元素的合并边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    contentElements.forEach(el => {
      if (el.getBBox) {
        try {
          const bbox = el.getBBox();
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        } catch (e) {
          // 某些元素可能无法获取 bbox
        }
      }
    });

    if (minX === Infinity) {
      return { x: 0, y: 0, width: 300, height: 300 };
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  } catch (e) {
    return { x: 0, y: 0, width: 300, height: 300 };
  }
};

/**
 * 创建导出专用的标准化 SVG
 * @param {SVGElement} svgElement - 原始 SVG 元素
 * @param {number} exportSize - 导出画布尺寸
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图标占画布比例 (0-1)，默认 0.7 表示图标占 70%
 */
const createExportSvg = (svgElement, exportSize, bgColor, iconScale = 0.7) => {
  // 获取实际图形内容的边界框
  const contentBBox = getContentBBox(svgElement);

  // 创建新的导出用 SVG
  const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', exportSize);
  exportSvg.setAttribute('height', exportSize);
  exportSvg.setAttribute('viewBox', `0 0 ${exportSize} ${exportSize}`);

  // 添加背景矩形
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', exportSize);
  bgRect.setAttribute('height', exportSize);
  bgRect.setAttribute('fill', bgColor);
  exportSvg.appendChild(bgRect);

  // 计算图标在导出画布中的目标尺寸
  const targetIconSize = exportSize * iconScale;

  // 基于实际内容的尺寸计算缩放比例
  const contentSize = Math.max(contentBBox.width, contentBBox.height);
  const scaleRatio = targetIconSize / contentSize;

  // 计算缩放后的实际尺寸
  const scaledWidth = contentBBox.width * scaleRatio;
  const scaledHeight = contentBBox.height * scaleRatio;

  // 计算居中偏移
  const offsetX = (exportSize - scaledWidth) / 2 - contentBBox.x * scaleRatio;
  const offsetY = (exportSize - scaledHeight) / 2 - contentBBox.y * scaleRatio;

  // 复制 defs（渐变、滤镜等定义）
  const defs = svgElement.querySelector('defs');
  if (defs) {
    exportSvg.appendChild(defs.cloneNode(true));
  }

  // 创建一个组来包含原始 SVG 内容，并进行缩放和平移
  const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  contentGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scaleRatio})`);

  // 复制所有非 defs 的子元素
  Array.from(svgElement.children).forEach(child => {
    if (child.tagName.toLowerCase() !== 'defs') {
      contentGroup.appendChild(child.cloneNode(true));
    }
  });

  exportSvg.appendChild(contentGroup);

  return exportSvg;
};

/**
 * 将 SVG 转换为指定尺寸的 PNG Blob
 * @param {SVGElement} svgElement - 原始 SVG 元素
 * @param {number} size - 输出 PNG 尺寸
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图标占画布比例
 */
const svgToPngBlob = (svgElement, size, bgColor = null, iconScale = 0.7) => {
  return new Promise((resolve) => {
    // 创建标准化的导出 SVG
    const exportSvg = createExportSvg(svgElement, size, bgColor, iconScale);
    const svgData = new XMLSerializer().serializeToString(exportSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');

      // 背景已经在 SVG 中绘制，这里作为备份
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }

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
const generateICO = async (svgElement, sizes, bgColor, iconScale = 0.7) => {
  // ICO 文件格式简化版 - 生成包含多尺寸的 ICO
  const pngBlobs = await Promise.all(
    sizes.map(size => svgToPngBlob(svgElement, size, bgColor, iconScale))
  );

  // 将 PNG 转为 ArrayBuffer
  const pngBuffers = await Promise.all(
    pngBlobs.map(blob => blob.arrayBuffer())
  );

  // ICO 文件头
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = sizes.length;

  // 计算总大小
  let totalSize = headerSize + (dirEntrySize * numImages);
  const imageOffsets = [];
  for (const buffer of pngBuffers) {
    imageOffsets.push(totalSize);
    totalSize += buffer.byteLength;
  }

  // 创建 ICO buffer
  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);

  // ICO 头
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // ICO type
  view.setUint16(4, numImages, true); // Number of images

  // 目录条目
  let offset = headerSize;
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i];
    const pngSize = pngBuffers[i].byteLength;

    view.setUint8(offset, size >= 256 ? 0 : size); // Width
    view.setUint8(offset + 1, size >= 256 ? 0 : size); // Height
    view.setUint8(offset + 2, 0); // Color palette
    view.setUint8(offset + 3, 0); // Reserved
    view.setUint16(offset + 4, 1, true); // Color planes
    view.setUint16(offset + 6, 32, true); // Bits per pixel
    view.setUint32(offset + 8, pngSize, true); // Image size
    view.setUint32(offset + 12, imageOffsets[i], true); // Image offset

    offset += dirEntrySize;
  }

  // 复制 PNG 数据
  const uint8View = new Uint8Array(icoBuffer);
  for (let i = 0; i < numImages; i++) {
    uint8View.set(new Uint8Array(pngBuffers[i]), imageOffsets[i]);
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
};

/**
 * 导出所有格式到 ZIP
 * @param {SVGElement} svgElement - SVG 元素
 * @param {string} logoName - Logo 名称
 * @param {string} bgColor - 背景色
 * @param {number} iconScale - 图标占画布比例 (0-1)，默认 0.7
 */
export const exportAllFormats = async (svgElement, logoName = 'logo', bgColor = '#0f172a', iconScale = 0.7) => {
  if (!svgElement) return;

  const zip = new JSZip();

  // SVG 原始文件 - 也使用标准化版本
  const exportSvg = createExportSvg(svgElement, 512, bgColor, iconScale);
  const svgData = new XMLSerializer().serializeToString(exportSvg);
  zip.file(`${logoName}.svg`, svgData);

  // 定义所有需要的尺寸和用途
  const sizes = {
    // Favicon
    'favicon/favicon-16x16.png': 16,
    'favicon/favicon-32x32.png': 32,
    'favicon/favicon-48x48.png': 48,

    // Apple Touch Icons
    'apple/apple-touch-icon-57x57.png': 57,
    'apple/apple-touch-icon-60x60.png': 60,
    'apple/apple-touch-icon-72x72.png': 72,
    'apple/apple-touch-icon-76x76.png': 76,
    'apple/apple-touch-icon-114x114.png': 114,
    'apple/apple-touch-icon-120x120.png': 120,
    'apple/apple-touch-icon-144x144.png': 144,
    'apple/apple-touch-icon-152x152.png': 152,
    'apple/apple-touch-icon-180x180.png': 180,

    // Android Chrome
    'android/android-chrome-192x192.png': 192,
    'android/android-chrome-512x512.png': 512,

    // MS Tile
    'ms/mstile-70x70.png': 70,
    'ms/mstile-144x144.png': 144,
    'ms/mstile-150x150.png': 150,
    'ms/mstile-310x150.png': { w: 310, h: 150 },
    'ms/mstile-310x310.png': 310,

    // 通用尺寸
    'png/logo-64x64.png': 64,
    'png/logo-128x128.png': 128,
    'png/logo-256x256.png': 256,
    'png/logo-512x512.png': 512,
    'png/logo-1024x1024.png': 1024,
  };

  // 生成所有 PNG
  for (const [path, size] of Object.entries(sizes)) {
    if (typeof size === 'number') {
      const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale);
      zip.file(path, blob);
    } else {
      // 特殊尺寸 (非正方形)
      const blob = await svgToRectPngBlob(svgElement, size.w, size.h, bgColor, iconScale);
      zip.file(path, blob);
    }
  }

  // 生成 ICO 文件 (包含 16, 32, 48 尺寸)
  const icoBlob = await generateICO(svgElement, [16, 32, 48], bgColor, iconScale);
  zip.file('favicon/favicon.ico', icoBlob);

  // 生成 webmanifest 文件
  const manifest = {
    name: logoName,
    short_name: logoName,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: bgColor,
    background_color: bgColor,
    display: 'standalone'
  };
  zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

  // 生成 browserconfig.xml (Windows)
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/mstile-70x70.png"/>
      <square150x150logo src="/mstile-150x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <wide310x150logo src="/mstile-310x150.png"/>
      <TileColor>${bgColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  zip.file('ms/browserconfig.xml', browserconfig);

  // 生成 HTML 使用说明
  const readme = `# Logo 资源使用说明

## 文件结构

- \`${logoName}.svg\` - 原始 SVG 矢量文件
- \`favicon/\` - 网站 favicon 图标
- \`apple/\` - Apple 设备图标
- \`android/\` - Android 设备图标
- \`ms/\` - Windows 磁贴图标
- \`png/\` - 通用 PNG 尺寸

## HTML 引用代码

\`\`\`html
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">

<!-- Android -->
<link rel="manifest" href="/site.webmanifest">

<!-- Windows -->
<meta name="msapplication-TileColor" content="${bgColor}">
<meta name="msapplication-config" content="/browserconfig.xml">

<!-- Theme Color -->
<meta name="theme-color" content="${bgColor}">
\`\`\`

## 各平台推荐尺寸

### Favicon
- 16x16, 32x32, 48x48 (ICO 文件包含全部)

### Apple iOS
- 180x180 (推荐), 152x152, 144x144, 120x120, 114x114, 76x76, 72x72, 60x60, 57x57

### Android
- 192x192, 512x512

### Windows
- 70x70, 144x144, 150x150, 310x150, 310x310
`;
  zip.file('README.md', readme);

  // 生成并下载 ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${logoName}-assets.zip`;
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
    // 先创建一个正方形的标准化 SVG（使用较小边作为基准）
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

      // 填充背景
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      // 居中绘制 (保持宽高比)
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

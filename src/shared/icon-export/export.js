/**
 * 图标导出工具
 *
 * 通用的 SVG → 多格式图标导出管线。
 * 任何生成 SVG 的组件都可以直接使用，无需关心坐标系或 viewBox 差异，
 * 内部统一通过 getContentBBox 计算实际内容边界。
 *
 * 导出目录结构：
 * - resources/  核心资源 (SVG, PNG, ICNS, ICO)
 * - public/     网站资源 (favicon, apple-touch-icon, PWA)
 * - ios/        iOS App 图标
 * - android/    Android App 图标
 * - macos/      macOS 各尺寸 PNG
 * - windows/    Windows 各尺寸 PNG
 */
import JSZip from 'jszip';
import { getContentBBox } from './bbox';

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
 * 创建 macOS 风格的图标 SVG（带透明边距）
 */
const createMacOSIconSvg = (svgElement, exportSize, bgColor, iconScale = 0.7, borderRadius = 0.22, contentRatio = 0.8, ofsX = 0, ofsY = 0) => {
  const contentBBox = getContentBBox(svgElement);

  const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', exportSize);
  exportSvg.setAttribute('height', exportSize);
  exportSvg.setAttribute('viewBox', `0 0 ${exportSize} ${exportSize}`);

  const contentSize = exportSize * contentRatio;
  const contentOffset = (exportSize - contentSize) / 2;

  const originalDefs = svgElement.querySelector('defs');
  if (originalDefs) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    Array.from(originalDefs.children).forEach(child => {
      defs.appendChild(child.cloneNode(true));
    });
    exportSvg.appendChild(defs);
  }

  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

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

  const targetIconSize = contentSize * iconScale;
  const contentMaxSize = Math.max(contentBBox.width, contentBBox.height);
  const scaleRatio = targetIconSize / contentMaxSize;

  const scaledWidth = contentBBox.width * scaleRatio;
  const scaledHeight = contentBBox.height * scaleRatio;
  const iconOffsetX = (contentSize - scaledWidth) / 2 - contentBBox.x * scaleRatio + ofsX * contentSize;
  const iconOffsetY = (contentSize - scaledHeight) / 2 - contentBBox.y * scaleRatio + ofsY * contentSize;

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
 */
const createExportSvg = (svgElement, exportSize, bgColor, iconScale = 0.7, borderRadius = 0, ofsX = 0, ofsY = 0) => {
  const contentBBox = getContentBBox(svgElement);

  const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', exportSize);
  exportSvg.setAttribute('height', exportSize);
  exportSvg.setAttribute('viewBox', `0 0 ${exportSize} ${exportSize}`);

  // 当有圆角或 oversize 时，需要 clipPath 裁切溢出
  const needsClip = borderRadius > 0 || iconScale > 1.0 || ofsX !== 0 || ofsY !== 0;
  if (needsClip) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'rounded-clip');

    const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    clipRect.setAttribute('width', exportSize);
    clipRect.setAttribute('height', exportSize);
    if (borderRadius > 0) {
      const radius = exportSize * borderRadius;
      clipRect.setAttribute('rx', radius);
      clipRect.setAttribute('ry', radius);
    }

    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);
    exportSvg.appendChild(defs);
  }

  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  if (needsClip) {
    mainGroup.setAttribute('clip-path', 'url(#rounded-clip)');
  }

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

  const targetIconSize = exportSize * iconScale;
  const contentSize = Math.max(contentBBox.width, contentBBox.height);
  const scaleRatio = targetIconSize / contentSize;

  const scaledWidth = contentBBox.width * scaleRatio;
  const scaledHeight = contentBBox.height * scaleRatio;
  const offsetX = (exportSize - scaledWidth) / 2 - contentBBox.x * scaleRatio + ofsX * exportSize;
  const offsetY = (exportSize - scaledHeight) / 2 - contentBBox.y * scaleRatio + ofsY * exportSize;

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

const svgToPngBlob = (svgElement, size, bgColor = null, iconScale = 0.7, borderRadius = 0, ofsX = 0, ofsY = 0) => {
  return new Promise((resolve) => {
    const exportSvg = createExportSvg(svgElement, size, bgColor, iconScale, borderRadius, ofsX, ofsY);
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

const svgToMacOSPngBlob = (svgElement, size, bgColor, iconScale = 0.7, borderRadius = 0.22, contentRatio = 0.8, ofsX = 0, ofsY = 0) => {
  return new Promise((resolve) => {
    const exportSvg = createMacOSIconSvg(svgElement, size, bgColor, iconScale, borderRadius, contentRatio, ofsX, ofsY);
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

const generateICO = async (svgElement, sizes, bgColor, iconScale = 0.7, borderRadius = 0, ofsX = 0, ofsY = 0) => {
  const pngBlobs = await Promise.all(
    sizes.map(size => svgToPngBlob(svgElement, size, bgColor, iconScale, borderRadius, ofsX, ofsY))
  );
  const pngBuffers = await Promise.all(pngBlobs.map(blob => blob.arrayBuffer()));

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

const generateICNS = async (svgElement, bgColor, iconScale = 0.7, borderRadius = 0.22, contentRatio = 0.8, ofsX = 0, ofsY = 0) => {
  const icnsTypes = [
    { type: 'icp4', size: 16 },
    { type: 'icp5', size: 32 },
    { type: 'icp6', size: 64 },
    { type: 'ic07', size: 128 },
    { type: 'ic08', size: 256 },
    { type: 'ic09', size: 512 },
    { type: 'ic10', size: 1024 },
  ];

  const pngBlobs = await Promise.all(
    icnsTypes.map(({ size }) => svgToMacOSPngBlob(svgElement, size, bgColor, iconScale, borderRadius, contentRatio, ofsX, ofsY))
  );
  const pngBuffers = await Promise.all(pngBlobs.map(blob => blob.arrayBuffer()));

  let totalSize = 8;
  for (const buffer of pngBuffers) {
    totalSize += 8 + buffer.byteLength;
  }

  const icnsBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icnsBuffer);
  const uint8View = new Uint8Array(icnsBuffer);

  uint8View[0] = 0x69; uint8View[1] = 0x63; uint8View[2] = 0x6E; uint8View[3] = 0x73;
  view.setUint32(4, totalSize, false);

  let offset = 8;
  for (let i = 0; i < icnsTypes.length; i++) {
    const { type } = icnsTypes[i];
    const pngData = new Uint8Array(pngBuffers[i]);
    const entrySize = 8 + pngData.byteLength;

    for (let j = 0; j < 4; j++) {
      uint8View[offset + j] = type.charCodeAt(j);
    }
    view.setUint32(offset + 4, entrySize, false);
    uint8View.set(pngData, offset + 8);
    offset += entrySize;
  }

  return new Blob([icnsBuffer], { type: 'image/x-icns' });
};

/**
 * 导出所有格式到 ZIP
 */
export const exportAllFormats = async (
  svgElement,
  logoName = 'logo',
  bgColor = '#0f172a',
  iconScale = 0.7,
  borderRadius = 0.22,
  readmeMeta = null,
  ofsX = 0,
  ofsY = 0
) => {
  if (!svgElement) return;

  const zip = new JSZip();

  // resources/
  const resourceSvg = createExportSvg(svgElement, 512, bgColor, iconScale, 0, ofsX, ofsY);
  const resourceSvgData = new XMLSerializer().serializeToString(resourceSvg);
  zip.file('resources/icon.svg', resourceSvgData);

  const iconPng = await svgToMacOSPngBlob(svgElement, 1024, bgColor, iconScale, borderRadius, 0.8, ofsX, ofsY);
  zip.file('resources/icon.png', iconPng);

  const icnsBlob = await generateICNS(svgElement, bgColor, iconScale, borderRadius, 0.8, ofsX, ofsY);
  zip.file('resources/icon.icns', icnsBlob);

  const icoBlob = await generateICO(svgElement, [16, 32, 48, 256], bgColor, iconScale, borderRadius, ofsX, ofsY);
  zip.file('resources/icon.ico', icoBlob);

  // public/
  zip.file('public/icon.svg', resourceSvgData);
  zip.file(`public/${logoName}.svg`, resourceSvgData);

  const faviconPng = await svgToPngBlob(svgElement, 32, bgColor, iconScale, borderRadius * 0.5, ofsX, ofsY);
  zip.file('public/favicon.png', faviconPng);

  const faviconIco = await generateICO(svgElement, [16, 32, 48], bgColor, iconScale, borderRadius * 0.5, ofsX, ofsY);
  zip.file('public/favicon.ico', faviconIco);

  const appleTouchIcon = await svgToPngBlob(svgElement, 180, bgColor, iconScale, borderRadius, ofsX, ofsY);
  zip.file('public/apple-touch-icon.png', appleTouchIcon);

  // iOS
  const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
  for (const size of iosSizes) {
    const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, 0, ofsX, ofsY);
    zip.file(`ios/icon-${size}x${size}.png`, blob);
  }

  // Android
  const androidSizes = [
    { name: 'mdpi', size: 48 },
    { name: 'hdpi', size: 72 },
    { name: 'xhdpi', size: 96 },
    { name: 'xxhdpi', size: 144 },
    { name: 'xxxhdpi', size: 192 },
  ];
  for (const { name, size } of androidSizes) {
    const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, 0, ofsX, ofsY);
    zip.file(`android/mipmap-${name}/ic_launcher.png`, blob);
  }
  const android512 = await svgToPngBlob(svgElement, 512, bgColor, iconScale, 0, ofsX, ofsY);
  zip.file('android/playstore-icon.png', android512);

  // macOS
  const macosSizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of macosSizes) {
    const blob = await svgToMacOSPngBlob(svgElement, size, bgColor, iconScale, borderRadius, 0.8, ofsX, ofsY);
    zip.file(`macos/icon_${size}x${size}.png`, blob);
  }

  // Windows
  const windowsSizes = [16, 24, 32, 48, 64, 128, 256];
  for (const size of windowsSizes) {
    const blob = await svgToPngBlob(svgElement, size, bgColor, iconScale, borderRadius, ofsX, ofsY);
    zip.file(`windows/icon-${size}.png`, blob);
  }

  // PWA & Web configs
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

  const pwa192 = await svgToPngBlob(svgElement, 192, bgColor, iconScale, borderRadius, ofsX, ofsY);
  const pwa512 = await svgToPngBlob(svgElement, 512, bgColor, iconScale, borderRadius, ofsX, ofsY);
  zip.file('public/icon-192.png', pwa192);
  zip.file('public/icon-512.png', pwa512);

  const maskable192 = await svgToPngBlob(svgElement, 192, bgColor, iconScale * 0.8, 0, ofsX, ofsY);
  const maskable512 = await svgToPngBlob(svgElement, 512, bgColor, iconScale * 0.8, 0, ofsX, ofsY);
  zip.file('public/icon-maskable-192.png', maskable192);
  zip.file('public/icon-maskable-512.png', maskable512);

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

  const mstile = await svgToPngBlob(svgElement, 150, bgColor, iconScale, 0, ofsX, ofsY);
  zip.file('public/mstile-150x150.png', mstile);

  // README
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

export const exportSvg = (svgElement, logoName = 'logo', bgColor = '#0f172a', iconScale = 0.7) => {
  if (!svgElement) return;
  const exportSvgEl = createExportSvg(svgElement, 512, bgColor, iconScale, 0);
  const svgData = new XMLSerializer().serializeToString(exportSvgEl);
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

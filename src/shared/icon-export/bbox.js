/**
 * SVG 内容边界框计算
 *
 * 统一的 bbox 计算逻辑，供 PreviewToolbar 预览和 export 导出共用。
 * 避免两套实现导致的不一致问题。
 */

/**
 * 获取 SVG 中实际图形内容的边界框（含 stroke 补偿）
 * @param {SVGElement} svgElement - SVG 元素
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export const getContentBBox = (svgElement) => {
  const fallback = () => {
    const viewBox = svgElement?.viewBox?.baseVal;
    if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
      return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
    }
    return { x: 0, y: 0, width: 300, height: 300 };
  };

  try {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const applyBBox = (bbox) => {
      if (!bbox || !Number.isFinite(bbox.width) || bbox.width <= 0) return;
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    };

    // 尝试获取根元素 bbox
    try {
      applyBBox(svgElement.getBBox({ stroke: true }));
    } catch {
      try { applyBBox(svgElement.getBBox()); } catch { /* ignore */ }
    }

    // 遍历非 defs 子元素的 bbox
    const contentElements = Array.from(svgElement.children).filter(
      child => child.tagName.toLowerCase() !== 'defs'
    );
    contentElements.forEach(el => {
      if (!el.getBBox) return;
      try {
        applyBBox(el.getBBox({ stroke: true }));
      } catch {
        try { applyBBox(el.getBBox()); } catch { /* ignore */ }
      }
    });

    if (minX === Infinity) return fallback();

    // stroke 补偿
    let strokePadding = 0;
    try {
      svgElement.querySelectorAll('[stroke-width], [style]').forEach(el => {
        let width = 0;
        const attr = el.getAttribute('stroke-width');
        if (attr) {
          width = parseFloat(attr);
        } else if (el.style?.strokeWidth) {
          width = parseFloat(el.style.strokeWidth);
        } else if (typeof window !== 'undefined' && window.getComputedStyle) {
          const computed = window.getComputedStyle(el);
          if (computed?.strokeWidth) width = parseFloat(computed.strokeWidth);
        }
        if (Number.isFinite(width)) {
          strokePadding = Math.max(strokePadding, width / 2);
        }
      });
    } catch {
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
      return fallback();
    }

    return { x: minX, y: minY, width, height };
  } catch {
    return fallback();
  }
};

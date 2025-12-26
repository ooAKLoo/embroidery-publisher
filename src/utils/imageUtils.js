/**
 * 为图片添加水印
 * @param {string} imageDataUrl - 图片的Data URL
 * @param {string} watermarkText - 水印文字
 * @returns {Promise<string>} - 带水印的图片Data URL
 */
export async function addWatermark(imageDataUrl, watermarkText = 'Handmade in China') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 设置水印样式
      const fontSize = Math.max(img.width * 0.025, 14);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;

      // 计算水印位置（右下角）
      const textMetrics = ctx.measureText(watermarkText);
      const x = canvas.width - textMetrics.width - 20;
      const y = canvas.height - 20;

      // 绘制水印
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

/**
 * 生成细节裁剪图
 * @param {string} imageDataUrl - 图片的Data URL
 * @returns {Promise<string[]>} - 4张细节图的Data URL数组
 */
export async function generateDetailCrops(imageDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const crops = [];
      const cropSize = Math.min(img.width, img.height) * 0.4;

      // 定义4个裁剪区域（左上、右上、左下、右下）
      const regions = [
        { x: img.width * 0.1, y: img.height * 0.1 },
        { x: img.width * 0.5, y: img.height * 0.1 },
        { x: img.width * 0.1, y: img.height * 0.5 },
        { x: img.width * 0.5, y: img.height * 0.5 },
      ];

      regions.forEach(region => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 输出为正方形
        canvas.width = 800;
        canvas.height = 800;

        // 裁剪并绘制
        ctx.drawImage(
          img,
          region.x,
          region.y,
          cropSize,
          cropSize,
          0,
          0,
          800,
          800
        );

        crops.push(canvas.toDataURL('image/jpeg', 0.9));
      });

      resolve(crops);
    };

    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

/**
 * 调整图片尺寸以适应不同平台
 * @param {string} imageDataUrl - 图片的Data URL
 * @param {string} platform - 平台名称
 * @returns {Promise<string>} - 调整后的图片Data URL
 */
export async function resizeForPlatform(imageDataUrl, platform) {
  const dimensions = {
    instagram: { width: 1080, height: 1080 }, // 1:1
    instagram_portrait: { width: 1080, height: 1350 }, // 4:5
    facebook: { width: 1200, height: 630 }, // 1.91:1
    twitter: { width: 1200, height: 675 }, // 16:9
    pinterest: { width: 1000, height: 1500 }, // 2:3
  };

  const target = dimensions[platform] || dimensions.instagram;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = target.width;
      canvas.height = target.height;

      // 计算裁剪区域以保持比例
      const imgRatio = img.width / img.height;
      const targetRatio = target.width / target.height;

      let srcX = 0;
      let srcY = 0;
      let srcWidth = img.width;
      let srcHeight = img.height;

      if (imgRatio > targetRatio) {
        // 图片更宽，裁剪左右
        srcWidth = img.height * targetRatio;
        srcX = (img.width - srcWidth) / 2;
      } else {
        // 图片更高，裁剪上下
        srcHeight = img.width / targetRatio;
        srcY = (img.height - srcHeight) / 2;
      }

      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        0,
        0,
        target.width,
        target.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

import { useRef, useEffect } from 'react';
import { getShapePoints } from './utils/math';

function LogoCanvas({ config }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 分辨率
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.clearRect(0, 0, rect.width, rect.height);

    // 画布中心
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // 生成形状点集
    const baseSize = Math.min(rect.width, rect.height) / 4; 
    const points = getShapePoints(config.shape, 360, baseSize * config.symmetry.scale);

    // 设置混合模式
    ctx.globalCompositeOperation = config.style.blendMode;
    
    const count = config.symmetry.count;
    const stepAngle = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      ctx.save();
      
      // 1. 移动到中心
      ctx.translate(cx, cy);
      
      // 2. 径向对称旋转
      const angle = (i * stepAngle) + (config.symmetry.rotation * Math.PI / 180);
      ctx.rotate(angle);
      
      // 3. 按半径偏移
      ctx.translate(config.symmetry.radius, 0);

      // 4. 绘制形状
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.closePath();
      }

      // 5. 应用样式
      if (config.style.filled) {
        ctx.fillStyle = config.style.fillColor;
        ctx.fill();
      }
      
      ctx.lineWidth = config.style.strokeWidth;
      ctx.strokeStyle = config.style.strokeColor;
      ctx.stroke();

      ctx.restore();
    }

  }, [config]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a] shadow-inner relative group">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      <canvas 
        ref={canvasRef} 
        className="w-full h-full max-w-[800px] max-h-[800px]"
      />
      <div className="absolute bottom-4 right-4 text-xs text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        渲染: Canvas 2D
      </div>
    </div>
  );
}

export default LogoCanvas;

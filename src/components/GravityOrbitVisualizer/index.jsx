import { useEffect, useState } from 'react';
import { Scene } from './Scene';
import { VisualMode } from './types';
import { Layout, Globe, Magnet, Wind, Upload } from 'lucide-react';

export default function GravityOrbitVisualizer() {
  const [mode, setMode] = useState(VisualMode.ORBIT);
  const [cardImages, setCardImages] = useState([]);

  useEffect(() => {
    return () => {
      cardImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [cardImages]);

  const handleUpload = (event) => {
    if (!event.target.files) return;
    const urls = Array.from(event.target.files).map((file) => URL.createObjectURL(file));
    setCardImages(urls);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100">
      <div className="absolute inset-0 z-0">
        <Scene mode={mode} images={cardImages} />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        <header className="flex justify-between items-center pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layout className="w-6 h-6 text-sky-600" />
              Gravity & Orbit
            </h1>
            <p className="text-sm text-slate-500">Interactive 3D Visualizer</p>
          </div>

          <label className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/50 cursor-pointer hover:shadow-xl transition-all">
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <Upload className="w-4 h-4" />
              {cardImages.length ? `已选 ${cardImages.length} 张` : '上传卡片'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </header>

        <div className="flex flex-col items-center gap-3 mb-6 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-white/50 flex gap-2">
            <button
              onClick={() => setMode(VisualMode.ORBIT)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                mode === VisualMode.ORBIT
                  ? 'bg-sky-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">Orbit</span>
            </button>

            <button
              onClick={() => setMode(VisualMode.GRAVITY)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                mode === VisualMode.GRAVITY
                  ? 'bg-sky-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Magnet className="w-5 h-5" />
              <span className="font-medium">Absorb</span>
            </button>

            <button
              onClick={() => setMode(VisualMode.FLOAT)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                mode === VisualMode.FLOAT
                  ? 'bg-sky-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wind className="w-5 h-5" />
              <span className="font-medium">Float</span>
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-white/50 flex gap-2">
            <button
              onClick={() => setMode(VisualMode.ORBIT_TUNNEL)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                mode === VisualMode.ORBIT_TUNNEL
                  ? 'bg-sky-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">Orbit T</span>
            </button>

            <button
              onClick={() => setMode(VisualMode.GRAVITY_TUNNEL)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                mode === VisualMode.GRAVITY_TUNNEL
                  ? 'bg-sky-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Magnet className="w-5 h-5" />
              <span className="font-medium">Absorb T</span>
            </button>

            <button
              onClick={() => setMode(VisualMode.FLOAT_TUNNEL)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                mode === VisualMode.FLOAT_TUNNEL
                  ? 'bg-sky-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wind className="w-5 h-5" />
              <span className="font-medium">Float T</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

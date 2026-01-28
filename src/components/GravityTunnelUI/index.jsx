import { Layout } from 'lucide-react';
import { Scene } from './components/Scene';

export default function GravityTunnelUI() {
  return (
    <div className="relative w-full h-full bg-gray-50 flex flex-col overflow-hidden rounded-2xl">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none">
        <div className="max-w-5xl mx-auto flex justify-between items-start">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/50">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Layout className="w-6 h-6 text-sky-600" />
              Attraction & Radial Tunnel
            </h1>
            <p className="text-gray-500 mt-2 max-w-md text-sm">
              A visual simulation of data aggregation and radial search interfaces.
              Drag to explore the gravitational field.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">React Three Fiber</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">WebGL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/5 backdrop-blur-sm px-4 py-2 rounded-full text-gray-500 text-sm animate-pulse">
          Scroll to zoom • Drag to rotate
        </div>
      </div>
    </div>
  );
}

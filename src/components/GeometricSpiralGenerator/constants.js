export const DEFAULT_CONFIG = {
  segments: 8,
  radius: 60,
  arcRadius: 100,
  arcAngle: 120,
  arcLength: 209.44,
  rotation: 0,
  tilt: -45,
  strokeWidth: 40,
  strokeOpacity: 0.2,
  fillOpacity: 0.9,
  color: "#3B82F6",
  color2: "#1E3A8A",
  fillMode: "linear-gradient",
  blendMode: "normal",
  shapeMode: "ribbon",
  glossy: true,
  lockArcLength: false,
  ribbonCap: "flat"
};

export const PRESETS = {
  "Deep Ocean": {
    config: {
      segments: 8,
      radius: 60,
      arcRadius: 100,
      arcAngle: 110,
      arcLength: 192,
      rotation: 0,
      tilt: -20,
      strokeWidth: 45,
      strokeOpacity: 0.1,
      fillOpacity: 0.95,
      color: "#3B82F6",
      color2: "#172554",
      fillMode: "linear-gradient",
      blendMode: "normal",
      shapeMode: "ribbon",
      glossy: true,
      ribbonCap: "flat"
    },
    export: { bgColor: "#000000", iconScale: 0.7, borderRadius: 0.22 }
  },
  "Glass Petals": {
    config: {
      segments: 4,
      radius: 40,
      arcRadius: 100,
      arcAngle: 160,
      arcLength: 279.25,
      rotation: 0,
      tilt: 45,
      strokeWidth: 80,
      strokeOpacity: 0.5,
      fillOpacity: 0.6,
      color: "#A78BFA",
      color2: "#F472B6",
      fillMode: "radial-gradient",
      blendMode: "screen",
      shapeMode: "ribbon",
      glossy: false,
      ribbonCap: "flat"
    },
    export: { bgColor: "#000000", iconScale: 0.7, borderRadius: 0.22 }
  },
  "Metallic Ring": {
    config: {
      segments: 6,
      radius: 75,
      arcRadius: 90,
      arcAngle: 90,
      arcLength: 141.37,
      rotation: 0,
      tilt: 15,
      strokeWidth: 35,
      strokeOpacity: 0,
      fillOpacity: 1,
      color: "#F8FAFC",
      color2: "#6366F1",
      fillMode: "linear-gradient",
      blendMode: "normal",
      shapeMode: "ribbon",
      glossy: true,
      ribbonCap: "flat"
    },
    export: { bgColor: "#000000", iconScale: 0.7, borderRadius: 0.22 }
  },
  "Indigo Bloom": {
    config: {
      segments: 18,
      radius: 61,
      arcRadius: 39,
      arcAngle: 299,
      arcLength: 203.52284407505874,
      rotation: 104,
      tilt: -139,
      strokeWidth: 14,
      strokeOpacity: 0,
      fillOpacity: 1,
      color: "#F8FAFC",
      color2: "#6366F1",
      fillMode: "linear-gradient",
      blendMode: "multiply",
      shapeMode: "ribbon",
      glossy: true,
      lockArcLength: false,
      ribbonCap: "flat"
    },
    export: { bgColor: "#ffffff", iconScale: 0.9, borderRadius: 0.22 }
  }
};

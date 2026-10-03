export type SampleVariant = "sunset" | "beach" | "forest" | "night";

interface SamplePalette {
  skyFrom: string;
  skyTo: string;
  glow: string;
  layerFront: string;
  layerBack: string;
  ground: string;
}

export const samplePalettes: Record<SampleVariant, SamplePalette> = {
  sunset: {
    skyFrom: "#fb923c",
    skyTo: "#fde68a",
    glow: "#fff7ed",
    layerFront: "#9a3412",
    layerBack: "#c2410c",
    ground: "#7c2d12",
  },
  beach: {
    skyFrom: "#38bdf8",
    skyTo: "#e0f2fe",
    glow: "#fffbeb",
    layerFront: "#0369a1",
    layerBack: "#0ea5e9",
    ground: "#fbbf24",
  },
  forest: {
    skyFrom: "#34d399",
    skyTo: "#ecfdf5",
    glow: "#fefce8",
    layerFront: "#065f46",
    layerBack: "#047857",
    ground: "#064e3b",
  },
  night: {
    skyFrom: "#1e3a8a",
    skyTo: "#60a5fa",
    glow: "#fef9c3",
    layerFront: "#1e293b",
    layerBack: "#334155",
    ground: "#0f172a",
  },
};

export function buildSampleSvg(variant: SampleVariant, uid: string): string {
  const colors = samplePalettes[variant];
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" style="width:100%;height:auto;display:block">`,
    `<defs>`,
    `<linearGradient id="sky-${uid}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${colors.skyFrom}"/>`,
    `<stop offset="100%" stop-color="${colors.skyTo}"/>`,
    `</linearGradient>`,
    `<clipPath id="clip-${uid}"><rect x="0" y="0" width="256" height="256" rx="18"/></clipPath>`,
    `</defs>`,
    `<g clip-path="url(#clip-${uid})">`,
    `<rect width="256" height="256" fill="url(#sky-${uid})"/>`,
    `<circle cx="178" cy="74" r="30" fill="${colors.glow}" opacity="0.9"/>`,
    `<path d="M0 176 L58 112 L104 160 L142 122 L198 176 Z" fill="${colors.layerBack}" opacity="0.85"/>`,
    `<path d="M52 190 L112 130 L156 176 L204 140 L256 190 L256 210 L0 210 Z" fill="${colors.layerFront}"/>`,
    `<rect y="196" width="256" height="60" fill="${colors.ground}"/>`,
    `</g>`,
    `<rect x="1" y="1" width="254" height="254" rx="17" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>`,
    `</svg>`,
  ].join("");
}

export function sampleDataUrl(variant: SampleVariant): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildSampleSvg(variant, variant)
  )}`;
}

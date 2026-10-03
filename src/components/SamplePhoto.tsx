interface SamplePhotoProps {
  uid: string;
  variant?: "sunset" | "beach" | "forest" | "night";
  className?: string;
}

const palettes = {
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

export default function SamplePhoto({
  uid,
  variant = "sunset",
  className,
}: SamplePhotoProps) {
  const colors = palettes[variant];
  const skyId = `sky-${uid}`;
  const clipId = `clip-${uid}`;

  return (
    <svg
      viewBox="0 0 256 256"
      className={className}
      role="img"
      aria-label="Sample photo of a scenic landscape"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.skyFrom} />
          <stop offset="100%" stopColor={colors.skyTo} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="256" height="256" rx="18" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="256" height="256" fill={`url(#${skyId})`} />
        <circle cx="178" cy="74" r="30" fill={colors.glow} opacity="0.9" />
        <path
          d="M0 176 L58 112 L104 160 L142 122 L198 176 Z"
          fill={colors.layerBack}
          opacity="0.85"
        />
        <path
          d="M52 190 L112 130 L156 176 L204 140 L256 190 L256 210 L0 210 Z"
          fill={colors.layerFront}
        />
        <rect y="196" width="256" height="60" fill={colors.ground} />
      </g>
      <rect
        x="1"
        y="1"
        width="254"
        height="254"
        rx="17"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
    </svg>
  );
}

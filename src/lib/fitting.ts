export type BoardColor = "white" | "black";
export type FitMode = "fill" | "fit";

export interface PhotoEdit {
  boardColor: BoardColor;
  fit: FitMode;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export const defaultEdit: PhotoEdit = {
  boardColor: "white",
  fit: "fill",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export interface PhotoTransform {
  drawWidth: number;
  drawHeight: number;
  centerX: number;
  centerY: number;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeTransform(
  aspect: number,
  edit: PhotoEdit
): PhotoTransform {
  const safeAspect = aspect > 0 ? aspect : 1;
  const zoom = clampNumber(edit.zoom, 1, 3);

  let baseWidth: number;
  let baseHeight: number;
  if (edit.fit === "fill") {
    if (safeAspect >= 1) {
      baseHeight = 1;
      baseWidth = safeAspect;
    } else {
      baseWidth = 1;
      baseHeight = 1 / safeAspect;
    }
  } else if (safeAspect >= 1) {
    baseWidth = 1;
    baseHeight = 1 / safeAspect;
  } else {
    baseHeight = 1;
    baseWidth = safeAspect;
  }

  const drawWidth = baseWidth * zoom;
  const drawHeight = baseHeight * zoom;
  const halfWidth = drawWidth / 2;
  const halfHeight = drawHeight / 2;
  const minX = Math.min(halfWidth, 1 - halfWidth);
  const maxX = Math.max(halfWidth, 1 - halfWidth);
  const minY = Math.min(halfHeight, 1 - halfHeight);
  const maxY = Math.max(halfHeight, 1 - halfHeight);

  return {
    drawWidth,
    drawHeight,
    centerX: clampNumber(0.5 + edit.offsetX, minX, maxX),
    centerY: clampNumber(0.5 + edit.offsetY, minY, maxY),
  };
}

export function boardColorHex(boardColor: BoardColor): string {
  return boardColor === "white" ? "#ffffff" : "#111827";
}

export function drawComposite(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  aspect: number,
  edit: PhotoEdit
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = canvas.width;
  context.clearRect(0, 0, size, size);
  context.fillStyle = boardColorHex(edit.boardColor);
  context.fillRect(0, 0, size, size);

  const transform = computeTransform(aspect, edit);
  const width = transform.drawWidth * size;
  const height = transform.drawHeight * size;
  const centerX = transform.centerX * size;
  const centerY = transform.centerY * size;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    centerX - width / 2,
    centerY - height / 2,
    width,
    height
  );
}

export function renderToBlob(
  image: HTMLImageElement,
  aspect: number,
  edit: PhotoEdit,
  size: number,
  type: string,
  quality: number
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  drawComposite(canvas, image, aspect, edit);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

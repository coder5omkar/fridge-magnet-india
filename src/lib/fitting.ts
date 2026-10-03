export type BoardColor = "white" | "black";
export type BoardMode = "full" | "bezel";

export interface PhotoEdit {
  boardColor: BoardColor;
  mode: BoardMode;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export const defaultEdit: PhotoEdit = {
  boardColor: "white",
  mode: "full",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export const FULL_ZOOM_MIN = 1;
export const FULL_ZOOM_MAX = 3;
export const BEZEL_ZOOM_MIN = 0.4;
export const BEZEL_ZOOM_MAX = 2;
export const BEZEL_MARGIN = 0.05;
export const MAX_BOARD_INCHES = 8;
export const MIN_BOARD_INCHES = 3;

export interface BoardDimensions {
  widthIn: number;
  heightIn: number;
  aspect: number;
}

export interface PhotoTransform {
  drawWidth: number;
  drawHeight: number;
  centerX: number;
  centerY: number;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function boardDimensions(photoAspect: number): BoardDimensions {
  const safeAspect = clampNumber(photoAspect, 1 / 3, 3);
  let widthIn: number;
  let heightIn: number;
  if (safeAspect >= 1) {
    widthIn = MAX_BOARD_INCHES;
    heightIn = clampNumber(
      roundToHalf(MAX_BOARD_INCHES / safeAspect),
      MIN_BOARD_INCHES,
      MAX_BOARD_INCHES
    );
  } else {
    heightIn = MAX_BOARD_INCHES;
    widthIn = clampNumber(
      roundToHalf(MAX_BOARD_INCHES * safeAspect),
      MIN_BOARD_INCHES,
      MAX_BOARD_INCHES
    );
  }
  return { widthIn, heightIn, aspect: widthIn / heightIn };
}

export function computeTransform(
  photoAspect: number,
  boardAspect: number,
  edit: PhotoEdit
): PhotoTransform {
  const photo = photoAspect > 0 ? photoAspect : 1;
  const board = boardAspect > 0 ? boardAspect : 1;

  let drawWidth: number;
  let drawHeight: number;

  if (edit.mode === "bezel") {
    const zoom = clampNumber(edit.zoom, BEZEL_ZOOM_MIN, BEZEL_ZOOM_MAX);
    const inner = 1 - BEZEL_MARGIN * 2;
    if (photo >= board) {
      drawWidth = inner;
      drawHeight = (inner * board) / photo;
    } else {
      drawHeight = inner;
      drawWidth = (inner * photo) / board;
    }
    drawWidth *= zoom;
    drawHeight *= zoom;
  } else {
    const zoom = clampNumber(edit.zoom, FULL_ZOOM_MIN, FULL_ZOOM_MAX);
    if (photo >= board) {
      drawHeight = 1;
      drawWidth = photo / board;
    } else {
      drawWidth = 1;
      drawHeight = board / photo;
    }
    drawWidth *= zoom;
    drawHeight *= zoom;
  }

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

export function canvasSizeForBoard(
  boardAspect: number,
  longestSide: number
): { width: number; height: number } {
  const board = boardAspect > 0 ? boardAspect : 1;
  if (board >= 1) {
    return {
      width: longestSide,
      height: Math.max(1, Math.round(longestSide / board)),
    };
  }
  return {
    width: Math.max(1, Math.round(longestSide * board)),
    height: longestSide,
  };
}

export function drawComposite(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  photoAspect: number,
  boardAspect: number,
  edit: PhotoEdit
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const width = canvas.width;
  const height = canvas.height;

  context.clearRect(0, 0, width, height);
  context.fillStyle = boardColorHex(edit.boardColor);
  context.fillRect(0, 0, width, height);

  const transform = computeTransform(photoAspect, boardAspect, edit);
  const drawWidth = transform.drawWidth * width;
  const drawHeight = transform.drawHeight * height;
  const centerX = transform.centerX * width;
  const centerY = transform.centerY * height;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    centerX - drawWidth / 2,
    centerY - drawHeight / 2,
    drawWidth,
    drawHeight
  );
}

export function renderToBlob(
  image: HTMLImageElement,
  photoAspect: number,
  boardAspect: number,
  edit: PhotoEdit,
  longestSide: number,
  type: string,
  quality: number
): Promise<Blob | null> {
  const size = canvasSizeForBoard(boardAspect, longestSide);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  drawComposite(canvas, image, photoAspect, boardAspect, edit);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

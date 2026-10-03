export interface PhotoInfo {
  url: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export class PhotoError extends Error {}

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600;

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new PhotoError("We could not read that file. Please try again."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new PhotoError(
          "We could not open this photo. iPhone HEIC photos sometimes fail; please use a JPG or PNG, or send it to us on WhatsApp."
        )
      );
    image.src = src;
  });
}

export async function preparePhoto(file: File): Promise<PhotoInfo> {
  if (!file.type.startsWith("image/")) {
    throw new PhotoError("Please choose an image file (JPG, PNG or WEBP).");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new PhotoError("That photo is larger than 15 MB. Please choose a smaller file.");
  }

  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  if (scale === 1 && file.size <= 2_000_000) {
    return {
      url: dataUrl,
      name: file.name,
      width: image.width,
      height: image.height,
      sizeBytes: file.size,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    return {
      url: dataUrl,
      name: file.name,
      width: image.width,
      height: image.height,
      sizeBytes: file.size,
    };
  }

  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const compressed = canvas.toDataURL("image/jpeg", 0.9);

  return {
    url: compressed,
    name: file.name,
    width: canvas.width,
    height: canvas.height,
    sizeBytes: Math.round(compressed.length * 0.75),
  };
}

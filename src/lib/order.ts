import { siteConfig, whatsappLink } from "./config";
import { boardDimensions, type BoardColor, type Orientation } from "./fitting";
import { log } from "./logger";
import { PRODUCT, formatINR, type PriceBreakdown } from "./products";

export type OrderMethod = "share" | "whatsapp" | "cancelled";

export interface OrderItem {
  name: string;
  orientation: Orientation;
  boardColor: BoardColor;
}

export function createOrderId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  const stamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `FM-${random}${stamp}`;
}

export function buildOrderMessage(
  orderId: string,
  items: OrderItem[],
  price: PriceBreakdown
): string {
  const lines = [
    `New order ${orderId} from ${siteConfig.name}`,
    "",
    `${PRODUCT.name} x ${items.length}`,
  ];
  if (price.discountAmount > 0) {
    lines.push(
      `Discount ${price.discountPercent}%: -${formatINR(price.discountAmount)}`
    );
  }
  if (price.shipping > 0) {
    lines.push(`Shipping: ${formatINR(price.shipping)}`);
  }
  lines.push(`Total: ${formatINR(price.total)}`, "", "My photos for printing:");
  items.forEach((item, index) => {
    const dimensions = boardDimensions(item.orientation);
    lines.push(
      `${index + 1}. ${item.name} (${dimensions.widthIn} x ${dimensions.heightIn} inch, ${item.orientation}, ${item.boardColor} board)`
    );
  });
  lines.push(
    "",
    "Please fine-tune the crop for printing if needed.",
    "I will share my delivery address here as well."
  );
  return lines.join("\n");
}

function canShareFiles(files: File[]): boolean {
  if (files.length === 0) return false;
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

export async function shareOrderFiles(
  files: File[],
  message: string,
  orderId: string
): Promise<OrderMethod> {
  let method: OrderMethod = "whatsapp";
  if (canShareFiles(files)) {
    try {
      await navigator.share({
        files,
        text: message,
        title: `${siteConfig.name} order ${orderId}`,
      });
      method = "share";
      log("order_shared", { orderId, photos: files.length }, "success");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        method = "cancelled";
        log("order_share_cancelled", { orderId }, "warn");
      } else {
        log("order_share_failed", { orderId, message: String(caught) }, "warn");
      }
    }
  }
  if (method === "whatsapp") {
    const opened = window.open(
      whatsappLink(message),
      "_blank",
      "noopener,noreferrer"
    );
    log(
      "order_submitted",
      { orderId, whatsappOpened: opened !== null },
      opened ? "success" : "warn"
    );
  }
  return method;
}

export function downloadFiles(files: File[], orderId: string) {
  files.forEach((file, index) => {
    window.setTimeout(() => {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, index * 350);
  });
  log("photos_downloaded", { orderId, count: files.length }, "success");
}

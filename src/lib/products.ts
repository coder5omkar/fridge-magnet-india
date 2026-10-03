export const SIZE_LABEL = "8 x 8 inch";

export const PRODUCT = {
  name: "Photo Magnet",
  price: 249,
  mrp: 399,
};

export const MAX_QUANTITY = 20;
export const SHIPPING_FEE = 49;

export interface PriceBreakdown {
  unitPrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shipping: number;
  total: number;
}

export function discountPercent(quantity: number): number {
  if (quantity >= 5) return 15;
  if (quantity >= 2) return 10;
  return 0;
}

export function computePrice(quantity: number): PriceBreakdown {
  const safeQuantity = Math.max(1, Math.min(MAX_QUANTITY, quantity));
  const subtotal = PRODUCT.price * safeQuantity;
  const percent = discountPercent(safeQuantity);
  const discountAmount = Math.round((subtotal * percent) / 100);
  const afterDiscount = subtotal - discountAmount;
  const shipping = safeQuantity >= 2 ? 0 : SHIPPING_FEE;
  return {
    unitPrice: PRODUCT.price,
    subtotal,
    discountPercent: percent,
    discountAmount,
    shipping,
    total: afterDiscount + shipping,
  };
}

export function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

export const PRODUCT = {
  name: "Photo Magnet",
  price: 249,
  mrp: 399,
};

export const MAX_MAGNETS = 10;
export const SHIPPING_FEE = 49;

export interface PriceBreakdown {
  unitPrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shipping: number;
  total: number;
}

export function discountPercent(magnetCount: number): number {
  if (magnetCount >= 5) return 15;
  if (magnetCount >= 2) return 10;
  return 0;
}

export function computePrice(magnetCount: number): PriceBreakdown {
  const count = Math.max(1, Math.min(MAX_MAGNETS, magnetCount));
  const subtotal = PRODUCT.price * count;
  const percent = discountPercent(count);
  const discountAmount = Math.round((subtotal * percent) / 100);
  const afterDiscount = subtotal - discountAmount;
  const shipping = count >= 2 ? 0 : SHIPPING_FEE;
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

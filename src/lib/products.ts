export type ProductId = "acrylic" | "board";

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  price: number;
  mrp: number;
  badge: string;
  blurb: string;
  features: string[];
}

export const SIZE_LABEL = "8 x 8 inch";
export const FREE_SHIPPING_THRESHOLD = 499;
export const SHIPPING_FEE = 49;
export const MAX_QUANTITY = 50;

export const products: Product[] = [
  {
    id: "acrylic",
    name: "Premium Acrylic Magnet",
    shortName: "Acrylic",
    price: 399,
    mrp: 599,
    badge: "Most popular",
    blurb: "Crystal-clear 3mm acrylic with a glossy, glass-like finish.",
    features: [
      "Vivid, fade-proof UV printing",
      "Waterproof and scratch resistant",
      "Premium glass-like depth",
    ],
  },
  {
    id: "board",
    name: "Simple Board Magnet",
    shortName: "Simple Board",
    price: 249,
    mrp: 399,
    badge: "Best value",
    blurb: "Lightweight 3mm board with a smooth matte finish.",
    features: [
      "Sharp colours, elegant matte look",
      "Light and fridge friendly",
      "Easy on the pocket",
    ],
  },
];

export function getProduct(id: ProductId): Product {
  return products.find((product) => product.id === id) ?? products[0];
}

export function discountPercent(quantity: number): number {
  if (quantity >= 5) return 15;
  if (quantity >= 2) return 10;
  return 0;
}

export interface PriceBreakdown {
  unitPrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shipping: number;
  total: number;
  freeShippingShortfall: number;
}

export function computePrice(
  productId: ProductId,
  quantity: number
): PriceBreakdown {
  const product = getProduct(productId);
  const safeQuantity = Math.max(1, Math.min(MAX_QUANTITY, quantity));
  const subtotal = product.price * safeQuantity;
  const percent = discountPercent(safeQuantity);
  const discountAmount = Math.round((subtotal * percent) / 100);
  const afterDiscount = subtotal - discountAmount;
  const shipping =
    afterDiscount >= FREE_SHIPPING_THRESHOLD || safeQuantity >= 2
      ? 0
      : SHIPPING_FEE;
  return {
    unitPrice: product.price,
    subtotal,
    discountPercent: percent,
    discountAmount,
    shipping,
    total: afterDiscount + shipping,
    freeShippingShortfall: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
  };
}

export function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

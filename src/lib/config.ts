export const siteConfig = {
  name: "MemoryMagnet",
  tagline: "Stories that stay forever",
  description:
    "MemoryMagnet turns your photos into 8x8 inch fridge magnets with a matte finish. Upload, preview in 3D, and order on WhatsApp. Delivered across India in 2-5 working days.",
  whatsappNumber: "917083733044",
  whatsappDisplay: "+91 70837 33044",
  callNumber: "919082782267",
  callDisplay: "+91 90827 82267",
  deliveryNote: "Delivered across India in 2-5 working days",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}

export function telLink(): string {
  return `tel:+${siteConfig.callNumber}`;
}

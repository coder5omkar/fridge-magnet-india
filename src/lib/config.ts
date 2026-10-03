export const siteConfig = {
  name: "Fish Magnets India",
  tagline: "Custom 8 x 8 inch fridge photo magnet",
  description:
    "Turn any photo into an 8x8 inch fridge magnet. Upload, preview, and order on WhatsApp. Delivered across India in 2-5 working days.",
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

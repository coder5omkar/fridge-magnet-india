export const siteConfig = {
  name: "Fish Magnets India",
  tagline: "Turn your favourite photo into a premium fish magnet",
  description:
    "Custom 8x8 inch photo magnets printed on premium acrylic or lightweight board. Upload your photo, preview it in 3D, and get it delivered anywhere in India.",
  whatsappNumber: "919876543210",
  whatsappDisplay: "+91 98765 43210",
  email: "orders@fishmagnets.in",
  instagramHandle: "@fishmagnetsindia",
  instagramUrl: "https://instagram.com/fishmagnetsindia",
  deliveryNote: "Delivered across India in 2-5 working days",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function telLink(): string {
  return `tel:+${siteConfig.whatsappNumber}`;
}

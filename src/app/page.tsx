import Link from "next/link";
import SamplePhoto from "@/components/SamplePhoto";
import {
  ArrowRightIcon,
  CheckIcon,
  MessageIcon,
  ShieldIcon,
  SparklesIcon,
  TruckIcon,
} from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { PRODUCT, SIZE_LABEL, formatINR } from "@/lib/products";

const trustItems = [
  { icon: TruckIcon, label: "Free shipping on 2+ magnets" },
  { icon: CheckIcon, label: "10% off on 2 or more" },
  { icon: ShieldIcon, label: "Damage-safe packing" },
  { icon: MessageIcon, label: "Support on WhatsApp" },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SIZE_LABEL} ${PRODUCT.name}`,
    description:
      "Custom 8 x 8 inch photo magnet printed on lightweight matte board, delivered across India.",
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      price: PRODUCT.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative bg-gradient-to-b from-ocean-50 via-white to-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cyan-100/60 to-transparent" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-white px-4 py-1.5 text-xs font-semibold text-ocean-700 shadow-sm">
              <SparklesIcon className="h-4 w-4" />
              {formatINR(PRODUCT.price)} per magnet, buy 2+ and save 10%
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Your favourite photos, now on your{" "}
              <span className="bg-gradient-to-r from-ocean-600 to-cyan-500 bg-clip-text text-transparent">
                fridge
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {SIZE_LABEL} photo magnets with a smooth matte finish. Upload your
              photos, preview every magnet in 3D, and order on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/customize"
                className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ocean-700"
              >
                Start designing - it is free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              {["Free 3D preview", "Free shipping on 2+", "Delivered in 2-5 days"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="relative mx-auto h-[380px] w-full max-w-md">
            <div className="absolute -left-4 top-6 h-40 w-40 rounded-full bg-cyan-200/50 blur-2xl" />
            <div className="absolute -right-2 bottom-4 h-44 w-44 rounded-full bg-ocean-200/60 blur-2xl" />

            <div className="absolute left-0 top-10 w-36 -rotate-6 rounded-2xl border border-white/70 bg-white p-2 shadow-card sm:w-40">
              <SamplePhoto uid="hero-sunset" variant="sunset" className="w-full" />
              <span className="absolute -top-2.5 left-3 rounded-full bg-coral-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow">
                Family
              </span>
            </div>
            <div className="absolute right-0 top-4 w-36 rotate-6 rounded-2xl border border-white/70 bg-white p-2 shadow-card sm:w-40">
              <SamplePhoto uid="hero-forest" variant="forest" className="w-full" />
              <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow">
                Pets
              </span>
            </div>
            <div className="absolute left-1/2 top-24 w-52 -translate-x-1/2 rotate-2 rounded-3xl border border-white/70 bg-white p-2.5 shadow-soft sm:w-56">
              <SamplePhoto uid="hero-beach" variant="beach" className="w-full" />
              <span className="absolute -top-3 left-4 rounded-full bg-ocean-600 px-3 py-1 text-xs font-semibold text-white shadow">
                {formatINR(PRODUCT.price)} each
              </span>
              <span className="absolute -bottom-3 right-4 rounded-full border border-slate-100 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow">
                Matte finish / 8 x 8 inch
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium leading-snug text-slate-700">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

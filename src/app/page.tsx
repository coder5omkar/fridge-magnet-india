import Link from "next/link";
import SamplePhoto from "@/components/SamplePhoto";
import {
  ArrowRightIcon,
  CheckIcon,
  HeartIcon,
  MessageIcon,
  ShieldIcon,
  SparklesIcon,
  TruckIcon,
} from "@/components/icons";
import { siteConfig, whatsappLink } from "@/lib/config";
import { PRODUCT, SIZE_LABEL, formatINR } from "@/lib/products";

const trustItems = [
  { icon: TruckIcon, label: "Free shipping on 2+ magnets" },
  { icon: CheckIcon, label: "10% off on 2 or more" },
  { icon: ShieldIcon, label: "Damage-safe packing" },
  { icon: MessageIcon, label: "Support on WhatsApp" },
];

const steps = [
  {
    icon: SparklesIcon,
    title: "Add your photos",
    text: "Pick one or up to ten photos. Each photo becomes one 8 x 8 inch magnet.",
  },
  {
    icon: HeartIcon,
    title: "Preview in 3D",
    text: "See every magnet before ordering. Rotate it, check the crop, change photos anytime.",
  },
  {
    icon: MessageIcon,
    title: "Send on WhatsApp",
    text: "One tap opens WhatsApp with your order. Attach the photos and share your address in the chat.",
  },
];

const gallery = [
  { uid: "g1", variant: "sunset" as const, caption: "Family & friends" },
  { uid: "g2", variant: "beach" as const, caption: "Your little one" },
  { uid: "g3", variant: "night" as const, caption: "Travel diaries" },
  { uid: "g4", variant: "forest" as const, caption: "Furry friends" },
];

const faqs = [
  {
    q: "How do I send my photos?",
    a: "Add them on the design page to preview every magnet in 3D. When you tap order, WhatsApp opens with your order summary - simply attach the same photos in the chat.",
  },
  {
    q: "Do I need to enter my address on the site?",
    a: "No forms at all. We collect your name, full address and pincode on WhatsApp and confirm everything before printing.",
  },
  {
    q: "Which photos look best?",
    a: "Clear, well-lit photos work best - family, pets, travel, weddings. Square photos fill the magnet edge to edge. 800 x 800 pixels or more keeps prints sharp.",
  },
  {
    q: "When will it arrive?",
    a: "We dispatch within 48 hours and deliver in 2-5 working days anywhere in India, with tracking updates on WhatsApp.",
  },
  {
    q: "How do I pay?",
    a: "After we confirm your order on WhatsApp, we share a secure UPI or bank transfer link. Cash on delivery is available on selected pin codes.",
  },
  {
    q: "What if it arrives damaged?",
    a: "Every order ships in damage-safe packing. In the rare case of transit damage, share an unboxing video within 48 hours and we replace it free.",
  },
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
              photos, preview every magnet in 3D, and order on WhatsApp. No
              signup, no forms.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/customize"
                className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ocean-700"
              >
                Start designing - it is free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/#how"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
              >
                See how it works
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

      <section id="how" className="scroll-mt-20 py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three steps. One happy fridge.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              No accounts, no address forms, no confusing options. Just your
              photos and a WhatsApp chat.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-card"
              >
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white shadow-soft">
                  {index + 1}
                </span>
                <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-600">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/customize"
              className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ocean-700"
            >
              Start designing now
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-20 border-y border-slate-100 bg-white py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              Made for real moments
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every magnet tells your story
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {gallery.map((item, index) => (
              <figure
                key={item.uid}
                className={`rounded-3xl border border-slate-100 bg-slate-50/60 p-3 shadow-card transition hover:-translate-y-1 ${
                  index % 2 === 0 ? "rotate-1" : "-rotate-1"
                }`}
              >
                <SamplePhoto uid={item.uid} variant={item.variant} className="w-full" />
                <figcaption className="pt-3 pb-1 text-center text-sm font-semibold text-slate-700">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-8 rounded-3xl border border-ocean-100 bg-gradient-to-br from-white to-ocean-50 p-8 shadow-card sm:p-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
                Simple pricing
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {formatINR(PRODUCT.price)} per magnet - that is it
              </h2>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                {[
                  "8 x 8 inch magnet with strong magnetic back",
                  "Buy 2 or more and save 10% + free shipping",
                  "Buy 5 or more and save 15%",
                  "Delivered anywhere in India in 2-5 working days",
                  "Damage-safe, gift-ready packing",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {formatINR(PRODUCT.price)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatINR(PRODUCT.mrp)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                per magnet, {SIZE_LABEL}
              </p>
              <Link
                href="/customize"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-ocean-700"
              >
                Upload your photos
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-xs text-slate-500">
                Free 3D preview / order in 1 minute
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-slate-100 bg-white py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Questions, answered
            </h2>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group h-fit rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition open:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 sm:text-base">
                  {faq.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-ocean-600 transition group-open:rotate-45">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-700 via-ocean-600 to-cyan-500 px-6 py-14 text-center shadow-soft sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready in 1 minute
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ocean-50">
                Upload your photos, check the 3D preview and send your order on
                WhatsApp. {siteConfig.deliveryNote}.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/customize"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-ocean-700 shadow transition hover:-translate-y-0.5"
                >
                  Start designing
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <a
                  href={whatsappLink("Hi! I have a question about the photo magnets.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  <MessageIcon className="h-5 w-5" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

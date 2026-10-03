import Link from "next/link";
import SamplePhoto from "@/components/SamplePhoto";
import {
  ArrowRightIcon,
  BoxIcon,
  CameraIcon,
  CheckIcon,
  FishIcon,
  HeartIcon,
  ImageIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  MessageIcon,
  PhoneIcon,
  RotateIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  UploadIcon,
} from "@/components/icons";
import {
  mailtoLink,
  siteConfig,
  telLink,
  whatsappLink,
} from "@/lib/config";
import { formatINR, products } from "@/lib/products";

const trustItems = [
  { icon: TruckIcon, label: "Free shipping over Rs 499" },
  { icon: BoxIcon, label: "Dispatched in 48 hours" },
  { icon: RotateIcon, label: "Free 3D preview before ordering" },
  { icon: ShieldIcon, label: "Damage-safe packaging" },
];

const steps = [
  {
    icon: UploadIcon,
    title: "Upload your photo",
    text: "Pick any photo from your phone or laptop. No editing needed, we handle the rest.",
  },
  {
    icon: RotateIcon,
    title: "Preview it in 3D",
    text: "See exactly how your magnet will look on both acrylic and simple board finishes.",
  },
  {
    icon: SparklesIcon,
    title: "Choose finish & quantity",
    text: "Select the premium acrylic or value board, set your quantity and see the price live.",
  },
  {
    icon: MessageIcon,
    title: "Order on WhatsApp",
    text: "Send your details in one tap. We confirm, print and deliver to your doorstep.",
  },
];

const whyUs = [
  {
    icon: SparklesIcon,
    title: "Premium print quality",
    text: "Sharp, vivid colours printed with fade-proof inks that stay bright for years.",
  },
  {
    icon: ShieldIcon,
    title: "Built to last",
    text: "3mm acrylic is waterproof and scratch resistant. Board has a smooth matte finish.",
  },
  {
    icon: RotateIcon,
    title: "Preview before you pay",
    text: "Our 3D preview shows the real finish, crop and depth before you place the order.",
  },
  {
    icon: FishIcon,
    title: "Made in India",
    text: "Printed and packed locally, delivered anywhere in India in 2-5 working days.",
  },
  {
    icon: BoxIcon,
    title: "Gift-ready packaging",
    text: "Every magnet ships in protective, gift-ready packing so it arrives perfect.",
  },
  {
    icon: HeartIcon,
    title: "Personal support",
    text: "Have a question or special request? Message us on WhatsApp any day.",
  },
];

const testimonials = [
  {
    name: "Priya",
    city: "Pune",
    text: "Ordered an acrylic magnet of our wedding photo. The colours are stunning and it looks so premium on our fridge.",
    variant: "sunset" as const,
  },
  {
    name: "Arjun",
    city: "Bengaluru",
    text: "The 3D preview made it so easy to decide between acrylic and board. Fast delivery and great packing.",
    variant: "beach" as const,
  },
  {
    name: "Meera",
    city: "Delhi",
    text: "Gifted simple board magnets to my parents with their grandkids photos. They loved them. Super value.",
    variant: "forest" as const,
  },
];

const faqs = [
  {
    q: "What size are the photo magnets?",
    a: "Every magnet is 8 x 8 inch (20 x 20 cm), about the size of a large square photo. Acrylic magnets are 3mm thick and simple board magnets are 3mm thick.",
  },
  {
    q: "Which photo should I upload?",
    a: "Any clear, well-lit photo works best. Portraits, family photos, pet photos, wedding pictures and travel shots all look great. For sharpest results use a photo that is at least 800 x 800 pixels.",
  },
  {
    q: "How do I send my photo?",
    a: "Upload it on the design page to see your free 3D preview. When you place the order, WhatsApp opens with your order details; simply attach the same photo in the chat and send. You can also email it to us.",
  },
  {
    q: "How long will delivery take?",
    a: "We dispatch within 48 hours and delivery usually takes 2-5 working days depending on your pin code. You get tracking updates on WhatsApp.",
  },
  {
    q: "Are the magnets waterproof?",
    a: "Yes. Acrylic magnets are waterproof and can be wiped with a damp cloth. Simple board magnets are water resistant; wipe them with a dry or slightly damp cloth and avoid soaking.",
  },
  {
    q: "What if my magnet arrives damaged?",
    a: "We pack every order in damage-safe packaging. In the rare case of transit damage, share an unboxing video within 48 hours and we will replace it free of cost.",
  },
  {
    q: "How do I pay?",
    a: "After you place the order on WhatsApp, we confirm the details and share a secure UPI or bank transfer link. Cash on delivery is available on selected pin codes.",
  },
];

const productVariants = {
  acrylic: "beach" as const,
  board: "forest" as const,
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: `+${siteConfig.whatsappNumber}`,
    areaServed: "IN",
    makesOffer: products.map((product) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: product.name,
        description: product.blurb,
      },
      price: product.price,
      priceCurrency: "INR",
    })),
  };

  return (
    <div className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative bg-gradient-to-b from-ocean-50 via-white to-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cyan-100/60 to-transparent" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-white px-4 py-1.5 text-xs font-semibold text-ocean-700 shadow-sm">
              <SparklesIcon className="h-4 w-4" />
              Now shipping across India
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Turn your favourite photo into a{" "}
              <span className="bg-gradient-to-r from-ocean-600 to-cyan-500 bg-clip-text text-transparent">
                premium fish magnet
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              8 x 8 inch personalised photo magnets on crystal-clear acrylic or
              lightweight board. Upload your photo, preview it in 3D, and order
              in under two minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/customize"
                className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ocean-700"
              >
                Create yours from {formatINR(249)}
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
              {["Free 3D preview", "Ships in 2-5 days", "Gift-ready packing"].map(
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

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-6 top-10 hidden h-40 w-40 rounded-full bg-cyan-200/50 blur-2xl sm:block" />
            <div className="absolute -right-4 bottom-0 hidden h-44 w-44 rounded-full bg-ocean-200/60 blur-2xl sm:block" />

            <div className="relative rotate-2 rounded-3xl border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur">
              <SamplePhoto uid="hero-acrylic" variant="beach" className="w-full" />
              <span className="absolute -top-3 left-6 rounded-full bg-ocean-600 px-3 py-1 text-xs font-semibold text-white shadow">
                Acrylic 3mm
              </span>
            </div>
            <div className="relative -mt-16 ml-auto w-44 -rotate-6 rounded-3xl border border-white/70 bg-white/90 p-2 shadow-card backdrop-blur sm:w-52">
              <SamplePhoto uid="hero-board" variant="sunset" className="w-full" />
              <span className="absolute -top-3 right-4 rounded-full bg-coral-500 px-3 py-1 text-xs font-semibold text-white shadow">
                Board 3mm
              </span>
            </div>
            <div className="absolute -left-3 bottom-8 flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 shadow-card sm:-left-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-ocean-600">
                <RotateIcon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold leading-tight text-slate-700">
                Live 3D preview
                <span className="block font-normal text-slate-500">
                  before you order
                </span>
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

      <section id="pricing" className="scroll-mt-20 py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              Products & Pricing
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Two finishes. One beautiful magnet.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Every magnet is 8 x 8 inch and comes with a strong magnetic back.
              Buy 2 or more and save 10%, buy 5 or more and save 15%.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-card transition hover:-translate-y-1 sm:p-8 ${
                  product.id === "acrylic"
                    ? "border-ocean-200 ring-1 ring-ocean-100"
                    : "border-slate-200"
                }`}
              >
                <span className="absolute -top-3.5 left-8 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {product.badge}
                </span>
                <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
                  <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 to-ocean-50 p-3">
                    <SamplePhoto
                      uid={`product-${product.id}`}
                      variant={productVariants[product.id]}
                      className="w-full"
                    />
                    {product.id === "acrylic" ? (
                      <span className="pointer-events-none absolute inset-3 rounded-[20px] bg-gradient-to-tr from-transparent via-white/25 to-white/40" />
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {product.blurb}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {formatINR(product.price)}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        {formatINR(product.mrp)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      per magnet, 8 x 8 inch
                    </span>
                  </div>
                  <Link
                    href={`/customize?finish=${product.id}`}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                      product.id === "acrylic"
                        ? "bg-ocean-600 text-white shadow-soft hover:bg-ocean-700"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-ocean-200 hover:text-ocean-700"
                    }`}
                  >
                    Design this
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-y border-slate-100 bg-white py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From photo to fridge in 4 easy steps
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-3xl border border-slate-100 bg-slate-50/60 p-6"
              >
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white shadow-soft">
                  {index + 1}
                </span>
                <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ocean-600 shadow-sm">
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

      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              Why Fish Magnets India
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built for photos you love
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-600">
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              Happy Customers
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Loved in homes across India
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex flex-col rounded-3xl border border-slate-100 bg-slate-50/60 p-6"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon key={index} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-6 text-slate-700">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-ocean-100 text-sm font-bold text-ocean-700">
                    {testimonial.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {testimonial.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {testimonial.city}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 py-20">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Questions, answered
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition open:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
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

      <section id="contact" className="scroll-mt-20 pb-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-700 via-ocean-600 to-cyan-500 px-6 py-14 text-center shadow-soft sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white">
                <CameraIcon className="h-4 w-4" />
                Ready when you are
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your favourite photo deserves a spot on the fridge
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ocean-50">
                Upload a photo, see the free 3D preview and order on WhatsApp.
                {" "}{siteConfig.deliveryNote}.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/customize"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-ocean-700 shadow transition hover:-translate-y-0.5"
                >
                  <ImageIcon className="h-5 w-5" />
                  Upload your photo
                </Link>
                <a
                  href={whatsappLink(
                    "Hi! I want to order a custom photo magnet."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  <MessageIcon className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ocean-50">
                <a
                  className="flex items-center gap-2 transition hover:text-white"
                  href={telLink()}
                >
                  <PhoneIcon className="h-4 w-4" />
                  {siteConfig.whatsappDisplay}
                </a>
                <a
                  className="flex items-center gap-2 transition hover:text-white"
                  href={mailtoLink(
                    "Photo magnet enquiry",
                    "Hi Fish Magnets India,"
                  )}
                >
                  <MailIcon className="h-4 w-4" />
                  {siteConfig.email}
                </a>
                <span className="flex items-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  Your photos stay private and are never shared
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

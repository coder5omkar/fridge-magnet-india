import Link from "next/link";
import { FishIcon, MessageIcon, PhoneIcon } from "@/components/icons";
import { siteConfig, telLink, whatsappLink } from "@/lib/config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-cyan-400 text-white">
              <FishIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-slate-900">
              {siteConfig.name}
            </span>
          </div>
          <p className="mt-1 max-w-xs text-xs font-medium text-ocean-700">
            {siteConfig.tagline}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            Custom photo magnets, sized to match your photos, printed and
            delivered anywhere in India.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
            Explore
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link className="transition hover:text-ocean-700" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-ocean-700" href="/customize">
                Design your magnets
              </Link>
            </li>

          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900">
            Contact
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
            <li>
              <a
                href={whatsappLink("Hi! I want to order a photo magnet.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-emerald-600"
              >
                <MessageIcon className="h-4 w-4 text-emerald-500" />
                WhatsApp {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={telLink()}
                className="inline-flex items-center gap-2 transition hover:text-ocean-700"
              >
                <PhoneIcon className="h-4 w-4 text-ocean-600" />
                Call {siteConfig.callDisplay}
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            {siteConfig.deliveryNote}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4">
        <p className="text-center text-xs text-slate-400">
          {year} {siteConfig.name}. Made in India.
        </p>
      </div>
    </footer>
  );
}

import {
  PhoneIcon,
  MessageIcon,
} from "@/components/icons";
import { siteConfig, telLink, whatsappLink } from "@/lib/config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-8 text-center sm:px-6">
        <p className="text-sm font-bold text-slate-800">{siteConfig.name}</p>
        <p className="text-sm text-slate-500">
          8 x 8 inch photo magnets / {siteConfig.deliveryNote}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href={whatsappLink("Hi! I want to order a photo magnet.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            <MessageIcon className="h-4 w-4" />
            {siteConfig.whatsappDisplay}
          </a>
          <a
            href={telLink()}
            className="inline-flex items-center gap-1.5 font-semibold text-ocean-700 transition hover:text-ocean-800"
          >
            <PhoneIcon className="h-4 w-4" />
            {siteConfig.callDisplay}
          </a>
        </div>
        <p className="text-xs text-slate-400">
          {year} {siteConfig.name}. Made in India.
        </p>
      </div>
    </footer>
  );
}

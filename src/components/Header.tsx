import Link from "next/link";
import { FishIcon, MessageIcon } from "@/components/icons";
import { siteConfig, whatsappLink } from "@/lib/config";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-cyan-400 text-white shadow-soft">
            <FishIcon className="h-6 w-6" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">
            {siteConfig.name}
          </span>
        </Link>
        <a
          href={whatsappLink("Hi! I want to order a photo magnet.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          <MessageIcon className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}

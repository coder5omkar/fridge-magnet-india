import Link from "next/link";
import {
  FishIcon,
  InstagramIcon,
  MailIcon,
  MessageIcon,
  PhoneIcon,
} from "@/components/icons";
import {
  mailtoLink,
  siteConfig,
  telLink,
  whatsappLink,
} from "@/lib/config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-cyan-400 text-white">
              <FishIcon className="h-6 w-6" />
            </span>
            <span className="text-base font-bold text-slate-900">
              {siteConfig.name}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Personalised 8 x 8 inch photo magnets printed on premium acrylic or
            lightweight board. Made and delivered across India.
          </p>
          <Link
            href="/customize"
            className="mt-5 inline-flex rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
          >
            Create Your Magnet
          </Link>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            <li>
              <Link className="transition hover:text-ocean-700" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-ocean-700" href="/#pricing">
                Products & Pricing
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-ocean-700" href="/#how">
                How It Works
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-ocean-700" href="/#faq">
                FAQ
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-ocean-700"
                href="/customize"
              >
                Design Your Magnet
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <a
                className="flex items-center gap-2.5 transition hover:text-ocean-700"
                href={whatsappLink("Hi! I want to order a photo magnet.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageIcon className="h-4 w-4 text-ocean-600" />
                WhatsApp: {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-2.5 transition hover:text-ocean-700"
                href={telLink()}
              >
                <PhoneIcon className="h-4 w-4 text-ocean-600" />
                Call: {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-2.5 transition hover:text-ocean-700"
                href={mailtoLink("Photo magnet enquiry", "Hi Fish Magnets India,")}
              >
                <MailIcon className="h-4 w-4 text-ocean-600" />
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-2.5 transition hover:text-ocean-700"
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="h-4 w-4 text-ocean-600" />
                {siteConfig.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>
            {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Made with care in India.</p>
        </div>
      </div>
    </footer>
  );
}

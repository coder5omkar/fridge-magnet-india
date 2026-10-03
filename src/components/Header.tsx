"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseIcon, FishIcon, MenuIcon } from "@/components/icons";
import { siteConfig } from "@/lib/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/#pricing", label: "Products & Pricing" },
  { href: "/#how", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-cyan-400 text-white shadow-soft">
            <FishIcon className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-900">
              {siteConfig.name}
            </span>
            <span className="block text-xs text-slate-500">
              Personalised photo magnets
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-ocean-50 hover:text-ocean-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/customize"
            className="hidden rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700 sm:inline-flex"
          >
            Create Your Magnet
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            {open ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-ocean-50 hover:text-ocean-700"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/customize"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl bg-ocean-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-soft"
          >
            Create Your Magnet
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

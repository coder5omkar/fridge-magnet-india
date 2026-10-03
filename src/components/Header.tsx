"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CloseIcon,
  FishIcon,
  MenuIcon,
  MessageIcon,
  UserIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { siteConfig, whatsappLink } from "@/lib/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/customize", label: "Design your magnets" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signInWithGoogle } = useAuth();

  const emailInitial = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
            <span className="hidden text-xs text-slate-500 sm:block">
              {siteConfig.tagline}
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
          <a
            href={whatsappLink("Hi! I want to order a photo magnet.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 sm:inline-flex"
          >
            <MessageIcon className="h-5 w-5" />
          </a>

          {user ? (
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-600 text-xs font-bold text-white">
                {emailInitial}
              </span>
              <span className="hidden sm:inline">My account</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700 sm:inline-flex"
            >
              <UserIcon className="h-4 w-4" />
              Sign in
            </button>
          )}

          <Link
            href="/customize"
            className="hidden rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700 sm:inline-flex"
          >
            Start designing
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
          {user ? (
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-ocean-50 hover:text-ocean-700"
            >
              My account
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signInWithGoogle();
              }}
              className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-ocean-50 hover:text-ocean-700"
            >
              Sign in with Google
            </button>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link
              href="/customize"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-ocean-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-soft"
            >
              Start designing
            </Link>
            <a
              href={whatsappLink("Hi! I want to order a photo magnet.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700"
            >
              <MessageIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

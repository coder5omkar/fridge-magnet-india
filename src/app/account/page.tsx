import type { Metadata } from "next";
import Link from "next/link";
import AccountView from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Your MemoryMagnet photo library. Photos not sent for print are deleted after 3 days.",
};

export default function AccountPage() {
  return (
    <div className="bg-gradient-to-b from-ocean-50 via-white to-white">
      <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="transition hover:text-ocean-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">My account</span>
        </nav>

        <header className="mt-5 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            My photo library
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Upload photos once, preview them as magnets and order any time.
            Only photos you send for print are kept long term.
          </p>
        </header>

        <div className="mt-8">
          <AccountView />
        </div>
      </div>
    </div>
  );
}

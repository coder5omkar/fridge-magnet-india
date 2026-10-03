import type { Metadata } from "next";
import Link from "next/link";
import Designer from "@/components/designer/Designer";
import { LockIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Design Your Photo Magnets",
  description:
    "Sign in with Google, save up to 10 photos, preview every magnet in 3D, and order on WhatsApp.",
};

export default function CustomizePage() {
  return (
    <div className="bg-gradient-to-b from-ocean-50 via-white to-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="transition hover:text-ocean-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">Design your magnets</span>
        </nav>

        <header className="mt-5 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Create your photo magnets
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <LockIcon className="h-4 w-4 text-ocean-600" />
            Your photos are stored securely in your account. Photos not sent
            for print are deleted after 3 days.
          </p>
        </header>

        <Designer />

        <div className="mt-14 rounded-3xl border border-ocean-100 bg-ocean-50/70 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">
            How ordering works
          </h2>
          <div className="mt-4 grid gap-4 text-sm leading-6 text-slate-600 sm:grid-cols-3">
            <p>
              <span className="font-semibold text-slate-800">
                1. Add your photos
              </span>
              <br />
              Sign in with Google and save up to 10 photos. All of them are
              visible in your account with a 3D preview.
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                2. Choose the look
              </span>
              <br />
              Pick portrait or landscape and a white or black board. Our print
              team fine-tunes the crop before printing.
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                3. Send on WhatsApp
              </span>
              <br />
              Your photos attach automatically on supported phones, or download
              them and attach in the chat. Pay by UPI after confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

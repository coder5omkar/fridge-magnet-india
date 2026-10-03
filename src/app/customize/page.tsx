import type { Metadata } from "next";
import Link from "next/link";
import Designer from "@/components/designer/Designer";
import { LockIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Design Your Photo Magnets",
  description:
    "Add up to 10 photos, preview every magnet in 3D, and order your 8x8 inch photo magnets on WhatsApp. No signup, no address forms.",
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
          <p className="mt-3 text-base leading-7 text-slate-600">
            Add one or many photos - each one becomes an 8 x 8 inch magnet.
            Preview every photo in 3D, then send your order on WhatsApp. No
            signup and no address forms: delivery details are collected in the
            chat.
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <LockIcon className="h-4 w-4 text-ocean-600" />
            Photos stay on your device until you send them on WhatsApp.
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
              Pick up to 10 photos. Each one becomes an 8 x 8 inch magnet.
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                2. Check the preview
              </span>
              <br />
              Tap any photo to rotate it in 3D and confirm the crop.
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                3. Send on WhatsApp
              </span>
              <br />
              We open WhatsApp with your order summary. Attach the photos and
              share your address in the chat. Pay by UPI after confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

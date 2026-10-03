import type { Metadata } from "next";
import Link from "next/link";
import Customizer from "@/components/customizer/Customizer";
import { ArrowRightIcon, LockIcon, RotateIcon } from "@/components/icons";
import type { ProductId } from "@/lib/products";

export const metadata: Metadata = {
  title: "Design Your Photo Magnet",
  description:
    "Upload your photo, preview it in 3D on premium acrylic or simple board, and order your 8x8 inch custom fish magnet on WhatsApp.",
};

interface CustomizePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomizePage({ searchParams }: CustomizePageProps) {
  const params = await searchParams;
  const finish = Array.isArray(params.finish) ? params.finish[0] : params.finish;
  const initialProductId: ProductId = finish === "board" ? "board" : "acrylic";

  return (
    <div className="bg-gradient-to-b from-ocean-50 via-white to-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="transition hover:text-ocean-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">Design your magnet</span>
        </nav>

        <div className="mt-6 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Design your 8 x 8 inch photo magnet
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Upload a photo to see it on your magnet in real time, compare acrylic
            and simple board, then place your order in one tap.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <RotateIcon className="h-4 w-4 text-ocean-600" />
              Free 3D preview, no signup
            </li>
            <li className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-ocean-600" />
              Photos stay on your device until you order
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <Customizer initialProductId={initialProductId} />
        </div>

        <div className="mt-14 rounded-3xl border border-ocean-100 bg-ocean-50/70 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">
            Orders are confirmed on WhatsApp
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            No payment happens on this page. When you place the order, WhatsApp
            opens with your full order summary. Attach your photo in the chat
            and we confirm everything, then share a secure UPI or bank payment
            link. Cash on delivery is available on selected pin codes.
          </p>
          <Link
            href="/#faq"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 transition hover:text-ocean-800"
          >
            Read ordering FAQ
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

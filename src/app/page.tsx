import OrderFlow from "@/components/order/OrderFlow";
import { MessageIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { telLink } from "@/lib/config";
import { PRODUCT, SIZE_LABEL, formatINR } from "@/lib/products";

const trustItems = [
  {
    icon: TruckIcon,
    title: "Ships in 2-5 days",
    text: "Across all of India, with tracking on WhatsApp",
  },
  {
    icon: ShieldIcon,
    title: "Damage-safe packing",
    text: "Transit damage replaced free, no questions asked",
  },
  {
    icon: MessageIcon,
    title: "Human support",
    text: "A real person replies on WhatsApp, every day",
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-ocean-50 via-white to-white">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <section className="text-center">
          <span className="inline-flex items-center rounded-full border border-ocean-200 bg-white px-4 py-1.5 text-xs font-semibold text-ocean-700 shadow-sm">
            {formatINR(PRODUCT.price)} each - buy 2 or more and save 10%
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Your photo, on your fridge
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
            {SIZE_LABEL} photo magnet. Upload your photo, see it in 3D, and
            order on WhatsApp. That is it.
          </p>
        </section>

        <section className="mt-8">
          <OrderFlow />
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl bg-slate-900 px-5 py-5 text-center text-sm text-slate-200">
          Questions before ordering?{" "}
          <a
            href={telLink()}
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Call or WhatsApp us
          </a>{" "}
          - we reply within minutes during the day.
        </section>
      </div>
    </div>
  );
}

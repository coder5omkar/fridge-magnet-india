"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import OrderForm from "./OrderForm";
import {
  CheckIcon,
  ImageIcon,
  MinusIcon,
  PlusIcon,
  RotateIcon,
  SparklesIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons";
import { PhotoError, formatBytes, preparePhoto, type PhotoInfo } from "@/lib/photo";
import {
  MAX_QUANTITY,
  SIZE_LABEL,
  computePrice,
  formatINR,
  getProduct,
  products,
  type ProductId,
} from "@/lib/products";

const Magnet3D = dynamic(() => import("./Magnet3D"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

function ViewerSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100">
      <p className="text-sm font-medium text-slate-500">
        Loading 3D preview...
      </p>
    </div>
  );
}

function StepBadge({ number }: { number: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">
      {number}
    </span>
  );
}

interface CustomizerProps {
  initialProductId: ProductId;
}

export default function Customizer({ initialProductId }: CustomizerProps) {
  const [productId, setProductId] = useState<ProductId>(initialProductId);
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState<PhotoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const price = computePrice(productId, quantity);
  const product = getProduct(productId);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    setPreparing(true);
    try {
      const info = await preparePhoto(file);
      setPhoto(info);
    } catch (caught) {
      setError(
        caught instanceof PhotoError
          ? caught.message
          : "Something went wrong while reading that photo. Please try another one."
      );
    } finally {
      setPreparing(false);
    }
  }

  function startNewOrder() {
    setPhoto(null);
    setQuantity(1);
    setProductId(initialProductId);
    setError(null);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
      <div className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">3D preview</h2>
              <p className="text-xs text-slate-500">
                Drag to rotate, scroll to zoom
              </p>
            </div>
            <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
              {product.shortName} / {SIZE_LABEL}
            </span>
          </div>

          <div className="relative aspect-square bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100">
            <div className="absolute inset-0">
              <Magnet3D photoUrl={photo?.url ?? null} productId={productId} />
            </div>
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-white">
              {photo
                ? "This is how your magnet will look"
                : "Upload a photo to see it on the magnet"}
            </span>
          </div>

          {photo ? (
            <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
              <Image
                src={photo.url}
                alt="Your uploaded photo"
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {photo.name}
                </p>
                <p className="text-xs text-slate-500">
                  {photo.width} x {photo.height} px / {formatBytes(photo.sizeBytes)}
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckIcon className="h-3.5 w-3.5" />
                Ready
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SparklesIcon className="h-4 w-4 text-ocean-600" />
            Photo tips for a perfect print
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {[
              "Use a clear, well-lit photo with the subject in focus",
              "Square (1:1) photos fill the magnet edge to edge",
              "At least 800 x 800 pixels keeps the print sharp",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start gap-3">
            <StepBadge number={1} />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upload your photo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                JPG, PNG or WEBP, up to 15 MB. It never leaves your device until
                you order.
              </p>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}

          {photo ? (
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <Image
                src={photo.url}
                alt="Your uploaded photo"
                width={96}
                height={96}
                unoptimized
                className="h-20 w-20 rounded-2xl object-cover shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {photo.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {photo.width} x {photo.height} px / {formatBytes(photo.sizeBytes)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
                  >
                    Replace photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="photo-input"
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                handleFile(event.dataTransfer.files?.[0]);
              }}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging
                  ? "border-ocean-400 bg-ocean-50"
                  : "border-ocean-200 bg-ocean-50/40 hover:border-ocean-300 hover:bg-ocean-50"
              }`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ocean-600 shadow-sm">
                <UploadIcon className="h-7 w-7" />
              </span>
              <span className="text-base font-semibold text-slate-800">
                {preparing ? "Preparing your photo..." : "Tap to choose a photo"}
              </span>
              <span className="text-xs text-slate-500">
                or drag and drop it here
              </span>
            </label>
          )}

          <input
            id="photo-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start gap-3">
            <StepBadge number={2} />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Choose finish and quantity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Both finishes are {SIZE_LABEL} with a strong magnetic back.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {products.map((option) => {
              const selected = option.id === productId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setProductId(option.id)}
                  aria-pressed={selected}
                  className={`relative rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-ocean-500 bg-ocean-50/60 ring-2 ring-ocean-100"
                      : "border-slate-200 bg-white hover:border-ocean-200"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {option.shortName}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected
                          ? "border-ocean-600 bg-ocean-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected ? <CheckIcon className="h-3 w-3" /> : null}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {option.blurb}
                  </span>
                  <span className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatINR(option.price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatINR(option.mrp)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">
              Quantity
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-ocean-200 hover:text-ocean-700 disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={MAX_QUANTITY}
                value={quantity}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  setQuantity(
                    Number.isNaN(value)
                      ? 1
                      : Math.max(1, Math.min(MAX_QUANTITY, value))
                  );
                }}
                aria-label="Quantity"
                className="h-9 w-14 rounded-xl border border-slate-200 bg-white text-center text-sm font-bold text-slate-800"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-ocean-200 hover:text-ocean-700 disabled:opacity-40"
                disabled={quantity >= MAX_QUANTITY}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <dt>
                Subtotal ({quantity} x {formatINR(price.unitPrice)})
              </dt>
              <dd className="font-medium text-slate-800">
                {formatINR(price.subtotal)}
              </dd>
            </div>
            {price.discountAmount > 0 ? (
              <div className="flex items-center justify-between text-emerald-600">
                <dt>Bulk discount ({price.discountPercent}%)</dt>
                <dd className="font-semibold">
                  -{formatINR(price.discountAmount)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-slate-600">
              <dt>Shipping</dt>
              <dd>
                {price.shipping === 0 ? (
                  <span className="font-semibold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-medium text-slate-800">
                    {formatINR(price.shipping)}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
              <dt>Total</dt>
              <dd>{formatINR(price.total)}</dd>
            </div>
          </dl>

          {price.shipping > 0 ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
              Add {formatINR(price.freeShippingShortfall)} more or order 2+
              magnets to get free shipping.
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start gap-3">
            <StepBadge number={3} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Delivery details
                </h2>
                <ImageIcon className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                We only use these details to deliver your order.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <OrderForm
              productId={productId}
              quantity={quantity}
              photo={photo}
              onStartNew={startNewOrder}
            />
          </div>
        </section>

        <p className="flex items-start gap-2 px-2 text-xs leading-5 text-slate-500">
          <RotateIcon className="mt-0.5 h-4 w-4 shrink-0 text-ocean-500" />
          Tip: rotate the 3D preview to check the edges and thickness before you
          order. You can switch finishes above any time.
        </p>
      </div>
    </div>
  );
}

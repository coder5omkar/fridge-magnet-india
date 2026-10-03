"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  ImageIcon,
  MessageIcon,
  PhoneIcon,
  PlusIcon,
  RotateIcon,
  UploadIcon,
} from "@/components/icons";
import { siteConfig, telLink, whatsappLink } from "@/lib/config";
import { log } from "@/lib/logger";
import {
  PhotoError,
  preparePhoto,
  type PhotoInfo,
} from "@/lib/photo";
import {
  MAX_MAGNETS,
  PRODUCT,
  SIZE_LABEL,
  computePrice,
  formatINR,
} from "@/lib/products";

const BoardPreview3D = dynamic(() => import("./BoardPreview3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gradient-to-b from-slate-100 to-ocean-50" />
  ),
});

interface MagnetPhoto extends PhotoInfo {
  key: string;
}

function createOrderId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  const stamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `FM-${random}${stamp}`;
}

export default function Designer() {
  const [photos, setPhotos] = useState<MagnetPhoto[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [order, setOrder] = useState<{ id: string; message: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const selected =
    photos.find((photo) => photo.key === selectedKey) ?? photos[0] ?? null;
  const count = photos.length;
  const price = computePrice(count);

  useEffect(() => {
    if (order) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [order]);

  async function addFiles(fileList: File[]) {
    if (fileList.length === 0) return;
    const remaining = MAX_MAGNETS - photos.length;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_MAGNETS} photos per order.`);
      return;
    }
    const batch = fileList.slice(0, remaining);
    if (fileList.length > remaining) {
      setError(`Only ${MAX_MAGNETS} photos per order, so we added the first ${remaining}.`);
    } else {
      setError(null);
    }
    setBusy(true);
    log("photos_selected", { requested: fileList.length, accepted: batch.length });

    const added: MagnetPhoto[] = [];
    for (let index = 0; index < batch.length; index++) {
      setProgress(
        batch.length > 1
          ? `Adding photo ${index + 1} of ${batch.length}...`
          : "Adding your photo..."
      );
      try {
        const info = await preparePhoto(batch[index]);
        added.push({
          ...info,
          key: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        });
        log(
          "photo_ready",
          { name: info.name, width: info.width, height: info.height },
          "success"
        );
      } catch (caught) {
        const message =
          caught instanceof PhotoError
            ? caught.message
            : "Could not read one of the photos. Please try another file.";
        setError(message);
        log("photo_failed", { name: batch[index].name, message }, "error");
      }
    }

    setProgress(null);
    setBusy(false);
    if (added.length > 0) {
      const firstAdd = photos.length === 0;
      setPhotos((current) => [...current, ...added]);
      setSelectedKey(added[0].key);
      log("photos_added", { count: added.length }, "success");
      if (firstAdd) {
        requestAnimationFrame(() => {
          previewRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }
    }
  }

  function removePhoto(key: string) {
    const next = photos.filter((photo) => photo.key !== key);
    setPhotos(next);
    if (selectedKey === key) {
      setSelectedKey(next[0]?.key ?? null);
    }
    log("photo_removed", { remaining: next.length });
  }

  function buildMessage(orderId: string): string {
    const lines = [
      `New order ${orderId} from the website`,
      "",
      `${PRODUCT.name} (${SIZE_LABEL}) x ${count}`,
    ];
    if (price.discountAmount > 0) {
      lines.push(
        `Discount ${price.discountPercent}%: -${formatINR(price.discountAmount)}`
      );
    }
    if (price.shipping > 0) {
      lines.push(`Shipping: ${formatINR(price.shipping)}`);
    }
    lines.push(`Total: ${formatINR(price.total)}`, "", "My photos for printing:");
    photos.forEach((photo, index) => {
      lines.push(`${index + 1}. ${photo.name}`);
    });
    lines.push(
      "",
      "I am attaching these photos in this chat.",
      "I will share my delivery address here as well."
    );
    return lines.join("\n");
  }

  function handleOrder() {
    if (count === 0) {
      log("order_blocked_no_photos", {}, "warn");
      return;
    }
    const orderId = createOrderId();
    const message = buildMessage(orderId);
    const opened = window.open(
      whatsappLink(message),
      "_blank",
      "noopener,noreferrer"
    );
    log(
      "order_submitted",
      {
        orderId,
        magnets: count,
        total: price.total,
        shipping: price.shipping,
        whatsappOpened: opened !== null,
      },
      opened ? "success" : "warn"
    );
    setOrder({ id: orderId, message });
  }

  async function copyOrder() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.message);
      setCopied(true);
      log("order_copied", { orderId: order.id }, "success");
    } catch {
      log("order_copy_failed", { orderId: order.id }, "warn");
    }
  }

  function resetAll() {
    setOrder(null);
    setPhotos([]);
    setSelectedKey(null);
    setError(null);
    setCopied(false);
    log("order_restarted");
  }

  if (order) {
    return (
      <div ref={topRef} className="scroll-mt-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-card sm:p-8">
          <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            Order {order.id} is ready
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            WhatsApp opened with your order summary. Attach your{" "}
            {count === 1 ? "photo" : `${count} photos`} and share your delivery
            address in the chat. We confirm and send the payment link.
          </p>
          <ol className="mx-auto mt-4 max-w-xs space-y-1 text-left text-xs text-slate-500">
            {photos.map((photo, index) => (
              <li key={photo.key} className="truncate">
                {index + 1}. {photo.name}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappLink(order.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
            >
              <MessageIcon className="h-4 w-4" />
              Open WhatsApp again
            </a>
            <button
              type="button"
              onClick={copyOrder}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
            >
              <CopyIcon className="h-4 w-4" />
              {copied ? "Copied" : "Copy order details"}
            </button>
            <a
              href={telLink()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
            >
              <PhoneIcon className="h-4 w-4" />
              Call instead
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            WhatsApp did not open? Allow pop-ups and use &ldquo;Open WhatsApp
            again&rdquo;, or call {siteConfig.callDisplay}.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-5 text-sm font-semibold text-ocean-700 underline-offset-4 transition hover:underline"
          >
            Place another order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
      <div
        ref={previewRef}
        className="order-2 scroll-mt-24 lg:order-1 lg:row-span-2"
      >
        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Live 3D preview
                </h2>
                <p className="text-xs text-slate-500">
                  {selected
                    ? "Drag to rotate, like holding it in your hand"
                    : "Your magnet will appear here"}
                </p>
              </div>
              <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
                {count} {count === 1 ? "magnet" : "magnets"}
              </span>
            </div>

            <div className="relative aspect-square bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100">
              {selected ? (
                <>
                  <div className="absolute inset-0">
                    <BoardPreview3D photoUrl={selected.url} />
                  </div>
                  <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-white">
                    <RotateIcon className="h-3.5 w-3.5" />
                    Drag to see every side
                  </span>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-ocean-400 shadow-sm">
                    <ImageIcon className="h-8 w-8" />
                  </span>
                  <p className="text-sm font-bold text-slate-700">
                    Add your first photo
                  </p>
                  <p className="text-xs leading-5 text-slate-500">
                    It will appear here as a magnet you can rotate and zoom
                  </p>
                </div>
              )}
            </div>

            {selected ? (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                <p className="min-w-0 truncate text-xs text-slate-500">
                  {selected.name} / {selected.width} x {selected.height} px
                </p>
                <button
                  type="button"
                  onClick={() => removePhoto(selected.key)}
                  className="shrink-0 text-xs font-semibold text-red-600 transition hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>

          <p className="mt-3 px-2 text-center text-xs text-slate-500">
            Photos stay on your device until you send them on WhatsApp.
          </p>
        </div>
      </div>

      <section className="order-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6 lg:order-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">
            1
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Add your photos
            </h2>
            <p className="text-xs text-slate-500">
              Up to {MAX_MAGNETS}. You can pick many at once.
            </p>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {error}
          </p>
        ) : null}

        <label
          htmlFor="photos-input"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(Array.from(event.dataTransfer.files ?? []));
          }}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 text-center transition ${
            count > 0 ? "py-5" : "py-8"
          } ${
            dragging
              ? "border-ocean-400 bg-ocean-50"
              : "border-ocean-200 bg-ocean-50/40 hover:border-ocean-300 hover:bg-ocean-50"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ocean-600 shadow-sm">
            <UploadIcon className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold text-slate-800">
            {busy
              ? progress
              : count > 0
                ? "Add more photos"
                : "Tap to choose your photos"}
          </span>
          <span className="text-xs text-slate-500">
            JPG or PNG up to 15 MB each / multiple photos allowed
          </span>
        </label>

        <input
          id="photos-input"
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          disabled={busy || count >= MAX_MAGNETS}
          className="sr-only"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />

        {count > 0 ? (
          <div className="mt-6">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
              Your magnets
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {count} of {MAX_MAGNETS}
              </span>
            </p>
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {photos.map((photo, index) => (
                <div key={photo.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedKey(photo.key)}
                    aria-label={`Preview photo ${index + 1}: ${photo.name}`}
                    className={`block aspect-square w-full rounded-xl border-2 bg-cover bg-center transition ${
                      selected?.key === photo.key
                        ? "border-ocean-500 ring-2 ring-ocean-200"
                        : "border-white shadow-sm hover:border-ocean-200"
                    }`}
                    style={{ backgroundImage: `url(${photo.url})` }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.key)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow transition hover:bg-red-600"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                  <span className="mt-1 block text-center text-[10px] font-medium text-slate-400">
                    {index + 1}
                  </span>
                </div>
              ))}
              {count < MAX_MAGNETS ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ocean-200 bg-ocean-50/40 text-ocean-600 transition hover:bg-ocean-50 disabled:opacity-50"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="text-[10px] font-semibold">Add</span>
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Tap a photo to preview it. Each photo becomes one guided magnet.
            </p>
          </div>
        ) : null}
      </section>

      <section className="order-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">
            2
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Order on WhatsApp
            </h2>
            <p className="text-xs text-slate-500">
              No forms. We collect your name, address and pincode in the chat.
            </p>
          </div>
        </div>

        {count === 0 ? (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <span className="text-xl font-extrabold text-slate-900">
              {formatINR(PRODUCT.price)}
            </span>{" "}
            per magnet. Add photos above to see your total.
          </div>
        ) : (
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <dt>
                {count} x {PRODUCT.name} ({SIZE_LABEL})
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
        )}

        {count === 1 ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
            Add one more photo to save 10% and get free shipping.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleOrder}
          disabled={count === 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <MessageIcon className="h-5 w-5" />
          {count > 0
            ? `Send order on WhatsApp - ${formatINR(price.total)}`
            : "Add a photo to continue"}
        </button>

        <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs text-slate-500">
          <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          Opens WhatsApp with your order summary. Attach your photos and share
          your delivery address there.
        </p>
      </section>
    </div>
  );
}

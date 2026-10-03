"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import DebugPanel from "@/components/DebugPanel";
import {
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  MessageIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  RotateIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons";
import { siteConfig, telLink, whatsappLink } from "@/lib/config";
import { installErrorLogging, log } from "@/lib/logger";
import {
  PhotoError,
  formatBytes,
  preparePhoto,
  type PhotoInfo,
} from "@/lib/photo";
import {
  MAX_QUANTITY,
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

interface FieldErrors {
  name?: string;
  phone?: string;
  address?: string;
}

function createOrderId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  const stamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `FM-${random}${stamp}`;
}

function StepHeader({
  number,
  title,
  hint,
  done,
}: {
  number: number;
  title: string;
  hint: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done ? "bg-emerald-500 text-white" : "bg-ocean-600 text-white"
        }`}
      >
        {done ? <CheckIcon className="h-4 w-4" /> : number}
      </span>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

export default function OrderFlow() {
  const [photo, setPhoto] = useState<PhotoInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [order, setOrder] = useState<{ id: string; message: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const price = computePrice(quantity);

  useEffect(() => {
    installErrorLogging();
    log("page_view", { page: "home" });
  }, []);

  useEffect(() => {
    if (photo) {
      qtyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [photo]);

  useEffect(() => {
    if (order) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [order]);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setPhotoError(null);
    setPreparing(true);
    log("photo_selected", {
      name: file.name,
      type: file.type,
      bytes: file.size,
    });
    try {
      const info = await preparePhoto(file);
      setPhoto(info);
      log(
        "photo_ready",
        {
          name: info.name,
          width: info.width,
          height: info.height,
          bytes: info.sizeBytes,
        },
        "success"
      );
    } catch (caught) {
      const message =
        caught instanceof PhotoError
          ? caught.message
          : "Something went wrong while reading that photo. Please try another one.";
      setPhotoError(message);
      log("photo_failed", { name: file.name, message }, "error");
    } finally {
      setPreparing(false);
    }
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoError(null);
    log("photo_removed");
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    const digits = phone.replace(/\D/g, "");
    const local =
      digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(local)) {
      next.phone = "Enter a valid 10-digit mobile number.";
    }
    if (address.trim().length < 10) {
      next.address = "Please enter your full address with pincode.";
    }
    return next;
  }

  function buildMessage(orderId: string): string {
    const lines = [
      `New order ${orderId} from the website`,
      "",
      `${PRODUCT.name} (${SIZE_LABEL}) x ${quantity}`,
    ];
    if (price.discountAmount > 0) {
      lines.push(
        `Discount ${price.discountPercent}%: -${formatINR(price.discountAmount)}`
      );
    }
    if (price.shipping > 0) {
      lines.push(`Shipping: ${formatINR(price.shipping)}`);
    }
    lines.push(
      `Total: ${formatINR(price.total)}`,
      "",
      "Deliver to:",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
      "",
      "I am attaching my photo in this chat."
    );
    return lines.join("\n");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      log("order_blocked_missing_photo", {}, "warn");
      return;
    }
    const nextErrors = validate();
    setErrors(nextErrors);
    const failedFields = Object.keys(nextErrors) as (keyof FieldErrors)[];
    if (failedFields.length > 0) {
      log("validation_failed", { fields: failedFields }, "warn");
      document.getElementById(`field-${failedFields[0]}`)?.focus();
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
        quantity,
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
    setPhoto(null);
    setPhotoError(null);
    setQuantity(1);
    setName("");
    setPhone("");
    setAddress("");
    setErrors({});
    setCopied(false);
    log("order_restarted");
  }

  if (order) {
    return (
      <div ref={topRef} className="scroll-mt-24">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-card sm:p-8">
          <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            Order {order.id} is ready
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            WhatsApp opened with your order details. Just{" "}
            <span className="font-semibold text-slate-800">
              attach your photo and press send
            </span>
            . We will confirm your order and share the payment link.
          </p>
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
        <DebugPanel />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-ocean-50 px-4 py-3">
        <span className="text-sm font-bold text-ocean-900">
          Takes about 1 minute
        </span>
        <span className="text-xs font-medium text-ocean-700">
          3 quick steps: photo, quantity, delivery
        </span>
      </div>

      <section className="mt-6">
        <StepHeader
          number={1}
          title="Add your photo"
          hint={photo ? photo.name : "A clear, well-lit photo looks best"}
          done={Boolean(photo)}
        />

        {photoError ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {photoError}
          </p>
        ) : null}

        {photo ? (
          <div className="mt-4">
            <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-100 to-ocean-50 sm:h-72">
              <BoardPreview3D photoUrl={photo.url} />
              <div className="absolute left-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow transition hover:text-ocean-700"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-600 shadow transition hover:bg-red-50"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-white">
                <RotateIcon className="h-3.5 w-3.5" />
                Drag to see your magnet from every side
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {photo.width} x {photo.height} px / {formatBytes(photo.sizeBytes)}{" "}
              / saved on your device only
            </p>
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
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition ${
              dragging
                ? "border-ocean-400 bg-ocean-50"
                : "border-ocean-200 bg-ocean-50/40 hover:border-ocean-300 hover:bg-ocean-50"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ocean-600 shadow-sm">
              <UploadIcon className="h-6 w-6" />
            </span>
            <span className="text-base font-semibold text-slate-800">
              {preparing ? "Preparing your photo..." : "Tap to add your photo"}
            </span>
            <span className="text-xs text-slate-500">
              or drag and drop / JPG, PNG up to 15 MB
            </span>
          </label>
        )}

        <input
          id="photo-input"
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </section>

      <section
        ref={qtyRef}
        className="mt-8 scroll-mt-24 border-t border-slate-100 pt-6"
      >
        <StepHeader
          number={2}
          title="How many magnets?"
          hint="Buy 2 or more and save 10% with free shipping"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-ocean-300 hover:text-ocean-700 disabled:opacity-40"
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
              className="h-10 w-14 rounded-xl border border-slate-200 bg-white text-center text-lg font-bold text-slate-900"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))
              }
              disabled={quantity >= MAX_QUANTITY}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-ocean-300 hover:text-ocean-700 disabled:opacity-40"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatINR(price.total)}
            </div>
            <div className="text-xs text-slate-500">
              {quantity} x {formatINR(PRODUCT.price)}
              {price.discountPercent > 0
                ? ` (${price.discountPercent}% off)`
                : ""}
            </div>
          </div>
        </div>

        <p
          className={`mt-2 text-xs font-medium ${
            price.shipping === 0 ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {price.shipping === 0
            ? "Free shipping included"
            : `+ ${formatINR(price.shipping)} shipping. Order 2+ for free shipping.`}
        </p>
      </section>

      <section className="mt-8 border-t border-slate-100 pt-6">
        <StepHeader
          number={3}
          title="Where should we deliver?"
          hint="We use this only for your delivery"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="field-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Your name
            </label>
            <input
              id="field-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.name
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-ocean-400 focus:ring-ocean-100"
              }`}
            />
            {errors.name ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="field-phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Mobile number
            </label>
            <input
              id="field-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setErrors((current) => ({ ...current, phone: undefined }));
              }}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.phone
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-ocean-400 focus:ring-ocean-100"
              }`}
            />
            {errors.phone ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.phone}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="field-address"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Full address
          </label>
          <textarea
            id="field-address"
            rows={3}
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setErrors((current) => ({ ...current, address: undefined }));
            }}
            placeholder="House / flat number, street, area, city, pincode"
            autoComplete="street-address"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              errors.address
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-ocean-400 focus:ring-ocean-100"
            }`}
          />
          {errors.address ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.address}
            </p>
          ) : null}
        </div>
      </section>

      <button
        type="submit"
        disabled={!photo}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        <MessageIcon className="h-5 w-5" />
        {photo
          ? `Order on WhatsApp - ${formatINR(price.total)}`
          : "Add your photo to continue"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        No payment now. We confirm on WhatsApp first. Need help? Call{" "}
        <a
          href={telLink()}
          className="font-semibold text-ocean-700 hover:underline"
        >
          {siteConfig.callDisplay}
        </a>
      </p>

      <DebugPanel />
    </form>
  );
}

"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  LockIcon,
  MailIcon,
  MessageIcon,
} from "@/components/icons";
import { mailtoLink, siteConfig, whatsappLink } from "@/lib/config";
import { formatBytes, type PhotoInfo } from "@/lib/photo";
import {
  SIZE_LABEL,
  computePrice,
  formatINR,
  getProduct,
  type ProductId,
} from "@/lib/products";

interface OrderFormProps {
  productId: ProductId;
  quantity: number;
  photo: PhotoInfo | null;
  onStartNew: () => void;
}

interface FormState {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

const emptyForm: FormState = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  notes: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function OrderForm({
  productId,
  quantity,
  photo,
  onStartNew,
}: OrderFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const product = getProduct(productId);
  const price = computePrice(productId, quantity);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (form.name.trim().length < 2) {
      next.name = "Please enter your full name.";
    }
    const digits = form.phone.replace(/\D/g, "");
    const local =
      digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(local)) {
      next.phone = "Enter a valid 10-digit mobile number.";
    }
    if (form.address.trim().length < 10) {
      next.address = "Please enter your full address with house or flat number.";
    }
    if (form.city.trim().length < 2) {
      next.city = "Please enter your city.";
    }
    if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) {
      next.pincode = "Enter a valid 6-digit pincode.";
    }
    return next;
  }

  function buildMessage(): string {
    const lines = [
      "Hello Fish Magnets India! I want to place an order:",
      "",
      `Product: ${product.name} (${SIZE_LABEL})`,
      `Quantity: ${quantity}`,
      `Unit price: ${formatINR(price.unitPrice)}`,
    ];
    if (price.discountAmount > 0) {
      lines.push(
        `Bulk discount (${price.discountPercent}%): -${formatINR(price.discountAmount)}`
      );
    }
    lines.push(
      `Shipping: ${price.shipping === 0 ? "FREE" : formatINR(price.shipping)}`,
      `Total: ${formatINR(price.total)}`,
      "",
      "My delivery details:",
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Address: ${form.address.trim()}`,
      `City: ${form.city.trim()}`,
      `Pincode: ${form.pincode.trim()}`
    );
    if (form.notes.trim()) {
      lines.push(`Notes: ${form.notes.trim()}`);
    }
    lines.push(
      "",
      photo
        ? `Photo: I will attach my photo (${photo.name}) in this chat.`
        : "Photo: I will share my photo in this chat."
    );
    return lines.join("\n");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    window.open(whatsappLink(buildMessage()), "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  function resetAll() {
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
    onStartNew();
  }

  if (submitted) {
    const message = buildMessage();
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          Almost done - send your photo!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          WhatsApp should have opened with your order summary. Please attach
          your photo
          {photo ? (
            <>
              {" "}
              <span className="font-semibold text-slate-800">
                ({photo.name}, {formatBytes(photo.sizeBytes)})
              </span>
            </>
          ) : null}{" "}
          in the chat and press send. We will confirm your order and share the
          payment link.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
          >
            <MessageIcon className="h-4 w-4" />
            Open WhatsApp again
          </a>
          <a
            href={mailtoLink(`New photo magnet order - ${product.name}`, message)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
          >
            <MailIcon className="h-4 w-4" />
            Send by email instead
          </a>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="mt-4 text-sm font-semibold text-ocean-700 underline-offset-4 transition hover:underline"
        >
          Start a new order
        </button>
        <p className="mt-4 text-xs text-slate-500">
          WhatsApp did not open? Allow pop-ups for this site and try again.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="order-name"
          label="Full name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          error={errors.name}
          placeholder="e.g. Priya Sharma"
          autoComplete="name"
        />
        <Field
          id="order-phone"
          label="Mobile number"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          error={errors.phone}
          placeholder="10-digit mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <Field
        id="order-address"
        label="Full address"
        value={form.address}
        onChange={(value) => updateField("address", value)}
        error={errors.address}
        placeholder="House / flat number, street, area, landmark"
        autoComplete="street-address"
        textarea
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="order-city"
          label="City"
          value={form.city}
          onChange={(value) => updateField("city", value)}
          error={errors.city}
          placeholder="e.g. Mumbai"
          autoComplete="address-level2"
        />
        <Field
          id="order-pincode"
          label="Pincode"
          value={form.pincode}
          onChange={(value) => updateField("pincode", value)}
          error={errors.pincode}
          placeholder="6-digit pincode"
          inputMode="numeric"
          autoComplete="postal-code"
        />
      </div>

      <Field
        id="order-notes"
        label="Order notes (optional)"
        value={form.notes}
        onChange={(value) => updateField("notes", value)}
        placeholder="Gift wrapping, delivery instructions, special requests"
        textarea
      />

      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
        <div className="flex items-center justify-between font-semibold text-slate-900">
          <span>Order total</span>
          <span>{formatINR(price.total)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {quantity} x {product.shortName} magnet{quantity > 1 ? "s" : ""} /{" "}
          {SIZE_LABEL}
          {price.shipping === 0 ? " / free shipping" : ""}
        </p>
      </div>

      <button
        type="submit"
        disabled={!photo}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MessageIcon className="h-5 w-5" />
        Place order on WhatsApp - {formatINR(price.total)}
      </button>

      {!photo ? (
        <p className="text-center text-xs font-medium text-amber-600">
          Upload your photo in step 1 to enable ordering.
        </p>
      ) : null}

      <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <LockIcon className="h-3.5 w-3.5" />
        No payment on this page. We confirm on WhatsApp first. Support:{" "}
        {siteConfig.whatsappDisplay}
      </p>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric";
  autoComplete?: string;
  textarea?: boolean;
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  textarea,
}: FieldProps) {
  const classes = `w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-ocean-400 focus:ring-ocean-100"
  }`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={classes}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={classes}
        />
      )}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  LogOutIcon,
  MessageIcon,
  RotateIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { whatsappLink } from "@/lib/config";
import { boardDimensions, type BoardColor, type Orientation } from "@/lib/fitting";
import {
  deleteLibraryPhoto,
  fetchLibrary,
  fetchPhotoFile,
  markPhotosPrinted,
  updatePhotoOptions,
  type LibraryPhoto,
} from "@/lib/library";
import { log } from "@/lib/logger";
import {
  buildOrderMessage,
  createOrderId,
  downloadFiles,
  shareOrderFiles,
  type OrderMethod,
} from "@/lib/order";
import { computePrice, formatINR } from "@/lib/products";
import { MAX_LIBRARY_PHOTOS, RETENTION_DAYS } from "@/lib/supabase";

const BoardPreview3D = dynamic(
  () => import("@/components/designer/BoardPreview3D"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-gradient-to-b from-slate-100 to-ocean-50" />
    ),
  }
);

interface OrderResult {
  id: string;
  message: string;
  method: OrderMethod;
  files: File[];
  count: number;
}

function segmentClasses(active: boolean): string {
  return `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? "bg-white text-ocean-700 shadow-sm"
      : "text-slate-500 hover:text-slate-700"
  }`;
}

export default function AccountView() {
  const { user, loading, configured, signInWithGoogle, signOut } = useAuth();
  const [library, setLibrary] = useState<LibraryPhoto[] | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchLibrary(user).then((items) => {
      if (!active) return;
      setLibrary(items);
      setSelectedIds(
        items
          .filter((photo) => !photo.printed)
          .slice(0, MAX_LIBRARY_PHOTOS)
          .map((photo) => photo.id)
      );
    });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!previewId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewId]);

  async function handleDelete(photo: LibraryPhoto) {
    const deleted = await deleteLibraryPhoto(photo);
    if (deleted) {
      setLibrary((current) =>
        (current ?? []).filter((item) => item.id !== photo.id)
      );
      setSelectedIds((current) =>
        current.filter((id) => id !== photo.id)
      );
      if (previewId === photo.id) setPreviewId(null);
    }
  }

  function handleOptionsChange(
    photo: LibraryPhoto,
    patch: { orientation?: Orientation; boardColor?: BoardColor }
  ) {
    const nextOrientation = patch.orientation ?? photo.orientation;
    const nextColor = patch.boardColor ?? photo.boardColor;
    setLibrary((current) =>
      (current ?? []).map((item) =>
        item.id === photo.id
          ? {
              ...item,
              orientation: nextOrientation,
              boardColor: nextColor,
            }
          : item
      )
    );
    updatePhotoOptions(photo.id, nextOrientation, nextColor);
    log("photo_options_changed", {
      id: photo.id,
      orientation: nextOrientation,
      boardColor: nextColor,
    });
  }

  function toggleSelect(photo: LibraryPhoto) {
    setSelectedIds((current) => {
      if (current.includes(photo.id)) {
        return current.filter((id) => id !== photo.id);
      }
      if (current.length >= MAX_LIBRARY_PHOTOS) {
        setError(`You can order up to ${MAX_LIBRARY_PHOTOS} photos at a time.`);
        return current;
      }
      setError(null);
      return [...current, photo.id];
    });
  }

  async function handleOrder() {
    if (!user || selectedIds.length === 0) return;
    const photos = library ?? [];
    const items = photos.filter((photo) => selectedIds.includes(photo.id));
    if (items.length === 0) return;

    setOrdering(true);
    setError(null);
    const orderId = createOrderId();
    const price = computePrice(items.length);
    const message = buildOrderMessage(
      orderId,
      items.map((photo) => ({
        name: photo.name,
        orientation: photo.orientation,
        boardColor: photo.boardColor,
      })),
      price
    );

    markPhotosPrinted(items.map((photo) => photo.id)).catch(() => {
      log("photo_print_flag_failed", {}, "warn");
    });
    setLibrary((current) =>
      (current ?? []).map((item) =>
        items.some((ordered) => ordered.id === item.id)
          ? { ...item, printed: true }
          : item
      )
    );

    const fileResults = await Promise.all(
      items.map((photo) => fetchPhotoFile(photo))
    );
    const files = fileResults.filter((file): file is File => Boolean(file));
    const method = await shareOrderFiles(files, message, orderId);
    log("order_placed", {
      orderId,
      magnets: items.length,
      total: price.total,
      method,
      source: "account",
    });

    setSelectedIds([]);
    setOrdering(false);
    setOrderResult({ id: orderId, message, method, files, count: items.length });
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-100 bg-amber-50 p-6 text-center text-sm text-amber-800">
        Accounts are being set up. Please check back shortly.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl animate-pulse rounded-3xl border border-slate-200 bg-white p-10 shadow-card" />
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-600">
          <UserIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
          Sign in to your account
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Save up to {MAX_LIBRARY_PHOTOS} photos, preview each one in 3D and
          order in a tap. Photos you do not send for print are deleted after{" "}
          {RETENTION_DAYS} days.
        </p>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
        >
          <UserIcon className="h-4 w-4" />
          Continue with Google
        </button>
        <p className="mt-4 text-xs text-slate-500">
          We only use your email to keep your photos in your account.
        </p>
      </div>
    );
  }

  const name = String(user.user_metadata?.full_name ?? "").trim();
  const email = user.email ?? "";
  const photos = library ?? [];
  const loadingLibrary = library === null;
  const previewPhoto = photos.find((photo) => photo.id === previewId) ?? null;
  const selectedCount = selectedIds.length;
  const price = computePrice(selectedCount);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-600 text-base font-bold text-white">
              {(name || email).charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {name || "Your account"}
              </p>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ocean-100 bg-ocean-50/70 px-4 py-2.5">
          <p className="text-xs font-medium leading-5 text-ocean-900">
            Photos not sent for print are deleted after {RETENTION_DAYS} days.
            Printed photos stay in your account.
          </p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ocean-700">
            {photos.length} of {MAX_LIBRARY_PHOTOS} saved
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your photos</h2>
            <p className="text-xs text-slate-500">
              Tap a photo for its 3D preview. Tick photos to order them
              together on WhatsApp.
            </p>
          </div>
          <Link
            href="/customize"
            className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
          >
            <UploadIcon className="h-4 w-4" />
            Add photos
          </Link>
        </div>

        {loadingLibrary ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-ocean-200 bg-ocean-50/40 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No photos yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add up to {MAX_LIBRARY_PHOTOS} photos and preview them as magnets.
            </p>
            <Link
              href="/customize"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
            >
              <UploadIcon className="h-4 w-4" />
              Start adding photos
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedIds(photos.map((photo) => photo.id))}
                className="text-ocean-700 transition hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-slate-500 transition hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {photos.map((photo) => {
                const isSelected = selectedIds.includes(photo.id);
                return (
                  <div key={photo.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setPreviewId(photo.id)}
                      aria-label={`Preview ${photo.name} in 3D`}
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 transition hover:shadow-card ${
                        isSelected
                          ? "border-ocean-500 ring-2 ring-ocean-200"
                          : "border-slate-200 hover:border-ocean-300"
                      }`}
                    >
                      <span
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${photo.url}")`,
                          backgroundColor:
                            photo.boardColor === "white"
                              ? "#ffffff"
                              : "#111827",
                        }}
                      />
                      <span className="absolute bottom-1 left-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {photo.printed ? "Printed" : "3D"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSelect(photo)}
                      aria-label={
                        isSelected
                          ? `Remove ${photo.name} from this order`
                          : `Add ${photo.name} to this order`
                      }
                      aria-pressed={isSelected}
                      className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border shadow transition ${
                        isSelected
                          ? "border-ocean-600 bg-ocean-600 text-white"
                          : "border-slate-300 bg-white/95 text-transparent hover:border-ocean-400"
                      }`}
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(photo)}
                      aria-label={`Delete ${photo.name}`}
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow transition hover:bg-red-600"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {photo.boardColor === "white" ? "White" : "Black"} /{" "}
                      {photo.orientation === "portrait"
                        ? "Portrait"
                        : "Landscape"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              {orderResult ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-emerald-700">
                    Order {orderResult.id} ready -{" "}
                    {orderResult.count === 1
                      ? "1 magnet"
                      : `${orderResult.count} magnets`}{" "}
                    {orderResult.method === "share"
                      ? "shared."
                      : "opened in WhatsApp."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={whatsappLink(orderResult.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-ocean-700"
                    >
                      <MessageIcon className="h-3.5 w-3.5" />
                      Open WhatsApp
                    </a>
                    {orderResult.files.length > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadFiles(orderResult.files, orderResult.id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        Download photos
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setOrderResult(null)}
                      className="text-xs font-semibold text-ocean-700 transition hover:underline"
                    >
                      New selection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedCount === 0
                        ? "No photos selected"
                        : `${selectedCount} of ${photos.length} selected`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedCount === 0
                        ? "Tick the photos you want printed."
                        : `Total ${formatINR(price.total)}${
                            price.shipping === 0
                              ? " with free shipping"
                              : ` + ${formatINR(price.shipping)} shipping`
                          }`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOrder}
                    disabled={selectedCount === 0 || ordering}
                    className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <MessageIcon className="h-4 w-4" />
                    {ordering
                      ? "Opening share..."
                      : `Order on WhatsApp${
                          selectedCount > 0
                            ? ` - ${formatINR(price.total)}`
                            : ""
                        }`}
                  </button>
                </div>
              )}
              {error ? (
                <p role="alert" className="mt-3 text-xs font-medium text-red-600">
                  {error}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      {previewPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/95 p-3 sm:p-8">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900">
                  {previewPhoto.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Drag to rotate, like holding it in your hand
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                aria-label="Close 3D preview"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="relative h-[300px] w-full bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100 sm:h-[min(70vh,34rem)]">
              <div className="absolute inset-0">
                <BoardPreview3D
                  photoUrl={previewPhoto.url}
                  boardColor={previewPhoto.boardColor}
                  boardAspect={boardDimensions(previewPhoto.orientation).aspect}
                />
              </div>
              <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-white">
                <RotateIcon className="h-3.5 w-3.5" />
                Drag to see every side
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                {(["portrait", "landscape"] as const).map((orientation) => (
                  <button
                    key={orientation}
                    type="button"
                    onClick={() =>
                      handleOptionsChange(previewPhoto, { orientation })
                    }
                    aria-pressed={previewPhoto.orientation === orientation}
                    className={segmentClasses(
                      previewPhoto.orientation === orientation
                    )}
                  >
                    {orientation === "portrait" ? "Portrait" : "Landscape"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Board
                </span>
                {(["white", "black"] as const).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      handleOptionsChange(previewPhoto, { boardColor: color })
                    }
                    aria-label={`${color} board`}
                    aria-pressed={previewPhoto.boardColor === color}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      previewPhoto.boardColor === color
                        ? "border-ocean-500 ring-2 ring-ocean-200"
                        : "border-slate-200"
                    }`}
                    style={{
                      backgroundColor:
                        color === "white" ? "#ffffff" : "#111827",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-500">
                {boardDimensions(previewPhoto.orientation).widthIn} x{" "}
                {boardDimensions(previewPhoto.orientation).heightIn} inch /{" "}
                {previewPhoto.printed
                  ? "already printed"
                  : `deleted after ${RETENTION_DAYS} days if not printed`}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelect(previewPhoto)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
                >
                  {selectedIds.includes(previewPhoto.id)
                    ? "Remove from order"
                    : "Add to order"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(previewPhoto)}
                  className="text-xs font-semibold text-red-600 transition hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

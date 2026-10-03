"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  ExpandIcon,
  ImageIcon,
  MessageIcon,
  PhoneIcon,
  PlusIcon,
  RotateIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { siteConfig, telLink, whatsappLink } from "@/lib/config";
import {
  boardDimensions,
  defaultOrientation,
  type BoardColor,
  type Orientation,
} from "@/lib/fitting";
import {
  deleteLibraryPhoto,
  fetchLibrary,
  fetchPhotoFile,
  markPhotosPrinted,
  updatePhotoOptions,
  uploadLibraryPhoto,
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
import { PhotoError, preparePhoto } from "@/lib/photo";
import { PRODUCT, computePrice, formatINR } from "@/lib/products";
import { sampleDataUrl } from "@/lib/sampleArt";
import {
  MAX_LIBRARY_PHOTOS,
  MAX_ORDER_PHOTOS,
  RETENTION_DAYS,
} from "@/lib/supabase";

const BoardPreview3D = dynamic(() => import("./BoardPreview3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gradient-to-b from-slate-100 to-ocean-50" />
  ),
});

interface DisplayPhoto {
  key: string;
  url: string;
  name: string;
  orientation: Orientation;
  boardColor: BoardColor;
  sample: boolean;
  libraryId?: string;
}

interface OrderInfo {
  id: string;
  message: string;
  method: OrderMethod;
  count: number;
  files: File[];
}

const sampleVariants = ["beach", "sunset", "night"] as const;

function samplePhotos(): DisplayPhoto[] {
  return sampleVariants.map((variant, index) => ({
    key: `sample-${variant}`,
    url: sampleDataUrl(variant),
    name: `Sample design ${index + 1}`,
    orientation: "landscape",
    boardColor: "white",
    sample: true,
  }));
}

export default function Designer() {
  const { user, loading: authLoading, configured, signInWithGoogle } = useAuth();
  const [library, setLibrary] = useState<LibraryPhoto[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [samplesDismissed, setSamplesDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchLibrary(user).then((items) => {
      if (!active) return;
      setLibrary(items);
      setSelectedIds(
        items
          .filter((photo) => !photo.printed)
          .slice(0, MAX_ORDER_PHOTOS)
          .map((photo) => photo.id)
      );
    });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (order) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [order]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const showSamples =
    !user || (library !== null && library.length === 0 && !samplesDismissed);

  const displayPhotos: DisplayPhoto[] = showSamples
    ? samplePhotos()
    : (library ?? []).map((photo) => ({
        key: photo.id,
        url: photo.url,
        name: photo.name,
        orientation: photo.orientation,
        boardColor: photo.boardColor,
        sample: false,
        libraryId: photo.id,
      }));

  const selectedItems = displayPhotos.filter((photo) =>
    selectedIds.includes(photo.key)
  );
  const count = selectedItems.length;
  const price = computePrice(count);
  const selected =
    displayPhotos.find((photo) => photo.key === selectedKey) ??
    selectedItems[0] ??
    displayPhotos[0] ??
    null;
  const selectedDimensions = selected
    ? boardDimensions(selected.orientation)
    : null;
  const libraryCount = library?.length ?? 0;

  function updateLocalLibrary(id: string, patch: Partial<LibraryPhoto>) {
    setLibrary((current) =>
      (current ?? []).map((item) =>
        item.id === id ? { ...item, ...patch } : item
      )
    );
  }

  function handleOptionsChange(
    photo: DisplayPhoto,
    patch: { orientation?: Orientation; boardColor?: BoardColor }
  ) {
    if (!photo.libraryId) return;
    const nextOrientation = patch.orientation ?? photo.orientation;
    const nextColor = patch.boardColor ?? photo.boardColor;
    updateLocalLibrary(photo.libraryId, {
      orientation: nextOrientation,
      boardColor: nextColor,
    });
    updatePhotoOptions(photo.libraryId, nextOrientation, nextColor);
    log("photo_options_changed", {
      id: photo.libraryId,
      orientation: nextOrientation,
      boardColor: nextColor,
    });
  }

  function toggleSelect(photo: DisplayPhoto) {
    if (!photo.libraryId) return;
    setSelectedIds((current) => {
      if (current.includes(photo.key)) {
        return current.filter((key) => key !== photo.key);
      }
      if (current.length >= MAX_ORDER_PHOTOS) {
        setError(
          `You can order up to ${MAX_ORDER_PHOTOS} magnets at a time. Remove one to add another.`
        );
        return current;
      }
      setError(null);
      return [...current, photo.key];
    });
  }

  async function handleAddFiles(fileList: File[]) {
    if (fileList.length === 0) return;
    if (!configured || !user) {
      setError("Please sign in with Google to add photos.");
      return;
    }
    const remaining = MAX_LIBRARY_PHOTOS - libraryCount;
    if (remaining <= 0) {
      setError(
        `Your library is full (${MAX_LIBRARY_PHOTOS} photos). Delete a few to add more.`
      );
      return;
    }
    const batch = fileList.slice(0, remaining);
    if (fileList.length > remaining) {
      setError(
        `Your library allows ${MAX_LIBRARY_PHOTOS} photos, so we added the first ${remaining}.`
      );
    } else {
      setError(null);
    }
    setBusy(true);
    log("photos_selected", {
      requested: fileList.length,
      accepted: batch.length,
    });

    const uploaded: LibraryPhoto[] = [];
    for (let index = 0; index < batch.length; index++) {
      setProgress(
        batch.length > 1
          ? `Uploading photo ${index + 1} of ${batch.length}...`
          : "Uploading your photo..."
      );
      try {
        const info = await preparePhoto(batch[index]);
        const response = await fetch(info.url);
        const blob = await response.blob();
        const result = await uploadLibraryPhoto(user, {
          name: info.name,
          width: info.width,
          height: info.height,
          sizeBytes: info.sizeBytes,
          orientation: defaultOrientation(info.width / info.height || 1),
          blob,
        });
        if (result.photo) {
          uploaded.push(result.photo);
        } else {
          setError(
            `Could not upload "${info.name}"${
              result.error ? ` - ${result.error}` : ""
            }`
          );
        }
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
    if (uploaded.length > 0) {
      setLibrary((current) => [...uploaded, ...(current ?? [])]);
      setSamplesDismissed(true);
      setSelectedIds((current) =>
        [...current, ...uploaded.map((photo) => photo.id)].slice(
          0,
          MAX_ORDER_PHOTOS
        )
      );
      setSelectedKey(uploaded[0].id);
      log("photos_added", { count: uploaded.length }, "success");
      requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }

  async function handleDelete(photo: DisplayPhoto) {
    if (!photo.libraryId) return;
    const target = (library ?? []).find((item) => item.id === photo.libraryId);
    if (!target) return;
    const deleted = await deleteLibraryPhoto(target);
    if (deleted) {
      setLibrary((current) =>
        (current ?? []).filter((item) => item.id !== photo.libraryId)
      );
      setSelectedIds((current) =>
        current.filter((key) => key !== photo.libraryId)
      );
      if (selectedKey === photo.key) setSelectedKey(null);
    }
  }

  async function handleOrder() {
    if (count === 0) {
      log("order_blocked_no_photos", {}, "warn");
      return;
    }
    setSharing(true);
    const orderId = createOrderId();
    const message = buildOrderMessage(
      orderId,
      selectedItems.map((photo) => ({
        name: photo.name,
        orientation: photo.orientation,
        boardColor: photo.boardColor,
      })),
      price
    );
    const libraryPhotos = (library ?? []).filter((photo) =>
      selectedIds.includes(photo.id)
    );

    markPhotosPrinted(libraryPhotos.map((photo) => photo.id)).catch(() => {
      log("photo_print_flag_failed", {}, "warn");
    });

    const fileResults = await Promise.all(
      libraryPhotos.map((photo) => fetchPhotoFile(photo))
    );
    const files = fileResults.filter((file): file is File => Boolean(file));

    const method = await shareOrderFiles(files, message, orderId);
    log("order_placed", {
      orderId,
      magnets: count,
      total: price.total,
      method,
    });
    setSharing(false);
    setExpanded(false);
    setOrder({ id: orderId, message, method, count, files });
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

  function downloadPhotos() {
    if (!order || order.files.length === 0) return;
    downloadFiles(order.files, order.id);
  }

  function resetAll() {
    setOrder(null);
    setSelectedIds([]);
    setSelectedKey(null);
    setError(null);
    setCopied(false);
    setExpanded(false);
    log("order_restarted");
  }

  if (order) {
    const photoWord = order.count === 1 ? "photo" : `${order.count} photos`;
    const helper =
      order.method === "share"
        ? `Your order summary and ${photoWord} were shared. Pick WhatsApp in the share sheet if you have not finished yet, then share your delivery address in the chat.`
        : order.method === "cancelled"
          ? `The share sheet was closed. Tap "Open WhatsApp", attach your ${photoWord} (or download them first) and share your delivery address in the chat.`
          : `WhatsApp opened with your order summary. Attach your ${photoWord} (or download them first) and share your delivery address in the chat.`;

    return (
      <div ref={topRef} className="scroll-mt-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-card sm:p-8">
          <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            Order {order.id} is ready
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            {helper}
          </p>
          <ol className="mx-auto mt-4 max-w-xs space-y-1 text-left text-xs text-slate-500">
            {selectedItems.map((photo, index) => {
              const dimensions = boardDimensions(photo.orientation);
              return (
                <li key={photo.key} className="truncate">
                  {index + 1}. {photo.name} ({dimensions.widthIn} x{" "}
                  {dimensions.heightIn} inch, {photo.orientation},{" "}
                  {photo.boardColor} board)
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-slate-500">
            These photos are marked as printed and stay in your account.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappLink(order.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
            >
              <MessageIcon className="h-4 w-4" />
              Open WhatsApp
            </a>
            {order.files.length > 0 ? (
              <button
                type="button"
                onClick={downloadPhotos}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-ocean-200 hover:text-ocean-700"
              >
                <DownloadIcon className="h-4 w-4" />
                Download photos
              </button>
            ) : null}
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
              Call
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Need help? Call {siteConfig.callDisplay}.
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

  const libraryLoading = user !== null && library === null;

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
      <div
        ref={previewRef}
        className={
          expanded
            ? "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/95 p-3 sm:p-8"
            : "order-2 scroll-mt-24 lg:order-1 lg:row-span-2"
        }
      >
        <div className={expanded ? "w-full max-w-3xl" : "lg:sticky lg:top-24"}>
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
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
                  {showSamples && !user
                    ? "Sample preview"
                    : `${count} of ${MAX_ORDER_PHOTOS} selected`}
                </span>
                {selected ? (
                  expanded ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(false)}
                      aria-label="Close enlarged preview"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      aria-label="Enlarge preview"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-ocean-200 hover:text-ocean-700"
                    >
                      <ExpandIcon className="h-4 w-4" />
                    </button>
                  )
                ) : null}
              </div>
            </div>

            {selected ? (
              <>
                <div
                  className={
                    expanded
                      ? "relative h-[min(76vh,40rem)] w-full bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100"
                      : "relative h-[280px] w-full bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100 sm:h-auto sm:aspect-square"
                  }
                >
                  <div className="absolute inset-0">
                    <BoardPreview3D
                      photoUrl={selected.url}
                      boardColor={selected.boardColor}
                      boardAspect={selectedDimensions?.aspect ?? 1}
                    />
                  </div>
                  <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-white">
                    <RotateIcon className="h-3.5 w-3.5" />
                    Drag to see every side
                  </span>
                </div>

                {selected.sample ? (
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                    <p className="text-xs text-slate-500">
                      Sample design for preview. Sign in and add your photos to
                      see your own.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                      {(["portrait", "landscape"] as const).map((orientation) => (
                        <button
                          key={orientation}
                          type="button"
                          onClick={() =>
                            handleOptionsChange(selected, { orientation })
                          }
                          aria-pressed={selected.orientation === orientation}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            selected.orientation === orientation
                              ? "bg-white text-ocean-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {orientation === "portrait"
                            ? "Portrait"
                            : "Landscape"}
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
                            handleOptionsChange(selected, { boardColor: color })
                          }
                          aria-label={`${color} board`}
                          aria-pressed={selected.boardColor === color}
                          className={`h-7 w-7 rounded-full border-2 transition ${
                            selected.boardColor === color
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
                )}

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                  <p className="min-w-0 truncate text-xs text-slate-500">
                    {selected.sample ? "Sample design" : selected.name} /{" "}
                    {selectedDimensions?.widthIn} x{" "}
                    {selectedDimensions?.heightIn} inch /{" "}
                    {selected.boardColor} board
                  </p>
                  {!selected.sample ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(selected)}
                      className="shrink-0 text-xs font-semibold text-red-600 transition hover:underline"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="relative h-[280px] w-full bg-gradient-to-b from-slate-100 via-ocean-50 to-slate-100 sm:h-auto sm:aspect-square">
                <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-ocean-400 shadow-sm">
                    <ImageIcon className="h-8 w-8" />
                  </span>
                  <p className="text-sm font-bold text-slate-700">
                    Add your first photo
                  </p>
                  <p className="text-xs leading-5 text-slate-500">
                    It will appear here as a magnet you can rotate
                  </p>
                </div>
              </div>
            )}
          </div>

          {!expanded ? (
            <p className="mt-3 px-2 text-center text-xs text-slate-500">
              Photos are saved in your account. Ones not sent for print are
              deleted after {RETENTION_DAYS} days.
            </p>
          ) : null}
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
              Up to {MAX_LIBRARY_PHOTOS} photos, saved in your account.
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

        {!configured ? (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Accounts are being set up. Please check back shortly.
          </div>
        ) : !user ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-ocean-200 bg-ocean-50/40 px-6 py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ocean-600 shadow-sm">
              <UserIcon className="h-6 w-6" />
            </span>
            <p className="mt-3 text-base font-semibold text-slate-800">
              Sign in with Google to add photos
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Your photos are saved to your account. Photos not sent for print
              are deleted after {RETENTION_DAYS} days.
            </p>
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
            >
              <UserIcon className="h-4 w-4" />
              Continue with Google
            </button>
          </div>
        ) : (
          <>
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
                handleAddFiles(Array.from(event.dataTransfer.files ?? []));
              }}
              className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 text-center transition ${
                libraryCount > 0 ? "py-5" : "py-8"
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
                  : libraryCount > 0
                    ? "Add more photos"
                    : "Tap to choose your photos"}
              </span>
              <span className="text-xs text-slate-500">
                JPG or PNG up to 15 MB each / {libraryCount} of{" "}
                {MAX_LIBRARY_PHOTOS} saved
              </span>
            </label>

            <input
              id="photos-input"
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              disabled={busy || libraryCount >= MAX_LIBRARY_PHOTOS}
              className="sr-only"
              onChange={(event) => {
                handleAddFiles(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
          </>
        )}

        {showSamples && user ? (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium leading-5 text-amber-800">
              These sample designs are for preview only. Add your own photos
              and the samples disappear automatically.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg bg-ocean-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ocean-700"
              >
                Add my photos
              </button>
              <button
                type="button"
                onClick={() => setSamplesDismissed(true)}
                className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                Hide samples
              </button>
            </div>
          </div>
        ) : null}

        {user && libraryLoading ? (
          <div className="mt-6">
            <p className="text-sm font-bold text-slate-800">Your photos</p>
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        ) : null}

        {user && !libraryLoading && (library?.length ?? 0) > 0 ? (
          <div className="mt-6">
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
              Your photos
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {count} of {MAX_ORDER_PHOTOS} selected for this order
              </span>
            </p>
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {(library ?? []).map((photo) => {
                const item = displayPhotos.find((p) => p.key === photo.id);
                if (!item) return null;
                const isSelected = selectedIds.includes(photo.id);
                const isViewed = selected?.key === photo.id;
                return (
                  <div key={photo.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(photo.id)}
                      aria-label={`Preview ${photo.name}`}
                      className={`block aspect-square w-full rounded-xl border-2 bg-cover bg-center transition ${
                        isViewed
                          ? "border-ocean-500 ring-2 ring-ocean-200"
                          : "border-white shadow-sm hover:border-ocean-200"
                      }`}
                      style={{ backgroundImage: `url("${photo.url}")` }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleSelect(item)}
                      aria-label={
                        isSelected
                          ? `Remove ${photo.name} from order`
                          : `Add ${photo.name} to order`
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
                    <span
                      className="absolute bottom-1 left-1 h-3.5 w-3.5 rounded-full border border-white shadow"
                      style={{
                        backgroundColor:
                          photo.boardColor === "white" ? "#ffffff" : "#111827",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${photo.name}`}
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow transition hover:bg-red-600"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                    {photo.printed ? (
                      <span className="mt-1 block text-center text-[10px] font-medium text-emerald-600">
                        Printed
                      </span>
                    ) : null}
                  </div>
                );
              })}
              {libraryCount < MAX_LIBRARY_PHOTOS ? (
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
              Tap the checkmark to add a photo to this order. Our print team
              fine-tunes the crop before printing.
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
            per magnet. Add and select photos above to see your total.
          </div>
        ) : (
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <dt>
                {count} x {PRODUCT.name}, 6 x 8 or 8 x 6 inch
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
          disabled={count === 0 || sharing || !user}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <MessageIcon className="h-5 w-5" />
          {sharing
            ? "Opening share..."
            : count > 0
              ? `Send order on WhatsApp - ${formatINR(price.total)}`
              : "Select a photo to continue"}
        </button>

        {user ? (
          <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs text-slate-500">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Photos sent for print stay in your account. Others are deleted after{" "}
            {RETENTION_DAYS} days.{" "}
            <Link
              href="/account"
              className="font-semibold text-ocean-700 hover:underline"
            >
              View account
            </Link>
          </p>
        ) : (
          <p className="mt-3 text-center text-xs text-slate-500">
            {authLoading
              ? "Checking your account..."
              : "Sign in to place an order."}
          </p>
        )}
      </section>
    </div>
  );
}

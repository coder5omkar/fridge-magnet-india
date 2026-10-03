"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircleIcon,
  CloseIcon,
  LogOutIcon,
  RotateIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { boardDimensions, type BoardColor, type Orientation } from "@/lib/fitting";
import {
  deleteLibraryPhoto,
  fetchLibrary,
  updatePhotoOptions,
  type LibraryPhoto,
} from "@/lib/library";
import { log } from "@/lib/logger";
import { MAX_LIBRARY_PHOTOS, MAX_ORDER_PHOTOS, RETENTION_DAYS } from "@/lib/supabase";

const BoardPreview3D = dynamic(
  () => import("@/components/designer/BoardPreview3D"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-gradient-to-b from-slate-100 to-ocean-50" />
    ),
  }
);

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

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchLibrary(user).then((items) => {
      if (active) setLibrary(items);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-600 text-lg font-bold text-white">
            {(name || email).charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-base font-bold text-slate-900">
              {name || "Your account"}
            </p>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
        >
          <LogOutIcon className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ocean-100 bg-ocean-50/70 px-4 py-3">
        <p className="text-xs font-medium leading-5 text-ocean-900 sm:text-sm">
          Photos you do not send for print are deleted after {RETENTION_DAYS}{" "}
          days. Photos sent for print stay in your account.
        </p>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ocean-700">
          {photos.length} of {MAX_LIBRARY_PHOTOS} saved
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your photos</h2>
            <p className="text-xs text-slate-500">
              Tap any photo to see its 3D preview and choose the look.
            </p>
          </div>
          <Link
            href="/customize"
            className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ocean-700"
          >
            <UploadIcon className="h-4 w-4" />
            Add & order
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
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => (
              <div key={photo.id} className="relative">
                <button
                  type="button"
                  onClick={() => setPreviewId(photo.id)}
                  aria-label={`Preview ${photo.name} in 3D`}
                  className="relative block aspect-square w-full overflow-hidden rounded-xl border border-slate-200 transition hover:border-ocean-300 hover:shadow-card"
                >
                  <span
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${photo.url}")`,
                      backgroundColor:
                        photo.boardColor === "white" ? "#ffffff" : "#111827",
                    }}
                  />
                  {photo.printed ? (
                    <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <CheckCircleIcon className="h-3 w-3" />
                      Printed
                    </span>
                  ) : (
                    <span className="absolute bottom-1 left-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                      3D
                    </span>
                  )}
                </button>
                <p className="mt-1 truncate text-[10px] text-slate-500">
                  {photo.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  aria-label={`Delete ${photo.name}`}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow transition hover:bg-red-600"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
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
                      backgroundColor: color === "white" ? "#ffffff" : "#111827",
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
                  onClick={() => handleDelete(previewPhoto)}
                  className="text-xs font-semibold text-red-600 transition hover:underline"
                >
                  Delete
                </button>
                <Link
                  href="/customize"
                  className="rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-ocean-700"
                >
                  Order up to {MAX_ORDER_PHOTOS} in one go
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

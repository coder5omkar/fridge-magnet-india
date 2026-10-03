"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  LogOutIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import {
  deleteLibraryPhoto,
  fetchLibrary,
  type LibraryPhoto,
} from "@/lib/library";
import { MAX_LIBRARY_PHOTOS, RETENTION_DAYS } from "@/lib/supabase";

export default function AccountView() {
  const { user, loading, configured, signInWithGoogle, signOut } = useAuth();
  const [library, setLibrary] = useState<LibraryPhoto[] | null>(null);

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

  async function handleDelete(photo: LibraryPhoto) {
    const deleted = await deleteLibraryPhoto(photo);
    if (deleted) {
      setLibrary((current) =>
        (current ?? []).filter((item) => item.id !== photo.id)
      );
    }
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
          Save up to {MAX_LIBRARY_PHOTOS} photos, preview them as magnets and
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
          <h2 className="text-base font-bold text-slate-900">Your photos</h2>
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
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => (
              <div key={photo.id} className="relative">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                  <span
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${photo.url}")`,
                      backgroundColor:
                        photo.boardColor === "white" ? "#ffffff" : "#111827",
                    }}
                    role="img"
                    aria-label={photo.name}
                  />
                  {photo.printed ? (
                    <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <CheckCircleIcon className="h-3 w-3" />
                      Printed
                    </span>
                  ) : null}
                </div>
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
    </div>
  );
}

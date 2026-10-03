import type { User } from "@supabase/supabase-js";
import type { BoardColor, Orientation } from "./fitting";
import { log } from "./logger";
import {
  PHOTO_BUCKET,
  RETENTION_DAYS,
  SIGNED_URL_SECONDS,
  supabase,
} from "./supabase";

export interface LibraryPhoto {
  id: string;
  storagePath: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  orientation: Orientation;
  boardColor: BoardColor;
  printed: boolean;
  createdAt: string;
  url: string;
}

interface PhotoRow {
  id: string;
  storage_path: string;
  file_name: string;
  width: number;
  height: number;
  size_bytes: number;
  orientation: string;
  board_color: string;
  printed: boolean;
  created_at: string;
}

const ROW_COLUMNS =
  "id, storage_path, file_name, width, height, size_bytes, orientation, board_color, printed, created_at";

function createPhotoId(): string {
  return crypto.randomUUID();
}

function mapRow(row: PhotoRow, url: string): LibraryPhoto {
  return {
    id: row.id,
    storagePath: row.storage_path,
    name: row.file_name,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    orientation: row.orientation === "portrait" ? "portrait" : "landscape",
    boardColor: row.board_color === "black" ? "black" : "white",
    printed: Boolean(row.printed),
    createdAt: row.created_at,
    url,
  };
}

export async function fetchLibrary(user: User): Promise<LibraryPhoto[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("photos")
    .select(ROW_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    log("library_fetch_failed", { message: error?.message ?? "unknown" }, "warn");
    return [];
  }

  const rows = data as unknown as PhotoRow[];
  const paths = rows.map((row) => row.storage_path);
  const urlByPath = new Map<string, string>();

  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_SECONDS);
    for (const item of signed ?? []) {
      if (item.signedUrl) {
        urlByPath.set(item.path ?? "", item.signedUrl);
      }
    }
  }

  log("library_loaded", { count: rows.length });
  return rows.map((row) => mapRow(row, urlByPath.get(row.storage_path) ?? ""));
}

export interface UploadPhotoResult {
  photo: LibraryPhoto | null;
  error?: string;
}

export async function uploadLibraryPhoto(
  user: User,
  input: {
    name: string;
    width: number;
    height: number;
    sizeBytes: number;
    orientation: Orientation;
    blob: Blob;
  }
): Promise<UploadPhotoResult> {
  if (!supabase) return { photo: null, error: "not configured" };
  const id = createPhotoId();
  const storagePath = `${user.id}/${id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, input.blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    log("photo_upload_failed", { message: uploadError.message }, "error");
    return { photo: null, error: uploadError.message };
  }

  const { data, error } = await supabase
    .from("photos")
    .insert({
      id,
      user_id: user.id,
      storage_path: storagePath,
      file_name: input.name,
      width: input.width,
      height: input.height,
      size_bytes: input.sizeBytes,
      orientation: input.orientation,
      board_color: "white",
    })
    .select(ROW_COLUMNS)
    .single();

  if (error || !data) {
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    log("photo_record_failed", { message: error?.message ?? "unknown" }, "error");
    return { photo: null, error: error?.message ?? "unknown" };
  }

  const { data: signed } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_SECONDS);

  const photo = mapRow(
    data as unknown as PhotoRow,
    signed?.signedUrl ?? ""
  );
  log("photo_uploaded", { id: photo.id, name: photo.name }, "success");
  return { photo };
}

export async function updatePhotoOptions(
  id: string,
  orientation: Orientation,
  boardColor: BoardColor
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("photos")
    .update({ orientation, board_color: boardColor })
    .eq("id", id);
  if (error) {
    log("photo_update_failed", { id, message: error.message }, "warn");
  }
}

export async function deleteLibraryPhoto(photo: LibraryPhoto): Promise<boolean> {
  if (!supabase) return false;
  await supabase.storage.from(PHOTO_BUCKET).remove([photo.storagePath]);
  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) {
    log("photo_delete_failed", { id: photo.id, message: error.message }, "warn");
    return false;
  }
  log("photo_deleted", { id: photo.id }, "success");
  return true;
}

export async function markPhotosPrinted(ids: string[]): Promise<void> {
  if (!supabase || ids.length === 0) return;
  const { error } = await supabase
    .from("photos")
    .update({ printed: true })
    .in("id", ids);
  if (error) {
    log("photo_print_flag_failed", { message: error.message }, "warn");
  }
}

export async function cleanupExpiredPhotos(user: User): Promise<number> {
  if (!supabase) return 0;
  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("photos")
    .select("id, storage_path")
    .eq("user_id", user.id)
    .eq("printed", false)
    .lt("created_at", cutoff);

  if (error || !data || data.length === 0) return 0;

  const paths = data.map((row) => String(row.storage_path));
  const ids = data.map((row) => String(row.id));
  await supabase.storage.from(PHOTO_BUCKET).remove(paths);
  await supabase.from("photos").delete().in("id", ids);
  log("expired_photos_deleted", { count: ids.length }, "success");
  return ids.length;
}

export async function fetchPhotoFile(photo: LibraryPhoto): Promise<File | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photo.storagePath, 120);
  if (error || !data?.signedUrl) return null;
  try {
    const response = await fetch(data.signedUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], photo.name, {
      type: blob.type || "image/jpeg",
    });
  } catch {
    return null;
  }
}

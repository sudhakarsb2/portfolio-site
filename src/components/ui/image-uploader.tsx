"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/kit";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,video/mp4,video/webm,video/quicktime";

/** Images that can safely be downscaled through a canvas. */
const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_RAW_BYTES = 35 * 1024 * 1024;

/**
 * Hosting platforms cap a single request around 4 MB, so anything bigger than
 * this goes through the chunked endpoint in pieces of CHUNK_SIZE characters.
 */
const SINGLE_SHOT_LIMIT = 2_500_000;
const CHUNK_SIZE = 2_500_000;

/** Reads a response that may not be JSON (proxy error pages, size limits…). */
async function readPayload(response: Response): Promise<{ url?: string; mime?: string; id?: number; error?: string }> {
  const text = await response.text();
  try {
    return JSON.parse(text) as { url?: string; mime?: string; id?: number; error?: string };
  } catch {
    if (response.status === 413 || /entity too large/i.test(text)) {
      return { error: "That file is too large to send in one go. Please try again — or compress it." };
    }
    return { error: `Upload failed (${response.status || "network"}). Please try again.` };
  }
}

async function fileToResizedDataUrl(file: File, maxSize: number): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read that image."));
      element.src = objectUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process that image.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readPayload(response);
  return { ok: response.ok, payload };
}

export function ImageUploader({
  onUploaded,
  label = "Upload image",
  maxSize = 1600,
  kind = "image",
}: {
  onUploaded: (url: string, mime?: string) => void;
  label?: string;
  maxSize?: number;
  /** "image" = photos only (resized). "media" = any graphic format, PDF or video. */
  kind?: "image" | "media";
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function uploadChunked(mime: string, base64: string): Promise<{ url?: string; mime?: string; error?: string }> {
    const begin = await postJson("/api/upload/chunked", { action: "begin", mime });
    if (!begin.ok || !begin.payload.id) return { error: begin.payload.error ?? "Upload failed. Please try again." };
    const id = begin.payload.id;

    const total = Math.ceil(base64.length / CHUNK_SIZE);
    for (let index = 0; index < total; index += 1) {
      const chunk = base64.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      const append = await postJson("/api/upload/chunked", { action: "append", id, chunk });
      if (!append.ok) return { error: append.payload.error ?? "Upload failed part-way. Please try again." };
      setProgress(Math.round(((index + 1) / (total + 1)) * 100));
    }

    const finish = await postJson("/api/upload/chunked", { action: "finish", id });
    if (!finish.ok || !finish.payload.url) return { error: finish.payload.error ?? "Upload failed. Please try again." };
    return finish.payload;
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setProgress(null);
    setError("");
    try {
      let dataUrl: string;
      if (RESIZABLE.has(file.type)) {
        dataUrl = await fileToResizedDataUrl(file, maxSize);
      } else {
        if (file.size > MAX_RAW_BYTES) {
          throw new Error("That file is over 35 MB. Please compress it first.");
        }
        dataUrl = await fileToDataUrl(file);
      }

      const comma = dataUrl.indexOf(",");
      const mime = (dataUrl.slice(5, dataUrl.indexOf(";")) || file.type).toLowerCase();
      const base64 = dataUrl.slice(comma + 1);

      let result: { url?: string; mime?: string; error?: string };
      if (base64.length > SINGLE_SHOT_LIMIT) {
        result = await uploadChunked(mime, base64);
      } else {
        const single = await postJson("/api/upload", { dataUrl });
        result = single.ok ? single.payload : { error: single.payload.error ?? "Upload failed. Please try again." };
      }

      if (!result.url) {
        setError(result.error ?? "Upload failed. Please try again.");
        return;
      }
      onUploaded(result.url, result.mime);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={kind === "media" ? MEDIA_ACCEPT : IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon="upload"
        loading={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? (progress === null ? "Uploading…" : `Uploading… ${progress}%`) : label}
      </Button>
      {error ? <p className="mt-2 text-xs text-crimson">{error}</p> : null}
    </div>
  );
}

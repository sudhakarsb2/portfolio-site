"use client";

import { useEffect, useRef, useState } from "react";

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
/** Bump to invalidate every stored render (e.g. after a quality change). */
const STORE_VERSION = "v1";

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: string) => { promise: Promise<PdfDocument> };
};

type PdfDocument = { numPages: number; getPage: (n: number) => Promise<PdfPage> };

type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => {
    promise: Promise<void>;
  };
};

let loader: Promise<PdfJs> | null = null;

/** In-memory cache for this tab session (fastest path). */
const memoryCache = new Map<string, string[]>();

function loadPdfJs(): Promise<PdfJs> {
  if (!loader) {
    loader = new Promise<PdfJs>((resolve, reject) => {
      const existing = (window as unknown as { pdfjsLib?: PdfJs }).pdfjsLib;
      if (existing) {
        existing.GlobalWorkerOptions.workerSrc = WORKER;
        resolve(existing);
        return;
      }
      const script = document.createElement("script");
      script.src = PDFJS;
      script.onload = () => {
        const lib = (window as unknown as { pdfjsLib?: PdfJs }).pdfjsLib;
        if (!lib) return reject(new Error("PDF renderer failed to load."));
        lib.GlobalWorkerOptions.workerSrc = WORKER;
        resolve(lib);
      };
      script.onerror = () => reject(new Error("PDF renderer failed to load."));
      document.head.appendChild(script);
    }).catch((error) => {
      loader = null;
      throw error;
    });
  }
  return loader;
}

/* ── Persistent store: rendered pages survive reloads and new visits ── */

function storeKey(url: string, page: number) {
  return `/__pdf-pages/${STORE_VERSION}${url.split("?")[0]}/${page}`;
}

async function openStore(): Promise<Cache | null> {
  try {
    if (!("caches" in window)) return null;
    return await caches.open(`pdf-pages-${STORE_VERSION}`);
  } catch {
    return null;
  }
}

async function readStored(url: string): Promise<string[] | null> {
  const store = await openStore();
  if (!store) return null;
  const pages: string[] = [];
  for (let n = 1; ; n += 1) {
    const hit = await store.match(storeKey(url, n));
    if (!hit) break;
    const blob = await hit.blob();
    pages.push(URL.createObjectURL(blob));
  }
  return pages.length ? pages : null;
}

async function writeStored(url: string, page: number, blob: Blob) {
  const store = await openStore();
  if (!store) return;
  try {
    await store.put(storeKey(url, page), new Response(blob, { headers: { "Content-Type": "image/jpeg" } }));
  } catch {
    /* storage full — rendering still works, just not persisted */
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
}

function appendPageImage(host: HTMLDivElement, src: string, pageNumber: number) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = `Page ${pageNumber}`;
  image.style.width = "100%";
  image.style.height = "auto";
  image.style.display = "block";
  image.setAttribute("data-protect", "");
  image.setAttribute("loading", "lazy");
  image.setAttribute("decoding", "async");
  if (pageNumber > 1) image.style.borderTop = "1px solid rgba(255,255,255,0.08)";
  host.appendChild(image);
}

/**
 * Behance-style PDF stream with three cache layers:
 *  1. memory (same tab)  2. Cache API (same computer, survives restarts)
 *  3. HTTP cache for the PDF bytes. A progress bar shows pages arriving so
 *  visitors always know more content is on the way.
 */
export function PdfPages({ url, title }: { url: string; title: string }) {
  const container = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"loading" | "rendering" | "ready" | "error">("loading");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    const host = container.current;
    if (!host) return;

    // The Loading state always shows, even on cached repaints, so every
    // visit communicates "content is on the way" the same way.
    setState("loading");
    const MIN_LOADER_MS = 450;
    const shownAt = performance.now();

    const paint = (pages: string[]) => {
      host.innerHTML = "";
      pages.forEach((src, index) => appendPageImage(host, src, index + 1));
      const elapsed = performance.now() - shownAt;
      const wait = Math.max(0, MIN_LOADER_MS - elapsed);
      window.setTimeout(() => {
        if (!cancelled) setState("ready");
      }, wait);
    };

    // Layer 1: memory (instant repaint, brief loader for consistency)
    const inMemory = memoryCache.get(url);
    if (inMemory?.length) {
      paint(inMemory);
      return () => {
        cancelled = true;
      };
    }

    async function run() {
      // Layer 2: persistent store (fast — no PDF download, no rendering)
      const stored = await readStored(url);
      if (cancelled) return;
      if (stored) {
        memoryCache.set(url, stored);
        paint(stored);
        return;
      }

      // Layer 3: full render, persisting every page as it completes
      try {
        const pdfjs = await loadPdfJs();
        const doc = await pdfjs.getDocument(url).promise;
        if (cancelled || !container.current) return;

        const target = container.current;
        target.innerHTML = "";
        setProgress({ done: 0, total: doc.numPages });
        setState("rendering");

        const width = target.clientWidth || target.parentElement?.clientWidth || 800;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const rendered: string[] = [];

        for (let n = 1; n <= doc.numPages; n += 1) {
          if (cancelled) return;
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (!context) continue;
          await page.render({ canvasContext: context, viewport }).promise;

          const blob = await canvasToBlob(canvas);
          const src = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/jpeg", 0.85);
          rendered.push(src);
          if (cancelled) return;
          appendPageImage(target, src, n);
          setProgress({ done: n, total: doc.numPages });
          if (blob) void writeStored(url, n, blob);
        }

        memoryCache.set(url, rendered);
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled && !memoryCache.has(url)) setState("error");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state === "error") {
    return (
      <div className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-[#101012] p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vermilion text-[9px] font-bold uppercase text-white">
          PDF
        </span>
        <p className="text-sm text-white/60">
          The document preview could not load here —{" "}
          <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-4">
            open it directly
          </a>
          .
        </p>
      </div>
    );
  }

  const busy = state === "loading" || state === "rendering";

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101012]" data-protect>
      {state === "loading" ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-xs text-white/40">Loading</p>
          <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-loading-sweep rounded-full bg-vermilion" />
          </div>
        </div>
      ) : null}

      <div
        ref={container}
        aria-label={`${title} — document pages`}
        style={state === "loading" ? { display: "none" } : undefined}
      />

      {state === "rendering" ? (
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-xs text-white/50">Loading</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-vermilion transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {busy ? "Document is loading" : "Document loaded"}
      </span>
    </div>
  );
}

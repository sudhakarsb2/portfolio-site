"use client";

import { useEffect, useRef, useState } from "react";

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: string) => { promise: Promise<PdfDocument> };
};

type PdfDocument = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
};

type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => {
    promise: Promise<void>;
  };
};

let loader: Promise<PdfJs> | null = null;

/** Loads pdf.js once from CDN, shared across all viewers on the page. */
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
        if (!lib) {
          reject(new Error("PDF renderer failed to load."));
          return;
        }
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

/**
 * Renders every page of a PDF as a full-width image — like Behance spreads.
 * Works on phones too, where iframe-embedded PDFs show nothing.
 */
export function PdfPages({ url, title }: { url: string; title: string }) {
  const container = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjs = await loadPdfJs();
        const doc = await pdfjs.getDocument(url).promise;
        if (cancelled || !container.current) return;
        setPageCount(doc.numPages);

        const host = container.current;
        host.innerHTML = "";
        const width = host.clientWidth || 800;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= doc.numPages; n += 1) {
          if (cancelled) return;
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const scale = (width / base.width) * ratio;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.setAttribute("data-protect", "");
          if (n > 1) canvas.style.borderTop = "1px solid rgba(255,255,255,0.08)";

          const context = canvas.getContext("2d");
          if (!context) continue;
          host.appendChild(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
        }

        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    void render();
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

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101012]" data-protect>
      {state === "loading" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-vermilion" />
          <p className="text-xs text-white/40">Loading {title}…</p>
        </div>
      ) : null}
      <div ref={container} aria-label={`${title} — ${pageCount} pages`} />
    </div>
  );
}

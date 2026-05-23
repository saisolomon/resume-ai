"use client";
import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

/**
 * Resume file dropzone.
 *
 * Two visual states:
 *  - empty: dashed border-neutral-800, neutral copy, upload icon
 *  - filled: solid border-neutral-700, filename + "remove" affordance
 *  - dragover: border-white (Design.md spec)
 */
export function ResumeDropzone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (file) {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3"
        aria-label="Resume attached"
      >
        <div className="flex min-w-0 items-center gap-3">
          <FileText
            className="size-4 shrink-0 text-neutral-400"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-white">{file.name}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Remove file"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      role="button"
      tabIndex={0}
      aria-label="Drop a resume file or click to browse"
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-7 text-center transition-colors ${
        dragOver
          ? "border-white bg-neutral-900"
          : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <Upload
        className="size-5 text-neutral-500"
        aria-hidden="true"
      />
      <div className="text-sm text-neutral-300">
        Drop your resume <span className="text-neutral-500">— or click to browse</span>
      </div>
      <div className="text-xs text-neutral-600">PDF or DOCX</div>
    </div>
  );
}

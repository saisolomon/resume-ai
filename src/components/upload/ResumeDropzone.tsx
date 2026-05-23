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
        className="flex items-center justify-between gap-3 rounded-xl border border-[#D2D2D7] bg-white px-4 py-3"
        aria-label="Resume attached"
      >
        <div className="flex min-w-0 items-center gap-3">
          <FileText
            className="size-5 shrink-0 text-[#6E6E73]"
            aria-hidden="true"
          />
          <span className="truncate text-[15px] text-[#1D1D1F]">
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="focus-ring rounded-full p-1 text-[#86868B] transition-colors duration-150 hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
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
      className={`focus-ring flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-4 py-8 text-center transition-colors duration-150 ${
        dragOver
          ? "border-solid border-[#0071E3] bg-[#0071E3]/5"
          : "border-dashed border-[#D2D2D7] bg-white hover:border-[#86868B]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <Upload className="size-6 text-[#86868B]" aria-hidden="true" />
      <div className="text-[15px] text-[#1D1D1F]">
        Drop your resume{" "}
        <span className="text-[#6E6E73]">— or click to browse</span>
      </div>
      <div className="text-[13px] text-[#86868B]">PDF or DOCX</div>
    </div>
  );
}

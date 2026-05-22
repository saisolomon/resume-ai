"use client";
import { useRef } from "react";

export function ResumeDropzone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className="rounded border border-dashed border-neutral-700 bg-neutral-900 px-4 py-6 text-center text-sm text-neutral-400 cursor-pointer hover:border-neutral-500"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? file.name : "Drop resume.pdf or .docx (or click)"}
    </div>
  );
}

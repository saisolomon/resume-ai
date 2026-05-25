"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { InlineField } from "./InlineField";

/**
 * Single sortable bullet row.
 *
 * Layout: drag handle (visible on hover) · bullet glyph · editable text
 * · delete button (visible on hover). The handle is the only drag-
 * activator — clicking the bullet text enters edit mode without
 * starting a drag, which is the conventional split in Notion / Linear.
 */
export function SortableBullet({
  id,
  value,
  onChange,
  onDelete,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/bullet relative flex items-start gap-1 py-0.5 pl-5"
    >
      {/* Drag handle — absolute-positioned so the bullet text aligns
          with non-draggable rows. Visible on row hover. */}
      <button
        type="button"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1 cursor-grab opacity-0 transition-opacity group-hover/bullet:opacity-100 active:cursor-grabbing"
      >
        <GripVertical
          className="size-3.5 text-[#86868B]"
          aria-hidden="true"
        />
      </button>
      <span className="select-none text-[#1D1D1F]" aria-hidden="true">
        •
      </span>
      <div className="min-w-0 flex-1">
        <InlineField
          value={value}
          onCommit={onChange}
          multiline
          ariaLabel="Bullet point"
          placeholder="Empty bullet — click to write"
        />
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete bullet"
        className="opacity-0 transition-opacity group-hover/bullet:opacity-100"
      >
        <Trash2 className="size-3.5 text-[#86868B] hover:text-[#B91C1C]" />
      </button>
    </div>
  );
}

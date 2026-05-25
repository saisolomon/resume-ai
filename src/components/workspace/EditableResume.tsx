"use client";
import { useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { InlineField } from "./InlineField";
import { SortableBullet } from "./SortableBullet";
import type { TemplateSlug } from "@/components/try/ResumePreviewHtml";
import type {
  ResumeData,
  ExperienceSection,
  ExperienceEntry,
  Role,
} from "@/lib/resume/types";

/**
 * Editable resume preview — the interactive twin of ResumePreviewHtml.
 *
 * Every text field is an InlineField (click-to-edit). Bullets within a
 * role are drag-sortable via @dnd-kit. Adding/removing bullets is one
 * click. The visual template comes from the same TEMPLATE_STYLES table
 * the read-only preview uses, so switching templates in the right-side
 * panel gives a faithful preview of what the downloaded resume will
 * look like.
 *
 * State management: this component is fully controlled — `data` comes
 * from the parent (which holds the local copy), and every mutation
 * fires through `onChange` with a freshly-cloned ResumeData. The parent
 * is responsible for debounced persistence via useAutoSave.
 */

const TEMPLATE_STYLES = {
  classic: {
    container: "bg-white text-black font-serif text-[10pt] leading-[1.3] p-9",
    name: "text-[14pt] font-bold text-center mb-1",
    contact: "text-[10pt] text-center text-gray-700",
    section: "text-[11pt] font-bold uppercase mt-2 mb-1",
    rule: "border-t border-black my-1",
  },
  modern: {
    container: "bg-white text-black font-sans text-[10pt] leading-[1.3] p-9",
    name: "text-[16pt] font-bold mb-1 text-blue-700",
    contact: "text-[10pt] text-gray-600",
    section:
      "text-[11pt] font-semibold uppercase tracking-wide text-blue-700 mt-3 mb-1",
    rule: "border-t border-gray-200 my-1",
  },
  creative: {
    container: "bg-white text-black font-sans text-[10pt] leading-[1.3] p-9",
    name: "text-[15pt] font-bold text-purple-700",
    contact: "text-[10pt] text-gray-600",
    section: "text-[11pt] font-semibold uppercase text-purple-700 mt-2 mb-1",
    rule: "border-t border-purple-200 my-1",
  },
  minimal: {
    container: "bg-white text-black font-sans text-[11pt] leading-[1.5] p-14",
    name: "text-[18pt] font-light mb-2",
    contact: "text-[10pt] text-gray-500",
    section:
      "text-[11pt] font-medium uppercase tracking-widest text-gray-600 mt-4 mb-2",
    rule: "border-t border-gray-200 my-2",
  },
} as const;

type Props = {
  data: ResumeData;
  template: TemplateSlug;
  onChange: (next: ResumeData) => void;
};

export function EditableResume({ data, template, onChange }: Props) {
  const s = TEMPLATE_STYLES[template];

  // ── Mutators ─────────────────────────────────────────────────────────
  // Each helper produces a new ResumeData and pipes it through onChange.
  // We deliberately structuredClone rather than do nested spreads — the
  // data shape has three levels of nesting and shallow spread bugs are
  // a major source of "edit doesn't stick" issues in resume editors.

  const update = useCallback(
    (mutate: (draft: ResumeData) => void) => {
      const next = structuredClone(data);
      mutate(next);
      onChange(next);
    },
    [data, onChange],
  );

  // ── Sensors ──────────────────────────────────────────────────────────
  // PointerSensor with a small activation distance so an InlineField
  // click doesn't accidentally start a drag. KeyboardSensor exposes
  // arrow-key reordering for accessibility.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div
      className={`${s.container} mx-auto max-w-[8.5in]`}
      aria-label={`Editable resume preview in ${template} template`}
    >
      {/* ── Header ── */}
      <div className={s.name}>
        <InlineField
          value={data.name}
          onCommit={(v) =>
            update((d) => {
              d.name = v;
            })
          }
          ariaLabel="Full name"
          placeholder="Your name"
        />
      </div>
      <div className={s.contact}>
        <InlineField
          value={data.contactLine1}
          onCommit={(v) =>
            update((d) => {
              d.contactLine1 = v;
            })
          }
          ariaLabel="Contact line 1 (email, links)"
          placeholder="email · github · linkedin"
        />
      </div>
      <div className={s.contact}>
        <InlineField
          value={data.contactLine2 ?? ""}
          onCommit={(v) =>
            update((d) => {
              d.contactLine2 = v || undefined;
            })
          }
          ariaLabel="Contact line 2 (location)"
          placeholder="City, State"
        />
      </div>
      <div className={s.rule} />

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <>
          <div className={s.section}>Education</div>
          <div className={s.rule} />
          {data.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between gap-2">
                <span className="flex-1">
                  <b>
                    <InlineField
                      value={e.institution}
                      onCommit={(v) =>
                        update((d) => {
                          d.education[i].institution = v;
                        })
                      }
                      ariaLabel="Institution"
                      placeholder="Institution"
                    />
                  </b>
                  , {" "}
                  <InlineField
                    value={e.location}
                    onCommit={(v) =>
                      update((d) => {
                        d.education[i].location = v;
                      })
                    }
                    ariaLabel="Education location"
                    placeholder="Location"
                  />
                </span>
                <span className="shrink-0">
                  <InlineField
                    value={e.date}
                    onCommit={(v) =>
                      update((d) => {
                        d.education[i].date = v;
                      })
                    }
                    ariaLabel="Education date"
                    placeholder="Date"
                  />
                </span>
              </div>
              <div className="italic">
                <InlineField
                  value={
                    e.gpa ? `${e.degree}; GPA: ${e.gpa}` : e.degree
                  }
                  onCommit={(v) =>
                    update((d) => {
                      // Heuristic split: if input contains "GPA:", lift
                      // the gpa back out; otherwise drop gpa.
                      const m = v.match(/^(.+?);\s*GPA:\s*(.+)$/i);
                      if (m) {
                        d.education[i].degree = m[1].trim();
                        d.education[i].gpa = m[2].trim();
                      } else {
                        d.education[i].degree = v;
                        d.education[i].gpa = undefined;
                      }
                    })
                  }
                  ariaLabel="Degree (use 'Degree; GPA: 3.8' for GPA)"
                  placeholder="Degree"
                />
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Experience sections ── */}
      {data.experienceSections.map((sec, si) => (
        <ExperienceSectionEditor
          key={si}
          section={sec}
          styleSection={s.section}
          styleRule={s.rule}
          onSectionChange={(next) =>
            update((d) => {
              d.experienceSections[si] = next;
            })
          }
          sensors={sensors}
          onDragEnd={(roleIdx, entryIdx, event) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            update((d) => {
              const role =
                d.experienceSections[si].entries[entryIdx].roles[roleIdx];
              const oldIdx = role.bullets.findIndex(
                (_, i) => bulletId(si, entryIdx, roleIdx, i) === active.id,
              );
              const newIdx = role.bullets.findIndex(
                (_, i) => bulletId(si, entryIdx, roleIdx, i) === over.id,
              );
              if (oldIdx < 0 || newIdx < 0) return;
              role.bullets = arrayMove(role.bullets, oldIdx, newIdx);
            });
          }}
          bulletKey={(entryIdx, roleIdx, bulletIdx) =>
            bulletId(si, entryIdx, roleIdx, bulletIdx)
          }
          onBulletChange={(entryIdx, roleIdx, bulletIdx, value) =>
            update((d) => {
              d.experienceSections[si].entries[entryIdx].roles[
                roleIdx
              ].bullets[bulletIdx] = value;
            })
          }
          onBulletDelete={(entryIdx, roleIdx, bulletIdx) =>
            update((d) => {
              d.experienceSections[si].entries[entryIdx].roles[
                roleIdx
              ].bullets.splice(bulletIdx, 1);
            })
          }
          onBulletAdd={(entryIdx, roleIdx) =>
            update((d) => {
              d.experienceSections[si].entries[entryIdx].roles[
                roleIdx
              ].bullets.push("");
            })
          }
          onRoleFieldChange={(entryIdx, roleIdx, field, value) =>
            update((d) => {
              (d.experienceSections[si].entries[entryIdx].roles[roleIdx] as Role)[
                field
              ] = value;
            })
          }
          onEntryFieldChange={(entryIdx, field, value) =>
            update((d) => {
              (d.experienceSections[si].entries[entryIdx] as ExperienceEntry)[
                field
              ] = value;
            })
          }
        />
      ))}

      {/* ── Additional ── */}
      {data.additionalInfo.length > 0 && (
        <>
          <div className={s.section}>Additional Information</div>
          <div className={s.rule} />
          {data.additionalInfo.map((line, i) => (
            <div key={i} className="ml-4 flex items-start gap-1">
              <span aria-hidden="true">•</span>
              <div className="min-w-0 flex-1">
                <InlineField
                  value={line}
                  onCommit={(v) =>
                    update((d) => {
                      d.additionalInfo[i] = v;
                    })
                  }
                  multiline
                  ariaLabel="Additional information line"
                  placeholder="Empty line"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update((d) => {
                d.additionalInfo.push("");
              })
            }
            className="mt-1 inline-flex items-center gap-1 text-[10pt] text-gray-500 hover:text-gray-800"
          >
            <Plus className="size-3" aria-hidden="true" />
            Add line
          </button>
        </>
      )}
    </div>
  );
}

// Stable composite ID for sortable bullets — DnD-kit needs string IDs.
function bulletId(
  sectionIdx: number,
  entryIdx: number,
  roleIdx: number,
  bulletIdx: number,
) {
  return `s${sectionIdx}-e${entryIdx}-r${roleIdx}-b${bulletIdx}`;
}

// ─── ExperienceSectionEditor — keeps the section-level DnD scope tight ───

type SectionEditorProps = {
  section: ExperienceSection;
  styleSection: string;
  styleRule: string;
  onSectionChange: (next: ExperienceSection) => void;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (
    roleIdx: number,
    entryIdx: number,
    event: DragEndEvent,
  ) => void;
  bulletKey: (
    entryIdx: number,
    roleIdx: number,
    bulletIdx: number,
  ) => string;
  onBulletChange: (
    entryIdx: number,
    roleIdx: number,
    bulletIdx: number,
    value: string,
  ) => void;
  onBulletDelete: (entryIdx: number, roleIdx: number, bulletIdx: number) => void;
  onBulletAdd: (entryIdx: number, roleIdx: number) => void;
  onRoleFieldChange: (
    entryIdx: number,
    roleIdx: number,
    field: "title" | "date",
    value: string,
  ) => void;
  onEntryFieldChange: (
    entryIdx: number,
    field: "company" | "location",
    value: string,
  ) => void;
};

function ExperienceSectionEditor({
  section,
  styleSection,
  styleRule,
  onSectionChange,
  sensors,
  onDragEnd,
  bulletKey,
  onBulletChange,
  onBulletDelete,
  onBulletAdd,
  onRoleFieldChange,
  onEntryFieldChange,
}: SectionEditorProps) {
  return (
    <div>
      <div className={styleSection}>
        <InlineField
          value={section.heading}
          onCommit={(v) =>
            onSectionChange({ ...section, heading: v })
          }
          ariaLabel="Section heading"
          placeholder="Section"
        />
      </div>
      <div className={styleRule} />
      {section.entries.map((entry, ei) => (
        <div key={ei} className="mb-2">
          {entry.roles.map((role, ri) => (
            <div key={ri}>
              <div className="flex justify-between gap-2">
                <span className="flex-1">
                  <b>
                    <InlineField
                      value={entry.company}
                      onCommit={(v) => onEntryFieldChange(ei, "company", v)}
                      ariaLabel="Company"
                      placeholder="Company"
                    />
                  </b>
                  , {" "}
                  <InlineField
                    value={entry.location}
                    onCommit={(v) => onEntryFieldChange(ei, "location", v)}
                    ariaLabel="Company location"
                    placeholder="Location"
                  />
                </span>
                <span className="shrink-0">
                  <InlineField
                    value={role.date}
                    onCommit={(v) => onRoleFieldChange(ei, ri, "date", v)}
                    ariaLabel="Role date"
                    placeholder="Date"
                  />
                </span>
              </div>
              <div className="italic">
                <InlineField
                  value={role.title}
                  onCommit={(v) => onRoleFieldChange(ei, ri, "title", v)}
                  ariaLabel="Role title"
                  placeholder="Role title"
                />
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEnd(ri, ei, event)}
              >
                <SortableContext
                  items={role.bullets.map((_, bi) => bulletKey(ei, ri, bi))}
                  strategy={verticalListSortingStrategy}
                >
                  {role.bullets.map((bullet, bi) => (
                    <SortableBullet
                      key={bulletKey(ei, ri, bi)}
                      id={bulletKey(ei, ri, bi)}
                      value={bullet}
                      onChange={(v) => onBulletChange(ei, ri, bi, v)}
                      onDelete={() => onBulletDelete(ei, ri, bi)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <button
                type="button"
                onClick={() => onBulletAdd(ei, ri)}
                className="ml-5 mt-1 inline-flex items-center gap-1 text-[10pt] text-gray-500 hover:text-gray-800"
              >
                <Plus className="size-3" aria-hidden="true" />
                Add bullet
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

import type { ResumeData } from "@/lib/resume/types";

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
    section: "text-[11pt] font-semibold uppercase tracking-wide text-blue-700 mt-3 mb-1",
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
    section: "text-[11pt] font-medium uppercase tracking-widest text-gray-600 mt-4 mb-2",
    rule: "border-t border-gray-200 my-2",
  },
} as const;

export type TemplateSlug = keyof typeof TEMPLATE_STYLES;

export function ResumePreviewHtml({
  data,
  template,
  className,
}: {
  data: ResumeData;
  template: TemplateSlug;
  className?: string;
}) {
  const s = TEMPLATE_STYLES[template];
  return (
    <div className={`${s.container} ${className ?? ""}`} aria-label={`Resume in ${template} template`}>
      <div className={s.name}>{data.name}</div>
      <div className={s.contact}>{data.contactLine1}</div>
      {data.contactLine2 && <div className={s.contact}>{data.contactLine2}</div>}
      <div className={s.rule} />

      {data.education.length > 0 && (
        <>
          <div className={s.section}>Education</div>
          <div className={s.rule} />
          {data.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span>
                  <b>{e.institution}</b>, {e.location}
                </span>
                <span>{e.date}</span>
              </div>
              <div className="italic">{e.gpa ? `${e.degree}; GPA: ${e.gpa}` : e.degree}</div>
              {e.details?.map((d, j) => (
                <div key={j} className="ml-4">• {d}</div>
              ))}
            </div>
          ))}
        </>
      )}

      {data.experienceSections.map((sec, si) => (
        <div key={si}>
          <div className={s.section}>{sec.heading}</div>
          <div className={s.rule} />
          {sec.entries.map((entry, ei) => (
            <div key={ei} className="mb-2">
              {entry.roles.map((role, ri) => (
                <div key={ri}>
                  {ri === 0 && (
                    <div className="flex justify-between">
                      <span>
                        <b>{entry.company}</b>
                        {entry.companyNote && ` (${entry.companyNote})`}, {entry.location}
                      </span>
                      <span>{role.date}</span>
                    </div>
                  )}
                  <div className="italic">{role.title}{ri > 0 ? `  ${role.date}` : ""}</div>
                  {role.bullets.map((b, bi) => (
                    <div key={bi} className="ml-4">• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {data.additionalInfo.length > 0 && (
        <>
          <div className={s.section}>Additional</div>
          <div className={s.rule} />
          {data.additionalInfo.map((item, i) => (
            <div key={i} className="ml-4">• {item}</div>
          ))}
        </>
      )}
    </div>
  );
}

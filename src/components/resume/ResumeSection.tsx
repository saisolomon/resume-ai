"use client";

import { Separator } from "@/components/ui/separator";
import { ResumeBullet } from "./ResumeBullet";
import type {
  Education,
  ExperienceSection,
  ExperienceEntry,
  Role,
} from "@/lib/resume/types";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[0.55em] mb-[0.2em]">
      <h2
        className="font-bold uppercase tracking-[0.04em]"
        style={{ fontSize: "0.92rem" }}
      >
        {children}
      </h2>
      <Separator className="mt-[0.15em] bg-black" />
    </div>
  );
}

function DateCell({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="shrink-0 text-right"
      style={{ fontSize: "0.83rem", width: "17%" }}
    >
      {children}
    </span>
  );
}

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (education.length === 0) return null;

  return (
    <section>
      <SectionHeading>Education</SectionHeading>
      {education.map((edu, i) => (
        <div key={i} className="mb-[0.25em]">
          <div className="flex justify-between">
            <span
              className="font-bold"
              style={{ fontSize: "0.83rem", width: "83%" }}
            >
              {edu.institution}
            </span>
            <DateCell>{edu.location}</DateCell>
          </div>
          <div className="flex justify-between">
            <span
              className="italic"
              style={{ fontSize: "0.83rem", width: "83%" }}
            >
              {edu.degree}
              {edu.gpa ? `; GPA: ${edu.gpa}` : ""}
            </span>
            <DateCell>{edu.date}</DateCell>
          </div>
          {edu.details && edu.details.length > 0 && (
            <ul className="mt-[0.1em] list-none">
              {edu.details.map((d, j) => (
                <ResumeBullet key={j} text={d} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <div className="mb-[0.15em]">
      <div className="flex justify-between">
        <span
          className="italic"
          style={{ fontSize: "0.83rem", width: "83%" }}
        >
          {role.title}
        </span>
        <DateCell>{role.date}</DateCell>
      </div>
      {role.bullets.length > 0 && (
        <ul className="mt-[0.05em] list-none">
          {role.bullets.map((b, i) => (
            <ResumeBullet key={i} text={b} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EntryBlock({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="mb-[0.25em]">
      <div className="flex justify-between">
        <span
          className="font-bold"
          style={{ fontSize: "0.83rem", width: "83%" }}
        >
          {entry.company}
          {entry.companyNote ? (
            <span className="font-normal"> — {entry.companyNote}</span>
          ) : null}
        </span>
        <DateCell>{entry.location}</DateCell>
      </div>
      {entry.roles.map((role, i) => (
        <RoleBlock key={i} role={role} />
      ))}
    </div>
  );
}

interface ExperienceSectionBlockProps {
  section: ExperienceSection;
}

export function ExperienceSectionBlock({
  section,
}: ExperienceSectionBlockProps) {
  if (section.entries.length === 0) return null;

  return (
    <section>
      <SectionHeading>{section.heading}</SectionHeading>
      {section.entries.map((entry, i) => (
        <EntryBlock key={i} entry={entry} />
      ))}
    </section>
  );
}

interface AdditionalInfoSectionProps {
  items: string[];
}

export function AdditionalInfoSection({ items }: AdditionalInfoSectionProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeading>Additional Information</SectionHeading>
      <ul className="list-none">
        {items.map((item, i) => (
          <ResumeBullet key={i} text={item} />
        ))}
      </ul>
    </section>
  );
}

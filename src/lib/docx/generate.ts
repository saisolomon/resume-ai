import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";

import type {
  ResumeData,
  Education,
  ExperienceSection,
  ExperienceEntry,
} from "@/lib/resume/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT = "Times New Roman";
const SIZE_NAME = 28; // half-points (14pt)
const SIZE_CONTACT = 20; // half-points (10pt)
const SIZE_SECTION = 22; // half-points (11pt)
const SIZE_BODY = 20; // half-points (10pt)

const MARGIN = convertInchesToTwip(0.5); // 720 twips

// US Letter dimensions in twips
const PAGE_WIDTH = convertInchesToTwip(8.5); // 12240
const PAGE_HEIGHT = convertInchesToTwip(11); // 15840

// Usable width inside margins
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN; // 10800 twips

// Right-align tab stop at the far-right of the content area
const RIGHT_TAB = CONTENT_WIDTH;

const BULLET_REFERENCE = "resume-bullets";

const THIN_BORDER = { style: BorderStyle.SINGLE, size: 1, color: "000000", space: 1 } as const;

// ---------------------------------------------------------------------------
// Helper: shared run properties
// ---------------------------------------------------------------------------

type RunProps = Omit<IRunOptions, "children" | "text" | "break">;

function font(size: number, opts?: RunProps): RunProps {
  return { font: FONT, size, ...opts };
}

// ---------------------------------------------------------------------------
// Helper: thin horizontal rule (paragraph with bottom border)
// ---------------------------------------------------------------------------

function horizontalRule(): Paragraph {
  return new Paragraph({
    border: {
      bottom: THIN_BORDER,
    },
    spacing: { after: 40, before: 0 },
  });
}

// ---------------------------------------------------------------------------
// Helper: two-column row using tab stops (content left, date right)
// ---------------------------------------------------------------------------

function twoColumnLine(
  leftRuns: TextRun[],
  rightText: string,
  opts?: Partial<IParagraphOptions>,
): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    spacing: { after: 0, before: 0 },
    ...opts,
    children: [
      ...leftRuns,
      new TextRun({ ...font(SIZE_BODY), children: ["\t", rightText] }),
    ],
  });
}

// ---------------------------------------------------------------------------
// Helper: section heading (ALL CAPS, bold, 11pt) with rule below
// ---------------------------------------------------------------------------

function sectionHeading(title: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 160, after: 0 },
      children: [
        new TextRun({ ...font(SIZE_SECTION, { bold: true, allCaps: true }), text: title }),
      ],
    }),
    horizontalRule(),
  ];
}

// ---------------------------------------------------------------------------
// Helper: bullet paragraph
// ---------------------------------------------------------------------------

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: BULLET_REFERENCE, level: 0 },
    spacing: { after: 0, before: 0 },
    children: [new TextRun({ ...font(SIZE_BODY), text })],
  });
}

// ---------------------------------------------------------------------------
// Build: Education entries
// ---------------------------------------------------------------------------

function buildEducation(entries: Education[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const edu of entries) {
    // Institution (bold) + Location ... Date (right-aligned)
    paragraphs.push(
      twoColumnLine(
        [
          new TextRun({ ...font(SIZE_BODY, { bold: true }), text: edu.institution }),
          new TextRun({ ...font(SIZE_BODY), text: `, ${edu.location}` }),
        ],
        edu.date,
        { spacing: { before: 40, after: 0 } },
      ),
    );

    // Degree line (+ optional GPA)
    const degreeText = edu.gpa ? `${edu.degree}; GPA: ${edu.gpa}` : edu.degree;
    paragraphs.push(
      new Paragraph({
        spacing: { after: 0, before: 0 },
        children: [new TextRun({ ...font(SIZE_BODY, { italics: true }), text: degreeText })],
      }),
    );

    // Optional detail bullets
    if (edu.details) {
      for (const detail of edu.details) {
        paragraphs.push(bulletParagraph(detail));
      }
    }
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Build: Experience entries
// ---------------------------------------------------------------------------

function buildExperienceEntry(entry: ExperienceEntry): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (let roleIdx = 0; roleIdx < entry.roles.length; roleIdx++) {
    const role = entry.roles[roleIdx];

    if (roleIdx === 0) {
      // First role: Company (bold) + optional note + Location ... Date
      const companyRuns: TextRun[] = [
        new TextRun({ ...font(SIZE_BODY, { bold: true }), text: entry.company }),
      ];
      if (entry.companyNote) {
        companyRuns.push(
          new TextRun({ ...font(SIZE_BODY), text: ` (${entry.companyNote})` }),
        );
      }
      companyRuns.push(
        new TextRun({ ...font(SIZE_BODY), text: `, ${entry.location}` }),
      );

      paragraphs.push(
        twoColumnLine(companyRuns, role.date, {
          spacing: { before: 40, after: 0 },
        }),
      );
    } else {
      // Subsequent roles under the same company: just role title + date
      paragraphs.push(
        twoColumnLine(
          [new TextRun({ ...font(SIZE_BODY, { italics: true }), text: role.title })],
          role.date,
          { spacing: { before: 20, after: 0 } },
        ),
      );
    }

    // Role title (italic) on its own line for the first role
    if (roleIdx === 0) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 0, before: 0 },
          children: [
            new TextRun({ ...font(SIZE_BODY, { italics: true }), text: role.title }),
          ],
        }),
      );
    }

    // Bullets
    for (const bullet of role.bullets) {
      paragraphs.push(bulletParagraph(bullet));
    }
  }

  return paragraphs;
}

function buildExperienceSection(section: ExperienceSection): Paragraph[] {
  const paragraphs: Paragraph[] = [...sectionHeading(section.heading)];

  for (const entry of section.entries) {
    paragraphs.push(...buildExperienceEntry(entry));
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Build: Additional section
// ---------------------------------------------------------------------------

function buildAdditional(items: string[]): Paragraph[] {
  if (items.length === 0) return [];

  const paragraphs: Paragraph[] = [...sectionHeading("Additional")];

  for (const item of items) {
    paragraphs.push(bulletParagraph(item));
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Main: generate the Document and pack to Buffer
// ---------------------------------------------------------------------------

export async function generateResume(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // --- Name ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, before: 0 },
      children: [
        new TextRun({ ...font(SIZE_NAME, { bold: true }), text: data.name }),
      ],
    }),
  );

  // --- Contact line 1 ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, before: 0 },
      children: [
        new TextRun({ ...font(SIZE_CONTACT), text: data.contactLine1 }),
      ],
    }),
  );

  // --- Contact line 2 (optional) ---
  if (data.contactLine2) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0, before: 0 },
        children: [
          new TextRun({ ...font(SIZE_CONTACT), text: data.contactLine2 }),
        ],
      }),
    );
  }

  // --- Divider after contact info ---
  children.push(horizontalRule());

  // --- Education ---
  if (data.education.length > 0) {
    children.push(...sectionHeading("Education"));
    children.push(...buildEducation(data.education));
  }

  // --- Experience sections ---
  for (const section of data.experienceSections) {
    children.push(...buildExperienceSection(section));
  }

  // --- Additional ---
  children.push(...buildAdditional(data.additionalInfo));

  // --- Build Document ---
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: SIZE_BODY,
          },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: BULLET_REFERENCE,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.25),
                    hanging: convertInchesToTwip(0.15),
                  },
                },
                run: {
                  font: FONT,
                  size: SIZE_BODY,
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
            },
            margin: {
              top: MARGIN,
              right: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
              header: 0,
              footer: 0,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}

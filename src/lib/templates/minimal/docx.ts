import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
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

const FONT = "Helvetica Neue";
const FONT_FALLBACK = "Arial";
const SIZE_NAME = 30; // half-points (15pt)
const SIZE_CONTACT = 20; // half-points (10pt)
const SIZE_SECTION = 22; // half-points (11pt)
const SIZE_BODY = 20; // half-points (10pt)

const MARGIN = convertInchesToTwip(0.6); // slightly wider margins

// US Letter dimensions in twips
const PAGE_WIDTH = convertInchesToTwip(8.5);
const PAGE_HEIGHT = convertInchesToTwip(11);

// Usable width inside margins
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Right-align tab stop at the far-right of the content area
const RIGHT_TAB = CONTENT_WIDTH;

const BULLET_REFERENCE = "minimal-bullets";

// ---------------------------------------------------------------------------
// Helper: add spaces between letters for a letter-spacing effect
// ---------------------------------------------------------------------------

function spaced(text: string): string {
  return text.toUpperCase().split("").join(" ");
}

// ---------------------------------------------------------------------------
// Helper: shared run properties
// ---------------------------------------------------------------------------

type RunProps = Omit<IRunOptions, "children" | "text" | "break">;

function font(size: number, opts?: RunProps): RunProps {
  return { font: FONT, size, ...opts };
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
// Helper: section heading — uppercase with letter spacing, no underline,
// no horizontal rule
// ---------------------------------------------------------------------------

function sectionHeading(title: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 240, after: 60 },
      children: [
        new TextRun({
          ...font(SIZE_SECTION),
          text: spaced(title),
          color: "555555",
        }),
      ],
    }),
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

    const degreeText = edu.gpa ? `${edu.degree}; GPA: ${edu.gpa}` : edu.degree;
    paragraphs.push(
      new Paragraph({
        spacing: { after: 0, before: 0 },
        children: [new TextRun({ ...font(SIZE_BODY, { italics: true }), text: degreeText })],
      }),
    );

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
      paragraphs.push(
        twoColumnLine(
          [new TextRun({ ...font(SIZE_BODY, { italics: true }), text: role.title })],
          role.date,
          { spacing: { before: 20, after: 0 } },
        ),
      );
    }

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

  // --- Name (not bold, clean look) ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, before: 0 },
      children: [
        new TextRun({ ...font(SIZE_NAME), text: data.name }),
      ],
    }),
  );

  // --- Contact line 1 ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, before: 0 },
      children: [
        new TextRun({ ...font(SIZE_CONTACT, { color: "666666" }), text: data.contactLine1 }),
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
          new TextRun({ ...font(SIZE_CONTACT, { color: "666666" }), text: data.contactLine2 }),
        ],
      }),
    );
  }

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
              text: "\u2013", // en-dash for minimal look
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.25),
                    hanging: convertInchesToTwip(0.15),
                  },
                },
                run: {
                  font: FONT_FALLBACK,
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

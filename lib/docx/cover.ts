import {
  Paragraph,
  TextRun,
  AlignmentType,
  Footer,
  PageNumber,
} from "docx";

export function buildCoverPage(
  projectName: string,
  organization: string
): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000 },
      children: [
        new TextRun({
          text: projectName,
          size: 40,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: "Privacy Impact Assessment (PIA)",
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
      children: [
        new TextRun({
          text: organization,
          italics: true,
        }),
      ],
    }),
  ];
}

export function buildFooter(projectName: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun(projectName),
          new TextRun(" | Page "),
          new TextRun({ children: [PageNumber.CURRENT],
            }),
        ],
      }),
    ],
  });
}

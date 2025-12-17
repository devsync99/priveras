import { Paragraph, HeadingLevel } from "docx";

export function appendixTitle(index: number, title: string): Paragraph {
  return new Paragraph({
    text: `Appendix ${String.fromCharCode(64 + index)}: ${title}`,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

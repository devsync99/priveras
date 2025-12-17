import {
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { DocxBlock, TextSegment } from "./parseContent";

/**
 * Convert text segments (with bold, italic, code) to TextRun objects
 */
function segmentsToTextRuns(
  segments: TextSegment[],
  forceItalic = false
): TextRun[] {
  return segments.map((seg) => {
    const run = new TextRun({
      text: seg.text,
      font: seg.code ? "Courier New" : "Calibri",
      size: seg.code ? 20 : 22,
      bold: seg.bold,
      italics: seg.italic || forceItalic,
      color: seg.code ? "2563EB" : seg.color,
      shading: seg.code
        ? {
            fill: "F3F4F6",
            type: "solid",
          }
        : undefined,
    });
    return run;
  });
}

export function buildDocxBlocks(blocks: DocxBlock[]): Paragraph[] {
  const result: Paragraph[] = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case "heading":
        result.push(
          new Paragraph({
            children: segmentsToTextRuns(block.segments),
            heading:
              block.level === 1
                ? HeadingLevel.HEADING_1
                : block.level === 2
                ? HeadingLevel.HEADING_2
                : HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 },
          })
        );
        break;

      case "paragraph":
        result.push(
          new Paragraph({
            children: segmentsToTextRuns(block.segments),
            spacing: { after: 160 },
          })
        );
        break;

      case "bullet":
        block.items.forEach((itemSegments, index) => {
          result.push(
            new Paragraph({
              children: segmentsToTextRuns(itemSegments),
              bullet: { level: 0 },
              spacing: { after: index === block.items.length - 1 ? 160 : 80 },
            })
          );
        });
        break;

      case "numbered":
        block.items.forEach((itemSegments, index) => {
          result.push(
            new Paragraph({
              children: segmentsToTextRuns(itemSegments),
              numbering: {
                reference: "numbered-list",
                level: 0,
              },
              spacing: { after: index === block.items.length - 1 ? 160 : 80 },
            })
          );
        });
        break;

      case "blockquote":
        result.push(
          new Paragraph({
            children: segmentsToTextRuns(block.segments, true),
            spacing: { after: 160, before: 80 },
            indent: { left: 720 }, // 0.5 inch
            border: {
              left: {
                color: "6366F1",
                size: 24,
                style: BorderStyle.SINGLE,
              },
            },
            shading: {
              fill: "EEF2FF",
              type: "solid",
            },
          })
        );
        break;

      case "code-block":
        result.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.text,
                font: "Courier New",
                size: 20,
              }),
            ],
            spacing: { after: 160, before: 80 },
            shading: {
              fill: "1F2937",
              type: "solid",
            },
          })
        );
        break;

      case "divider":
        result.push(
          new Paragraph({
            children: [],
            border: {
              bottom: {
                color: "D1D5DB",
                size: 6,
                style: BorderStyle.SINGLE,
              },
            },
            spacing: { after: 160, before: 160 },
          })
        );
        break;

      default:
        result.push(new Paragraph(""));
    }
  });

  return result;
}

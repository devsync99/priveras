import {
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";
import { DocxBlock, TextSegment } from "./parseContent";

/**
 * Convert text segments to TextRun objects with proper formatting
 */
function segmentsToTextRuns(segments: TextSegment[]): TextRun[] {
  return segments.map((seg) => {
    return new TextRun({
      text: seg.text,
      font: seg.code ? "Courier New" : "Calibri",
      size: seg.code ? 20 : 22,
      bold: seg.bold,
      italics: seg.italic,
      color: seg.code ? "2563EB" : undefined,
      shading: seg.code
        ? {
            fill: "F3F4F6",
            type: ShadingType.SOLID,
          }
        : undefined,
    });
  });
}

/**
 * Build DOCX elements from parsed content blocks
 */
export function buildDocxBlocks(blocks: DocxBlock[]): any[] {
  const children: any[] = [];

  blocks.forEach((block) => {
    // Headings with proper formatting
    if (block.type === "heading") {
      const headingLevels: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };

      children.push(
        new Paragraph({
          children: segmentsToTextRuns(block.segments),
          heading: headingLevels[block.level] || HeadingLevel.HEADING_2,
          spacing: {
            before: 240,
            after: 120,
          },
        })
      );
    }

    // Paragraphs with inline formatting
    else if (block.type === "paragraph") {
      children.push(
        new Paragraph({
          children: segmentsToTextRuns(block.segments),
          spacing: {
            after: 120,
          },
        })
      );
    }

    // Lists (bullet and numbered)
    else if (block.type === "list") {
      block.items.forEach((itemSegments, index) => {
        children.push(
          new Paragraph({
            children: segmentsToTextRuns(itemSegments),
            bullet: block.ordered
              ? { level: 0 }
              : { level: 0 },
            numbering: block.ordered
              ? { reference: "default-numbering", level: 0 }
              : undefined,
            spacing: {
              after: 80,
            },
          })
        );
      });
    }

    // Tables with proper styling
    else if (block.type === "table") {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
          rows: [
            // Header row with styling
            new TableRow({
              children: block.headers.map(
                (header: string) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: header,
                            bold: true,
                            size: 22,
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                    shading: {
                      fill: "F3F4F6",
                      type: ShadingType.SOLID,
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                  })
              ),
            }),

            // Data rows
            ...block.rows.map(
              (row: string[]) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: cell,
                            alignment: AlignmentType.LEFT,
                          }),
                        ],
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
                        },
                      })
                  ),
                })
            ),
          ],
        })
      );

      // Add spacing after table
      children.push(
        new Paragraph({
          text: "",
          spacing: { after: 200 },
        })
      );
    }

    // Code blocks
    else if (block.type === "code-block") {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.text,
              font: "Courier New",
              size: 20,
            }),
          ],
          shading: {
            fill: "F3F4F6",
            type: ShadingType.SOLID,
          },
          spacing: {
            before: 120,
            after: 120,
          },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
        })
      );
    }

    // Blockquotes
    else if (block.type === "blockquote") {
      children.push(
        new Paragraph({
          children: segmentsToTextRuns(block.segments).map(run => 
            new TextRun({
              ...run,
              italics: true,
            })
          ),
          indent: {
            left: 720, // 0.5 inch
          },
          spacing: {
            before: 120,
            after: 120,
          },
          border: {
            left: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "CCCCCC",
            },
          },
        })
      );
    }

    // Horizontal dividers
    else if (block.type === "divider") {
      children.push(
        new Paragraph({
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "CCCCCC",
            },
          },
          spacing: {
            before: 120,
            after: 120,
          },
        })
      );
    }
  });

  return children;
}
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
 * Convert text segments to TextRun objects
 */
function segmentsToTextRuns(
  segments: TextSegment[],
  forceBold = false
): TextRun[] {
  return segments.map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: forceBold || seg.bold,
        italics: seg.italic,
        font: seg.code ? "Courier New" : "Calibri",
        size: seg.code ? 20 : 22,
        color: seg.code ? "2563EB" : undefined,
        shading: seg.code
          ? {
              fill: "F3F4F6",
              type: ShadingType.SOLID,
            }
          : undefined,
      })
  );
}

/**
 * Build DOCX elements from parsed blocks
 */
export function buildDocxBlocks(blocks: DocxBlock[]): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];

  for (const block of blocks) {
    /* ---------------- HEADINGS ---------------- */
    if (block.type === "heading") {
      const headingMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };

      children.push(
        new Paragraph({
          heading: headingMap[block.level] || HeadingLevel.HEADING_2,
          children: segmentsToTextRuns(block.segments),
          spacing: { before: 240, after: 120 },
        })
      );
    }

    /* ---------------- PARAGRAPH ---------------- */
    else if (block.type === "paragraph") {
      children.push(
        new Paragraph({
          children: segmentsToTextRuns(block.segments),
          spacing: { after: 120 },
        })
      );
    }

    /* ---------------- LIST ---------------- */
    else if (block.type === "list") {
      for (const itemSegments of block.items) {
        children.push(
          new Paragraph({
            children: segmentsToTextRuns(itemSegments),
            bullet: block.ordered ? undefined : { level: 0 },
            numbering: block.ordered
              ? { reference: "default-numbering", level: 0 }
              : undefined,
            spacing: { after: 80 },
          })
        );
      }
    }

    /* ---------------- TABLE ---------------- */
    else if (block.type === "table") {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            insideHorizontal: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "CCCCCC",
            },
            insideVertical: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "CCCCCC",
            },
          },
          rows: [
            /* Header row */
            new TableRow({
              children: block.headers.map((headerSegments) =>
                new TableCell({
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: segmentsToTextRuns(headerSegments, true),
                    }),
                  ],
                })
              ),
            }),

            /* Data rows */
            ...block.rows.map((row) =>
              new TableRow({
                children: row.map((cellSegments) =>
                  new TableCell({
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: segmentsToTextRuns(cellSegments),
                      }),
                    ],
                  })
                ),
              })
            ),
          ],
        })
      );

      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    /* ---------------- CODE BLOCK ---------------- */
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
          spacing: { before: 120, after: 120 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
        })
      );
    }

    /* ---------------- BLOCKQUOTE ---------------- */
    else if (block.type === "blockquote") {
      children.push(
        new Paragraph({
          children: segmentsToTextRuns(block.segments).map(
            (textRun) =>
              new TextRun({
                ...textRun,
                italics: true,
              })
          ),
          indent: { left: 720 },
          spacing: { before: 120, after: 120 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
          },
        })
      );
    }

    /* ---------------- DIVIDER ---------------- */
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
          spacing: { before: 120, after: 120 },
        })
      );
    }
  }

  return children;
}
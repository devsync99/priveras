import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

export type TextSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: string;
};

export type DocxBlock =
  | { type: "heading"; level: number; segments: TextSegment[] }
  | { type: "paragraph"; segments: TextSegment[] }
  | { type: "list"; ordered: boolean; items: TextSegment[][] }
  | { type: "table"; headers: TextSegment[][]; rows: TextSegment[][][] }
  | { type: "code-block"; text: string; language?: string }
  | { type: "blockquote"; segments: TextSegment[] }
  | { type: "divider" };

/**
 * Remove citations from text (e.g., [Source 14, Page 1-23])
 */
function removeCitations(text: string): string {
  return text.replace(/\[[^\]]+\]/g, "").trim();
}

/**
 * Extract text segments with formatting from node children
 */
function extractSegments(children: any[]): TextSegment[] {
  const segments: TextSegment[] = [];

  children.forEach((child: any) => {
    if (child.type === "text") {
      // Remove citations from plain text
      const cleanText = removeCitations(child.value);
      if (cleanText) {
        segments.push({ text: cleanText });
      }
    } else if (child.type === "strong") {
      const text = removeCitations(
        child.children.map((c: any) => c.value).join("")
      );
      if (text) {
        segments.push({ text, bold: true });
      }
    } else if (child.type === "emphasis") {
      const text = removeCitations(
        child.children.map((c: any) => c.value).join("")
      );
      if (text) {
        segments.push({ text, italic: true });
      }
    } else if (child.type === "inlineCode") {
      segments.push({ text: child.value, code: true });
    } else if (child.type === "link") {
      const text = removeCitations(
        child.children.map((c: any) => c.value).join("")
      );
      if (text) {
        segments.push({ text, link: child.url });
      }
    } else if (child.children) {
      // Recursively handle nested formatting (e.g., bold + italic)
      segments.push(...extractSegments(child.children));
    }
  });

  return segments;
}

/**
 * Parse markdown content into structured blocks
 */
export function parseContent(markdown: string): DocxBlock[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  const blocks: DocxBlock[] = [];

  tree.children.forEach((node: any) => {
    // Headings (h1, h2, h3, etc.)
    if (node.type === "heading") {
      blocks.push({
        type: "heading",
        level: node.depth,
        segments: extractSegments(node.children),
      });
    }

    // Paragraphs
    else if (node.type === "paragraph") {
      blocks.push({
        type: "paragraph",
        segments: extractSegments(node.children),
      });
    }

    // Lists (bullet and numbered)
    else if (node.type === "list") {
      const items: TextSegment[][] = [];

      node.children.forEach((listItem: any) => {
        // Each list item can have multiple paragraphs
        const itemSegments: TextSegment[] = [];
        listItem.children.forEach((child: any) => {
          if (child.type === "paragraph") {
            itemSegments.push(...extractSegments(child.children));
          }
        });
        items.push(itemSegments);
      });

      blocks.push({
        type: "list",
        ordered: node.ordered,
        items,
      });
    }

    // Tables - FIXED VERSION
    else if (node.type === "table") {
      // In remark-gfm, all table rows are in node.children
      // The first row is the header, rest are data rows

      if (node.children.length === 0) {
        return; // Skip empty tables
      }

      // Extract headers with formatting (first row)
      const headerRow = node.children[0];
      const headers = headerRow.children.map((cell: any) =>
        extractSegments(cell.children)
      );

      // Extract data rows with formatting (remaining rows)
      const rows = node.children
        .slice(1)
        .map((row: any) =>
          row.children.map((cell: any) => extractSegments(cell.children))
        );

      blocks.push({
        type: "table",
        headers,
        rows,
      });
    }

    // Code blocks
    else if (node.type === "code") {
      blocks.push({
        type: "code-block",
        text: node.value,
        language: node.lang,
      });
    }

    // Blockquotes
    else if (node.type === "blockquote") {
      const segments: TextSegment[] = [];
      node.children.forEach((child: any) => {
        if (child.type === "paragraph") {
          segments.push(...extractSegments(child.children));
        }
      });
      blocks.push({
        type: "blockquote",
        segments,
      });
    }

    // Horizontal rules
    else if (node.type === "thematicBreak") {
      blocks.push({
        type: "divider",
      });
    }
  });

  return blocks;
}

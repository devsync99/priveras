export type TextSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  color?: string;
};

export type DocxBlock =
  | { type: "heading"; segments: TextSegment[]; level: 1 | 2 | 3 }
  | { type: "paragraph"; segments: TextSegment[] }
  | { type: "bullet"; items: TextSegment[][] }
  | { type: "numbered"; items: TextSegment[][] }
  | { type: "blockquote"; segments: TextSegment[] }
  | { type: "code-block"; text: string }
  | { type: "divider" };

/**
 * Parse inline markdown formatting (bold, italic, code)
 */
function parseInlineMarkdown(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;

  // Remove HTML tags first
  remaining = remaining.replace(/<[^>]+>/g, "");

  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/g, bold: true, italic: true }, // ***text***
    { regex: /\*\*(.+?)\*\*/g, bold: true }, // **text**
    { regex: /__(.+?)__/g, bold: true }, // __text__
    { regex: /\*(.+?)\*/g, italic: true }, // *text*
    { regex: /_(.+?)_/g, italic: true }, // _text_
    { regex: /`(.+?)`/g, code: true }, // `text`
  ];

  let lastIndex = 0;
  const matches: Array<{
    index: number;
    length: number;
    segment: TextSegment;
  }> = [];

  // Find all matches
  patterns.forEach((pattern) => {
    const regex = new RegExp(pattern.regex.source, "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        segment: {
          text: match[1],
          bold: pattern.bold,
          italic: pattern.italic,
          code: pattern.code,
        },
      });
    }
  });

  // Sort by index
  matches.sort((a, b) => a.index - b.index);

  // Remove overlapping matches (keep the first one)
  const validMatches = matches.filter((match, i) => {
    if (i === 0) return true;
    const prev = matches[i - 1];
    return match.index >= prev.index + prev.length;
  });

  // Build segments
  validMatches.forEach((match) => {
    // Add plain text before this match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      if (plainText) {
        segments.push({ text: plainText });
      }
    }
    // Add formatted text
    segments.push(match.segment);
    lastIndex = match.index + match.length;
  });

  // Add remaining plain text
  if (lastIndex < text.length) {
    const plainText = text.slice(lastIndex);
    if (plainText) {
      segments.push({ text: plainText });
    }
  }

  // If no matches found, return the whole text as a single segment
  if (segments.length === 0 && text) {
    segments.push({ text });
  }

  return segments;
}

export function parseContent(content: string): DocxBlock[] {
  const lines = content.split("\n");
  const blocks: DocxBlock[] = [];

  let listBuffer: TextSegment[][] = [];
  let listType: "bullet" | "numbered" | null = null;
  let codeBlockBuffer: string[] = [];
  let inCodeBlock = false;

  const flushList = () => {
    if (listType && listBuffer.length) {
      blocks.push({ type: listType, items: [...listBuffer] });
      listBuffer = [];
      listType = null;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockBuffer.length) {
      blocks.push({ type: "code-block", text: codeBlockBuffer.join("\n") });
      codeBlockBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // Skip empty lines
    if (!trimmed) continue;

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList();
      blocks.push({ type: "divider" });
      continue;
    }

    // Headings
    if (/^#{1,3}\s/.test(trimmed)) {
      flushList();
      const level = trimmed.match(/^#+/)![0].length as 1 | 2 | 3;
      const text = trimmed.replace(/^#+\s*/, "");
      blocks.push({
        type: "heading",
        level,
        segments: parseInlineMarkdown(text),
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      flushList();
      const text = trimmed.replace(/^>\s*/, "");
      blocks.push({
        type: "blockquote",
        segments: parseInlineMarkdown(text),
      });
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      if (listType !== "bullet") flushList();
      listType = "bullet";
      const text = trimmed.replace(/^[-*]\s+/, "");
      listBuffer.push(parseInlineMarkdown(text));
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== "numbered") flushList();
      listType = "numbered";
      const text = trimmed.replace(/^\d+\.\s+/, "");
      listBuffer.push(parseInlineMarkdown(text));
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push({
      type: "paragraph",
      segments: parseInlineMarkdown(trimmed),
    });
  }

  flushList();
  flushCodeBlock();
  return blocks;
}

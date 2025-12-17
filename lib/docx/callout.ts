import { Paragraph, TextRun, ShadingType } from "docx";

type CalloutType = "info" | "success" | "warning";

const calloutStyles: Record<CalloutType, string> = {
  info: "E0F2FE",
  success: "E6F4EA",
  warning: "FFF4CC",
};

export function calloutBox(
  text: string,
  type: CalloutType = "info"
): Paragraph {
  return new Paragraph({
    shading: {
      type: ShadingType.CLEAR,
      fill: calloutStyles[type],
    },
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
      }),
    ],
  });
}

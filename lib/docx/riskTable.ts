import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  ShadingType,
  AlignmentType,
} from "docx";

export interface RiskRow {
  risk: string;
  severity: "High" | "Medium" | "Low";
  mitigation: string;
  owner: string;
}

const severityColor: Record<RiskRow["severity"], string> = {
  High: "FDECEA",
  Medium: "FFF4CC",
  Low: "E6F4EA",
};

export function buildRiskTable(rows: RiskRow[]): Table {
  const header = new TableRow({
    children: ["Risk / Threat", "Severity", "Mitigation Strategy", "Owner"].map(
      text =>
        new TableCell({
          shading: {
            type: ShadingType.CLEAR,
            fill: "EEF2FF",
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text,
                  bold: true,
                }),
              ],
            }),
          ],
        })
    ),
  });

  const body = rows.map(
    row =>
      new TableRow({
        children: [
          cell(row.risk),
          new TableCell({
            shading: {
              type: ShadingType.CLEAR,
              fill: severityColor[row.severity],
            },
            children: [cellText(row.severity, true)],
          }),
          cell(row.mitigation),
          cell(row.owner),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...body],
  });
}

function cell(text: string): TableCell {
  return new TableCell({
    children: [cellText(text)],
  });
}

function cellText(text: string, bold = false): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold,
      }),
    ],
  });
}

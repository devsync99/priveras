// components/pia/document-panel.tsx
"use client";

import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import ExportPreview from "@/lib/pia/export-preview-demo";
import { useState } from "react";

import { Document, Packer, Paragraph } from "docx";
import { buildDocxBlocks } from "@/lib/docx/buildDocx";
import { parseContent } from "@/lib/docx/parseContent";
import { buildCoverPage, buildFooter } from "@/lib/docx/cover";


interface DocumentPanelProps {
  selectedProject: string | null;
  isFullWidth?: boolean;
}

export function DocumentPanel({
  selectedProject,
  isFullWidth = false,
}: DocumentPanelProps) {
  const [exportContent, setExportContent] = useState<string[]>([]);

  const handleExport = async () => {
    if (!exportContent.length) {
      toast.error("Nothing to export");
      return;
    }

    try {
      // Convert accepted markdown content into DOCX blocks
      const contentBlocks = exportContent.flatMap((content) =>
        buildDocxBlocks(parseContent(content))
      );

      const doc = new Document({
        sections: [
          {
            footers: {
              default: buildFooter("PIA Project"),
            },
            children: [
              ...buildCoverPage("PIA Project", "Organization Name"),
              ...contentBlocks,
              new Paragraph({ pageBreakBefore: true }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "PIA-Document.docx";
      a.click();

      URL.revokeObjectURL(url);

      toast.success("Export Complete", {
        description: "Downloaded exactly what you previewed",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  if (!selectedProject) {
    return (
      <div
        className={`${
          isFullWidth ? "flex-1" : "w-1/2"
        } bg-gray-50 border-l border-gray-200 flex items-center justify-center p-8`}
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            PIA Document Draft
          </h3>
          <p className="text-gray-600">
            Your PIA sections will appear here once you start generating them
            through the chat interface.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isFullWidth ? "flex-1" : "w-full lg:w-1/2"
      } bg-white flex flex-col`}
    >
      {/* Document Header */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 bg-linear-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="truncate">PIA Document Draft</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 lg:px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 text-xs lg:text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PIA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto">
        <ExportPreview
          selectedProject={selectedProject}
          onAcceptedChange={setExportContent}
        />
      </div>
    </div>
  );
}

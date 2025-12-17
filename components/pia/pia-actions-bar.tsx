// components/pia/pia-actions-bar.tsx
"use client";

import { useState } from "react";
import { Download, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { piaSectionsApi } from "@/lib/api/pia-sections";

interface PIAActionsBarProps {
  projectId: string;
  projectTitle: string;
  projectStatus: string;
  onStatusChange?: () => void;
}

export function PIAActionsBar({
  projectId,
  projectTitle,
  projectStatus,
  onStatusChange,
}: PIAActionsBarProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCompletePIA = async () => {
    if (
      !confirm(
        "Are you sure you want to complete this PIA? This will finalize the assessment and cleanup temporary documents from the system."
      )
    ) {
      return;
    }

    setIsCompleting(true);

    try {
      await piaSectionsApi.completePIA(projectId);

      toast.success("PIA Completed", {
        description:
          "The PIA has been marked as complete and documents have been cleaned up.",
      });

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to complete PIA", {
        description: errorMessage,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/pia/export?projectId=${projectId}&format=${format}`
      );

      if (!response.ok) {
        throw new Error("Failed to export PIA");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${projectTitle.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_PIA.${format}`;

      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export successful", {
        description: `PIA exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to export PIA", {
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">{projectTitle}</p>
          <p className="text-xs text-gray-500">Status: {projectStatus}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Export Dropdown */}
        <div className="relative group">
          <button
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export PIA
          </button>

          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleExport("markdown")}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Export as Markdown
              </button>
              <button
                onClick={() => handleExport("html")}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Export as HTML
              </button>
              <button
                onClick={() => handleExport("txt")}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Export as Text
              </button>
              <button
                onClick={() => handleExport("json")}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>

        {/* Complete PIA Button */}
        {projectStatus !== "Completed" && (
          <button
            onClick={handleCompletePIA}
            disabled={isCompleting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            {isCompleting ? "Completing..." : "Complete PIA"}
          </button>
        )}

        {projectStatus === "Completed" && (
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        )}
      </div>
    </div>
  );
}

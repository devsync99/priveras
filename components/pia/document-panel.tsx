// components/pia/document-panel.tsx
"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Edit3,
  Check,
  X,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

interface DocumentPanelProps {
  selectedProject: string | null;
  isFullWidth?: boolean;
}

interface PIASection {
  id: string;
  title: string;
  content: string;
  status: "draft" | "accepted" | "pending";
  lastUpdated: Date;
}

const dummySections: PIASection[] = [
  {
    id: "1",
    title: "1. Project Description",
    content: `# Project Overview

The Healthcare Portal Modernization project aims to upgrade the existing patient portal infrastructure to provide enhanced functionality, improved user experience, and stronger security measures.

## Objectives
- Modernize the user interface for better accessibility
- Implement advanced security protocols
- Enable real-time appointment scheduling
- Integrate with existing EHR systems

## Scope
The project encompasses the complete redesign of the patient-facing web portal and mobile applications, including backend API restructuring and database optimization.

## Timeline
Project Duration: 12 months
Expected Go-Live: Q3 2024`,
    status: "accepted",
    lastUpdated: new Date(2024, 0, 14, 10, 0, 0), // January 14, 2024, 10:00:00
  },
  {
    id: "2",
    title: "2. Data Collection and Usage",
    content: `# Personal Information Collected

The system collects and processes the following categories of personal information:

## Patient Demographics
- Full name
- Date of birth
- Gender
- Contact information (email, phone, address)

## Medical Information
- Medical history
- Current medications
- Allergies and conditions
- Treatment records
- Test results

## Technical Data
- IP addresses
- Device information
- Session logs
- Usage analytics

## Purpose of Collection
All data is collected for the primary purpose of providing healthcare services, appointment management, and secure communication between patients and healthcare providers.`,
    status: "draft",
    lastUpdated: new Date(2024, 0, 15, 10, 0, 0), // January 15, 2024, 10:00:00
  },
];

export function DocumentPanel({
  selectedProject,
  isFullWidth = false,
}: DocumentPanelProps) {
  const [sections, setSections] = useState<PIASection[]>(dummySections);
  const [expandedSections, setExpandedSections] = useState<string[]>(["1"]);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    toast.success("Export Started", {
      description: "Your PIA document is being generated...",
    });
  };

  const handleCopySection = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleRefreshSection = (id: string) => {
    toast.info("Regenerating section", {
      description:
        "The AI is regenerating this section based on your documents...",
    });
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
            <p className="text-xs lg:text-sm text-gray-600 mt-1">
              Live document - {sections.length} sections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 lg:px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 text-xs lg:text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 lg:space-y-4">
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Sections Yet
            </h3>
            <p className="text-gray-600 text-sm">
              Start by requesting a PIA section in the chat panel
            </p>
          </div>
        ) : (
          sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            return (
              <div
                key={section.id}
                className={`
                  border rounded-lg transition-all
                  ${
                    section.status === "accepted"
                      ? "border-green-200 bg-green-50/50"
                      : ""
                  }
                  ${
                    section.status === "draft"
                      ? "border-yellow-200 bg-yellow-50/50"
                      : ""
                  }
                  ${
                    section.status === "pending"
                      ? "border-gray-200 bg-gray-50"
                      : ""
                  }
                `}
              >
                {/* Section Header */}
                <div
                  className="flex items-center justify-between p-3 lg:p-4 cursor-pointer hover:bg-white/50"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">
                          Last updated: {formatDate(section.lastUpdated)}
                        </span>
                        {section.status === "accepted" && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </span>
                        )}
                        {section.status === "draft" && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Edit3 className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySection(section.content);
                      }}
                      className="p-1.5 lg:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy section"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefreshSection(section.id);
                      }}
                      className="p-1.5 lg:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Regenerate section"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-3 lg:px-4 pb-3 lg:pb-4 border-t border-gray-200">
                    <div className="bg-white rounded-lg p-3 lg:p-4 mt-3 lg:mt-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 text-xs lg:text-sm leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </div>

                    {/* Section Actions */}
                    {section.status === "draft" && (
                      <div className="flex items-center gap-2 mt-3 lg:mt-4 flex-wrap">
                        <button
                          onClick={() => {
                            setSections(
                              sections.map((s) =>
                                s.id === section.id
                                  ? { ...s, status: "accepted" }
                                  : s
                              )
                            );
                            toast.success("Section accepted", {
                              description:
                                "This section has been added to your PIA document.",
                            });
                          }}
                          className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs lg:text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Accept Section
                          </span>
                          <span className="sm:hidden">Accept</span>
                        </button>
                        <button
                          onClick={() => setEditingSection(section.id)}
                          className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm font-medium"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSections(
                              sections.filter((s) => s.id !== section.id)
                            );
                            toast.info("Section rejected");
                          }}
                          className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs lg:text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Document Footer Stats */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4">
        <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">
              {sections.length}
            </p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-green-600">
              {sections.filter((s) => s.status === "accepted").length}
            </p>
            <p className="text-xs text-gray-600">Accepted</p>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-yellow-600">
              {sections.filter((s) => s.status === "draft").length}
            </p>
            <p className="text-xs text-gray-600">Draft</p>
          </div>
        </div>
      </div>
    </div>
  );
}

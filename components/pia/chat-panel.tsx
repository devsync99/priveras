// components/pia/chat-panel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Send,
  Upload,
  File,
  X,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Copy,
  Edit,
  Menu,
  ListChecks,
  Eye,
  Files,
  Download,
  Check,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/date-utils";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { piaApi } from "@/lib/api/pia";
import { piaSectionsApi } from "@/lib/api/pia-sections";
import { piaChatApi } from "@/lib/api/pia-chat";
import { useUIStore } from "@/lib/store/ui-store";
import ViewPiaDocs from "./view-pia-docs";
import { piaPrompts } from "@/lib/pia/pia-section-prompts";
import ModifyAnswerPanel from "./modify-answer-panel";
import { parseContent } from "@/lib/docx/parseContent";
import { buildDocxBlocks } from "@/lib/docx/buildDocx";
import { buildCoverPage, buildFooter } from "@/lib/docx/cover";
import { PiaProgressResponse } from "@/lib/types";

interface ChatPanelProps {
  session: any;
  selectedProject: string | null;
  isSidebarOpen: boolean;
  isFullWidth?: boolean;
  onProjectUpdate?: () => void;
  projectStatus?: string;
  projectId?: string;
  projectTitle?: string;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "pending" | "completed" | "error";
  attachments?: Array<{ name: string; type: string }>;
  actions?: Array<{ label: string; value: string }>;
  isActionResponse?: boolean;
  isDraftAccepted?: boolean;
  isSectionSteps?: boolean;
}

interface PIASection {
  label: string;
  value: string;
}

function getGreetingMessage() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "🌅 Good morning!";
  if (hour >= 12 && hour < 17) return "☀️ Good afternoon!";
  if (hour >= 17 && hour < 21) return "🌇 Good evening!";
  return "🌙 Good night!";
}

function getAssistantGreeting() {
  const greeting = getGreetingMessage();
  return `${greeting} I'm your Priveras AI Assistant.`;
}

// Helper function to get file icon
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (ext === "docx" || ext === "doc") return "📘";
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return "📊";
  if (ext === "pptx" || ext === "ppt") return "📽️";
  if (ext === "vsdx") return "📐";
  return "📎";
};

export function ChatPanel({
  session,
  selectedProject,
  isSidebarOpen,
  isFullWidth = false,
  onProjectUpdate,
  projectStatus,
  projectId,
  projectTitle,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);
  const [isModifyPanelOpen, setIsModifyPanelOpen] = useState(false);
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [acceptedMessages, setAcceptedMessages] = useState<string[]>([]);
  const [piaProgressMsg, setPiaProgressMsg] = useState("");
  const [showProgressMsg, setShowProgressMsg] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [selectedSectionInfo, setSelectedSectionInfo] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [piaOpen, setPiaOpen] = useState(true); // default open

  const piaSections: PIASection[] = [
    {
      label: "1. Executive Summary Section",
      value: "Executive Summary Section",
    },
    { label: "2. Introduction Section", value: "Introduction Section" },
    { label: "3. Project Description", value: "Project Description" },
    {
      label: "4. Scope of the Privacy Analysis",
      value: "Scope of the Privacy Analysis",
    },
    { label: "5. Business Processes", value: "Business Processes" },
    {
      label: "6. IT Systems & Applications",
      value: "IT Systems & Applications",
    },
    {
      label: "7. Data Flow & Data Handling",
      value: "Data Flow & Data Handling",
    },
    { label: "8. Access Controls", value: "Access Controls" },
    { label: "9. Security Assessments", value: "Security Assessments" },
    {
      label: "10. Privacy Summary or Analysis",
      value: "Privacy Summary or Analysis",
    },
    {
      label: "11. Risk Assessment & Mitigation",
      value: "Risk Assessment & Mitigation",
    },
    { label: "12. Appendices", value: "Appendices" },
  ];

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > 160 ? "auto" : "hidden";
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when project is selected

  const loadChatHistory = async () => {
    if (!selectedProject) {
      setMessages([]);
      return;
    }

    try {
      const chatMessages = await piaChatApi.getMessages(selectedProject);

      const formattedMessages = chatMessages.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.createdAt,
        attachments: msg.attachments ?? undefined,
        actions: msg.actions ?? undefined,
        status: msg.status ?? undefined,
        isActionResponse: msg.isActionResponse,
        isDraftAccepted: msg.isDraftAccepted,
        isSectionSteps: msg.isSectionSteps,
      }));

      setMessages(formattedMessages);

      // Load accepted drafts
      const accepted = chatMessages
        .filter((msg) => msg.isDraftAccepted && msg.type === "assistant")
        .map((msg) => msg.content);
      setAcceptedMessages(accepted);
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setMessages([]);
      setAcceptedMessages([]);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, [selectedProject]);

  const saveMessageToDb = async (message: Message) => {
    if (!selectedProject) return;

    try {
      await piaChatApi.saveMessage({
        projectId: selectedProject,
        type: message.type,
        content: message.content,
        attachments: message.attachments,
        actions: message.actions,
        status: message.status,
        isActionResponse: message.isActionResponse,
        isDraftAccepted: message.isDraftAccepted,
        isSectionSteps: message.isSectionSteps,
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience if DB save fails
      console.debug("Failed to save message to database:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;
    if (!selectedProject) {
      toast.error("No project selected");
      return;
    }

    const content = inputValue;
    const attachments = attachedFiles.map((f) => ({
      name: f.name,
      type: f.type,
    }));

    setInputValue("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // 1. Save USER message
      await piaChatApi.saveMessage({
        projectId: selectedProject,
        type: "user",
        content,
        attachments,
        status: "completed",
      });

      // 2. Generate AI response
      const section = await piaSectionsApi.generateSection(
        selectedProject,
        selectedSectionInfo?.value ?? "custom",
        selectedSectionInfo?.label ?? "Custom Query",
        content
      );

      // 3. Save ASSISTANT message
      await piaChatApi.saveMessage({
        projectId: selectedProject,
        type: "assistant",
        content: section.content,
        status: "completed",
      });

      // 4. Refetch from DB
      await loadChatHistory();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to send message", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const validTypes = [".pdf", ".docx", ".xlsx", ".csv", ".vsdx", ".pptx"];
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return validTypes.includes(extension);
    });

    if (validFiles.length !== files.length) {
      toast.error("Invalid File Type", {
        description:
          "Only PDF, DOCX, XLSX, CSV, VSDX, and PPTX files are supported.",
      });
    }

    if (validFiles.length > 0) {
      // Create user message showing uploaded files
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: `Uploaded ${validFiles.length} document${validFiles.length > 1 ? "s" : ""
          }`,
        timestamp: new Date(),
        attachments: validFiles.map((f) => ({
          name: f.name,
          type: f.type || f.name.split(".").pop() || "file",
        })),
      };

      setMessages((prev) => [...prev, userMessage]);
      saveMessageToDb(userMessage);

      const isInProgress = projectStatus === "In Progress";
      const isMultiple = validFiles.length > 1;

      const documentLabel = isMultiple ? "documents" : "document";
      const documentRef = isMultiple ? "these documents" : "this document";
      const pronoun = isMultiple ? "them" : "it";

      const actionLabel = isInProgress
        ? `Execute indexing of ${documentRef}`
        : "Execute PIA Section Generation";

      const assistantMessage = isInProgress
        ? `I've added your ${validFiles.length
        } ${documentLabel} to the existing project context.
${isMultiple ? "These documents have" : "This document has"
        } been indexed and will be used alongside your previously uploaded materials.
Click "Execute indexing of ${documentRef}" to index ${pronoun} and continue working on your current PIA.`
        : `Perfect! I've received your ${validFiles.length} ${documentLabel}.
Click "Execute PIA" below to process ${pronoun} and begin generating your Privacy Impact Assessment sections.`;

      // Create AI response with Execute PIA action
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: assistantMessage,
        timestamp: new Date(),
        status: "completed",
        actions: [
          {
            label: actionLabel,
            value: "execute-pia",
          },
        ],
      };

      setMessages((prev) => [...prev, aiResponse]);
      saveMessageToDb(aiResponse);

      // Store files for later execution
      setAttachedFiles(validFiles);

      toast.success("Documents uploaded", {
        description: `${validFiles.length} document${validFiles.length > 1 ? "s" : ""
          } ready to process`,
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleRemoveAttachment = (messageId: string, fileIndex: number) => {
    setMessages((prev) => {
      // First, find the user message
      const userMsg = prev.find((m) => m.id === messageId);

      if (!userMsg) return prev;

      // Compute updated attachments after removal
      const updatedUserAttachments =
        userMsg.attachments?.filter((_, i) => i !== fileIndex) || [];

      // Determine if we should remove user message
      const shouldRemoveUserMsg = updatedUserAttachments.length === 0;

      return prev
        .map((msg) => {
          // Update user message
          if (msg.id === messageId) {
            if (shouldRemoveUserMsg) return null;

            return {
              ...msg,
              attachments: updatedUserAttachments,
              content: `Uploaded ${updatedUserAttachments.length} document${updatedUserAttachments.length > 1 ? "s" : ""
                }`,
            };
          }

          // Update assistant message linked to this user message
          if (msg.type === "assistant" && msg.actions?.some(a => a.value === "execute-pia")) {
            if (updatedUserAttachments.length === 0) return null;

            const remainingCount = updatedUserAttachments.length;
            const isMultiple = remainingCount > 1;
            const documentLabel = isMultiple ? "documents" : "document";
            const documentRef = isMultiple ? "these documents" : "this document";
            const pronoun = isMultiple ? "them" : "it";

            const isInProgress = projectStatus === "In Progress";
            const actionLabel = isInProgress
              ? `Execute indexing of ${documentRef}`
              : "Execute PIA Section Generation";

            const assistantMessage = isInProgress
              ? `I've added your ${remainingCount} ${documentLabel} to the existing project context.
${isMultiple ? "These documents have" : "This document has"} been indexed and will be used alongside your previously uploaded materials.
Click "Execute indexing of ${documentRef}" to index ${pronoun} and continue working on your current PIA.`
              : `Perfect! I've received your ${remainingCount} ${documentLabel}.
Click "Execute PIA" below to process ${pronoun} and begin generating your Privacy Impact Assessment sections.`;

            return {
              ...msg,
              content: assistantMessage,
              actions: [
                {
                  label: actionLabel,
                  value: "execute-pia",
                },
              ],
            };
          }

          return msg;
        })
        .filter(Boolean) as Message[];
    });

    // Update attachedFiles state
    setAttachedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
  };




  const handleAcceptDraft = async (message: Message) => {
    try {
      await piaChatApi.acceptDraft(message.id);

      // Save accepted draft to project
      await fetch(`/api/projects/${selectedProject}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptedDraft: {
            content: message.content,
            acceptedAt: new Date().toISOString(),
            messageId: message.id,
          },
        }),
      });

      await piaChatApi.saveMessage({
        projectId: selectedProject!,
        type: "assistant",
        content: `✅ **Draft Accepted!**
The modifications have been successfully saved. I am ready for the next step. Please select the **next mandatory section** you need to generate and review for your PIA template.`,
        status: "completed",
        isSectionSteps: true,
      });

      await loadChatHistory();

      toast.success("Draft accepted", {
        description: "The response has been accepted and saved",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to accept draft", { description: errorMessage });
    }
  };

  const downloadDocx = async (isDraft = false) => {
    if (acceptedMessages.length === 0) {
      toast.error("No accepted drafts", {
        description: "Please accept at least one draft before exporting",
      });
      return;
    }

    try {
      // Build content directly from accepted message content
      const contentBlocks = acceptedMessages.flatMap((msg) =>
        buildDocxBlocks(parseContent(msg))
      );

      const doc = new Document({
        sections: [
          {
            // Only add footer for professional version
            footers: isDraft
              ? undefined
              : { default: buildFooter("PIA Project") },
            children: isDraft
              ? contentBlocks // Draft: just the messages
              : [
                ...buildCoverPage("PIA Project", "Organization Name"), // Professional: cover page
                ...contentBlocks, // Actual accepted message content
                // Optional: page break if needed
                new Paragraph({ pageBreakBefore: true }),
              ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = isDraft ? "PIA-Draft-Export.docx" : "PIA-Professional.docx";
      a.click();

      URL.revokeObjectURL(url);

      toast.success("Document exported", {
        description: `Successfully exported ${acceptedMessages.length
          } accepted draft${acceptedMessages.length > 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error exporting document:", error);
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      // Remove markdown formatting for clean copy
      const cleanContent = content
        .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
        .replace(/\*(.*?)\*/g, "$1") // Italic
        .replace(/`(.*?)`/g, "$1") // Code
        .replace(/#{1,6}\s/g, "") // Headers
        .trim();

      // Clipboard API works on secure context (HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cleanContent);
      } else {
        // Fallback for insecure context (HTTP)
        const textarea = document.createElement("textarea");
        textarea.value = cleanContent;
        textarea.style.position = "fixed"; // Avoid scrolling
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success("Copied to clipboard", {
        description: "Clean text has been copied to your clipboard",
      });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Could not copy to clipboard",
      });
      console.error("Copy failed:", error);
    }
  };


  const handleModifyAnswer = (message: Message) => {
    setIsModifyPanelOpen(true);
    setPreviousResponse(message.content);
  };

  const handleCompletePIA = async (message: Message) => {
    if (!selectedProject) {
      toast.error("No project selected", {
        description: "Please select a project to complete PIA",
      });
      return;
    }

    if (
      !confirm(
        "Are you sure you want to complete this PIA? This will finalize the assessment and cleanup temporary documents from the system."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the completePIA API
      await piaSectionsApi.completePIA(selectedProject);

      if (onProjectUpdate) {
        onProjectUpdate();
      }

      toast.success("PIA Completed", {
        description:
          "The PIA has been marked as complete and documents have been cleaned up.",
      });

      // Optionally add a completion message
      const completionMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "🎉 **PIA Completed!**\n\nYour Privacy Impact Assessment has been successfully completed and saved to the project. Temporary documents have been cleaned up from the system. You can now review, export, or share the final document.",
        timestamp: new Date(),
        status: "completed",
      };
      setMessages((prev) => [...prev, completionMessage]);
      saveMessageToDb(completionMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to complete PIA", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollPiaProgress = (
    sessionId: string,
    onUpdate: (progress: PiaProgressResponse) => void
  ) => {
    const intervalId = setInterval(async () => {
      try {
        const progress = await piaApi.getPIAProgress(sessionId);
        onUpdate(progress);
      } catch (err) {
        console.error("Progress polling failed:", err);
      }
    }, 1000);

    // return a stop function
    return () => clearInterval(intervalId);
  };



  const handleExecutePIA = async () => {
    if (attachedFiles.length === 0) {
      toast.error("No files to process", { description: "Please upload documents first" });
      return;
    }
    if (!selectedProject) {
      toast.error("No project selected", { description: "Please select a project to execute PIA" });
      return;
    }

    setIsLoading(true);
    setShowProgressMsg(true);

    let stopPolling: (() => void) | null = null;

    try {
      toast.info("Processing documents", { description: `${attachedFiles.length} file(s) uploaded.` });

      // start polling
      stopPolling = pollPiaProgress(selectedProject, (progress) => {
        if (progress.status_list?.length > 0) {
          const latestMsg = progress.status_list[progress.status_list.length - 1];
          setPiaProgressMsg(latestMsg);
        }
      });

      // start PIA
      await piaApi.startPIA(attachedFiles, selectedProject);

      // stop polling when done
      stopPolling?.();

      // rest of your success logic
      const totalFiles = attachedFiles.length;
      setAttachedFiles([]);
      setHasUploadedFiles(true);

      await fetch(`/api/projects/${selectedProject}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Progress" }),
      });

      onProjectUpdate?.();;


      await piaChatApi.saveMessage({
        projectId: selectedProject!,
        type: "assistant",
        content: `All ${totalFiles} document(s) have been successfully processed and analyzed. I am ready for the next step. Please select the **next mandatory section** you need to generate and review for your PIA template.`,
        status: "completed",
        isSectionSteps: true,
      });


      toast.success("PIA Execution Complete", { description: `All ${totalFiles} document(s) processed successfully` });
    } catch (error) {
      stopPolling?.(); // ensure polling stops on error

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      const errorResponse: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Failed to execute PIA: ${errorMessage}`,
        timestamp: new Date(),
        status: "error",
      };

      setMessages((prev) => [...prev, errorResponse]);
      saveMessageToDb(errorResponse);

      toast.error("Failed to execute PIA", { description: errorMessage });
    } finally {
      setIsLoading(false);
      setShowProgressMsg(false);
      setPiaProgressMsg("")
      await loadChatHistory();
    }
  };



  const handleSectionClick = async (
    sectionLabel: string,
    sectionValue: string
  ) => {
    // Handle Execute PIA action
    if (sectionValue === "execute-pia") {
      await handleExecutePIA();
      return;
    }

    setIsLoading(true);

    try {
      // Look up prompt using the section value (which now matches the key in piaPrompts)
      const promptFromFile = piaPrompts[sectionValue];

      if (!promptFromFile) {
        throw new Error("Prompt not found for this section");
      }

      setInputValue(promptFromFile);

      setSelectedSectionInfo({
        label: sectionLabel,
        value: sectionValue,
      });

      toast.success("Prompt loaded", {
        description:
          "You can now edit the prompt before generating the section",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to load prompt", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Project Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please select a project from the sidebar or create a new one to
            start working on your PIA assessment.
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const TextWithCitations = ({
    children,
    projectId,
  }: {
    children: React.ReactNode;
    projectId: string;
  }) => {
    if (!children) return null;

    // Handler for when a citation is clicked
    const handleCitationClick = async (citation: string) => {
      try {
        const res = await piaChatApi.getDocumentByCitation(projectId, citation);
        window.open(res.url, "_blank"); // open the file in a new tab
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to open document", {
          description: err?.message || "Could not open the document",
        });
      }
    };

    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        // Regex to match citations like [Source 14, Page 1] or [1] or [Smith et al.]
        const parts = child.split(/(\[[^\]]+\])/g);

        return parts.map((part, idx) => {
          if (/^\[[^\]]+\]$/.test(part)) {
            return (
              <span
                key={idx}
                className="text-blue-800 dark:text-blue-400 hover:underline cursor-pointer font-medium transition-colors hover:text-blue-900 dark:hover:text-blue-300"
                onClick={() => handleCitationClick(part)}
              >
                {part}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        });
      }
      return child;
    });
  };

  // Markdown components with TypeScript types
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b dark:border-gray-700 pb-1">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 uppercase tracking-wide">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-2 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc ml-5 mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-5 mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-sm">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-4 py-2 rounded-r-md text-sm italic my-3">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700 dark:text-gray-300">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </em>
    ),
    code: ({ children, className }) => {
      const inline = !className?.includes("language-");
      return inline ? (
        <code className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto my-3">
          <code>{children}</code>
        </pre>
      );
    },
    table: ({ children }) => (
      <table className="table-auto border border-gray-300 dark:border-gray-700 mb-3">
        {children}
      </table>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-left text-sm">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm">
        <TextWithCitations projectId={selectedProject}>{children}</TextWithCitations>
      </td>
    ),
  };

  // console.log(messages, "the mesgs")
  return (
    <div
      className={`${isFullWidth ? "flex-1" : "w-full lg:w-1/2"
        } flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-hidden`}
    >
      {/* Chat Header - EXECUTE BUTTON REMOVED FROM HERE */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 items-center mb-1">
              <div className="w-5 h-5 relative shrink-0">
                <Image src="/logos/icon.svg" alt="icon" fill />
              </div>
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                PIA Assistant Chat
              </h2>
            </div>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Ask questions or request specific PIA sections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadDocx()}
              className="px-3 lg:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs lg:text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Doc</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              disabled={projectStatus === "Completed"}
              onClick={() => setIsViewDocsModalOpen(true)}
              className="px-3 lg:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs lg:text-sm 
             font-medium shadow-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 
             disabled:cursor-not-allowed"
            >
              <Files className="w-4 h-4" />
              <span className="hidden sm:inline">View Docs</span>
              <span className="sm:hidden">View</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={projectStatus === "Completed"}
              className="px-3 lg:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs lg:text-sm 
             font-medium shadow-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 
             disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Docs</span>
              <span className="sm:hidden">Upload</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.vsdx,.pptx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-scroll p-4 lg:p-6 space-y-4 lg:space-y-6 min-h-0">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {getGreetingMessage()} Hello, {session?.user?.name || "User"}!
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg max-w-2xl">
              Upload your material(s) to begin your Privacy Impact Assessment
              (PIA).
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.type === "assistant" && (
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-5 h-5 relative">
                      <Image src="/logos/iconWhite.svg" alt="icon" fill />
                    </div>
                  </div>
                )}

                <div
                  className={`flex flex-col ${message.content.includes("---SECTION_BREAK---")
                    ? "w-full max-w-full"
                    : `max-w-[85%] sm:max-w-xl lg:max-w-2xl ${message.isSectionSteps ? "xl:max-w-4xl" : "xl:max-w-2xl"}`

                    } ${message.type === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`
          px-3 lg:px-4 py-2 lg:py-3 rounded-2xl shadow-sm wrap-break-word
          ${message.type === "user"
                        ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }
        `}
                  >
                    {/* FILE ATTACHMENTS WITH ICONS - THIS IS WHERE DOCUMENTS SHOW */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-1 p-4 rounded-xl">
                        {/* Header */}
                        <p className="text-sm mb-3">Uploaded PIA documents</p>

                        {/* File Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.attachments.map((file, idx) => (
                            <div
                              key={idx}
                              className="group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm
           
          "
                            >

                              {/* Remove Button (Lucide X, appears on hover) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAttachment(message.id, idx);
                                }}
                                className="
    
      p-0.5 rounded-full
      opacity-0 group-hover:opacity-100
      transition-opacity
      text-gray-400 hover:text-black
      hover:bg-red-50 dark:hover:bg-gray-600
    "
                                aria-label="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {/* File Icon */}
                              <span className="text-xl">
                                {getFileIcon(file.name)}
                              </span>

                              {/* File Name */}
                              <span className="truncate flex-1">
                                {file.name}
                              </span>


                            </div>

                          ))}
                        </div>
                      </div>
                    )}

                    {message.content.includes("---SECTION_BREAK---") ? (
                      (() => {
                        const [header, content] = message.content.split("---SECTION_BREAK---");
                        return (
                          <>
                            {/* Section Header */}
                            <div className="mb-4 prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {header}
                              </ReactMarkdown>
                            </div>

                            {/* Section Body */}
                            <div className="formatted-section prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {content}
                              </ReactMarkdown>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div
                        className={`text-sm leading-relaxed ${message.type === "user" ? "" : "prose prose-sm max-w-none"
                          }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={message.type === "user" ? undefined : markdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS - THIS IS WHERE EXECUTE PIA BUTTON APPEARS */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 w-full">
                      {message.actions.map((action, idx) => {
                        const isExecuteButton = action.value === "execute-pia";
                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              handleSectionClick(action.label, action.value)
                            }
                            disabled={isLoading}
                            className={`
                  text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center gap-2
                  ${isExecuteButton
                                ? "w-full bg-linear-to-r from-violet-500 to-indigo-600 text-white border-2 border-violet-600 hover:from-violet-600 hover:to-indigo-700"
                                : idx === 0
                                  ? "flex-1 min-w-[calc(50%-0.25rem)] bg-linear-to-r from-violet-500 to-indigo-600 text-white border-2 border-violet-600 hover:from-violet-600 hover:to-indigo-700"
                                  : "flex-1 min-w-[calc(50%-0.25rem)] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-gray-700"
                              }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="flex-1">{action.label}</span>
                            {idx === 0 && !isExecuteButton && (
                              <span className="text-xs opacity-90">→</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* NEW: Response Action Buttons (Accept Draft, Copy to Clipboard, Modify Answer, Complete PIA) */}
                  {message.type === "assistant" &&
                    !message.actions &&
                    !message.isSectionSteps &&
                    message.status === "completed" &&
                    !message.content.includes(
                      "successfully processed and analyzed"
                    ) &&
                    !(
                      message.attachments && message.attachments.length > 0
                    ) && (
                      <div className="mt-3 flex flex-wrap gap-2 w-full">
                        <button
                          onClick={() => handleAcceptDraft(message)}
                          disabled={
                            isLoading ||
                            projectStatus === "Completed" ||
                            message.isDraftAccepted
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
        ${message.isDraftAccepted
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                            }
      `}
                        >
                          <Check className="w-4 h-4" />
                          {message.isDraftAccepted
                            ? "Accepted"
                            : "Accept Draft"}
                        </button>

                        <button
                          onClick={() => handleCopyToClipboard(message.content)}
                          disabled={isLoading || projectStatus === "Completed"}
                          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 border-2 border-violet-200 dark:border-violet-700 text-sm font-medium flex items-center gap-2 hover:bg-violet-50 dark:hover:bg-gray-700 hover:border-violet-400 dark:hover:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Copy className="w-4 h-4" />
                          Copy to Clipboard
                        </button>

                        <button
                          onClick={() => handleModifyAnswer(message)}
                          disabled={isLoading || projectStatus === "Completed"}
                          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4" />
                          Modify Answer
                        </button>

                        <button
                          onClick={() => handleCompletePIA(message)}
                          disabled={isLoading || projectStatus === "Completed"}
                          className="px-4 py-2 rounded-lg bg-linear-to-r from-violet-500 to-indigo-600 text-white border-2 border-violet-600 text-sm font-medium flex items-center gap-2 hover:from-violet-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileCheck className="w-4 h-4" />
                          Complete PIA
                        </button>
                      </div>
                    )}

                  {message.type === "assistant" &&
                    message.isSectionSteps &&
                    !message.actions &&
                    message.status === "completed" &&
                    !(
                      message.attachments && message.attachments.length > 0
                    ) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 px-2 py-3">
                        {piaSections.map((section, idx) => {
                          const isSelected =
                            selectedSectionInfo?.value === section.value;

                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                handleSectionClick(section.label, section.value)
                              }
                              disabled={isLoading}
                              className={`
            text-left px-3 py-1.5 sm:py-2.5 rounded-lg transition-all text-xs lg:text-sm font-medium flex items-center gap-2
            ${isSelected
                                  ? "bg-linear-to-r from-violet-500 to-indigo-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                }
          `}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="flex-1">{section.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.status === "completed" &&
                      message.type === "assistant" && (
                        <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400" />
                      )}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-10 h-10 bg-linear-to-br from-gray-600 to-gray-800 dark:from-gray-700 dark:to-gray-900 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>

                {showProgressMsg ? (

                  <div className="flex-1 px-1 py-3">

                    {/* AI Reasoning / Thinking Animated Text */}
                    <p
                      className="text-[13px] font-semibold"
                      style={{
                        background: "linear-gradient(90deg, #8f8f8f, #c7c7c7, #8f8f8f)",
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: "gradientMove 2s linear infinite",
                      }}
                    >
                      {piaProgressMsg
                        ? piaProgressMsg
                        : "Analyzing the Docs..."}
                    </p>


                    {/* Inline animation style */}
                    <style>
                      {`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        `}
                    </style>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                  </div>

                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        {projectStatus === "In Progress" && (
          <div className="relative">
            {/* Toggle Button */}
            <button
              onClick={() => setPiaOpen(!piaOpen)}
              className="absolute -top-2.5 left-0 z-20 px-2 py-1 rounded-md bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              {piaOpen ? (
                <X className="w-3 h-3 dark:text-gray-300" />
              ) : (
                <>
                  <ListChecks className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                    PIA Steps
                  </span>
                </>
              )}
            </button>

            {/* Collapsible Content */}
            <div
              className={`
        transition-all duration-300 overflow-hidden
        ${piaOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
      `}
            >
              <div className="px-3 lg:px-4 pt-3 lg:pt-4 pb-2 bg-white dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  Select a PIA section or enter a custom query:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto max-h-48 px-2">
                  {piaSections.map((section, idx) => {
                    const isSelected =
                      selectedSectionInfo?.value === section.value;

                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          handleSectionClick(section.label, section.value)
                        }
                        disabled={isLoading}
                        className={`
                  text-left px-3 py-1.5 sm:py-2.5 rounded-lg transition-all text-xs lg:text-sm font-medium flex items-center gap-2
                  ${isSelected
                            ? "bg-linear-to-r from-violet-500 to-indigo-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          }
                `}
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 lg:p-4">
          <div className="flex items-end gap-2 lg:gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={projectStatus === "Completed"}
              className="p-2 lg:p-3 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0
               disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSendMessage())
              }
              placeholder={
                messages.length === 0
                  ? "Upload materials or describe your project to begin..."
                  : "Select an option or type a response..."
              }
              disabled={projectStatus !== "In Progress"}
              className="
        flex-1 px-3 lg:px-4 py-3 lg:py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
        text-sm lg:text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
        resize-none overflow-y-hidden max-h-40
      "
              rows={1}
            />

            <button
              onClick={handleSendMessage}
              disabled={
                projectStatus !== "In Progress" ||
                (!inputValue.trim() && attachedFiles.length === 0)
              }
              className="
      p-3 lg:p-3.5 bg-violet-600 text-white rounded-full hover:bg-violet-700
      disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0
      cursor-pointer
    "
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ViewPiaDocs
        isOpen={isViewDocsModalOpen}
        onClose={() => setIsViewDocsModalOpen(false)}
        projectId={projectId}
        projectTitle={projectTitle}
      />

      <ModifyAnswerPanel
        isOpen={isModifyPanelOpen}
        onClose={() => setIsModifyPanelOpen(false)}
        piaName={projectId}
        previousResponse={previousResponse}
        onModified={async (newResponse) => {
          // refresh chat history
          await loadChatHistory();
        }}
      />
    </div>
  );
}

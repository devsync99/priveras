// components/pia/MarkdownMessage.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";
import { piaChatApi } from "@/lib/api/pia-chat";

// --- TextWithCitations ---
interface TextWithCitationsProps {
  children: React.ReactNode;
  projectId: string;
}

const TextWithCitations: React.FC<TextWithCitationsProps> = ({ children, projectId }) => {
  if (!children) return null;

  const handleCitationClick = async (citation: string) => {
    try {
      const res = await piaChatApi.getDocumentByCitation(projectId, citation);
      if (res?.url) window.open(res.url, "_blank");
      else throw new Error("No URL returned from API");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to open document", {
        description: err?.message || "Could not open the document",
      });
    }
  };

  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const parts = child.split(/(\[[^\]]+\])/g).filter(Boolean);
      return parts.map((part, idx) => {
        const isCitation = /^\[[^\]]+\]$/.test(part);
        if (isCitation) {
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
        return <span key={idx} className="text-gray-800 dark:text-gray-200">{part}</span>;
      });
    }
    return child;
  });
};

// --- Markdown Components ---
const getMarkdownComponents = (projectId: string): Components => ({
  h1: ({ children }) => (
    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b dark:border-gray-700 pb-1">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold text-indigo-700 dark:text-indigo-400 mt-3 mb-1">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 uppercase tracking-wide">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </h3>
  ),
  p: ({ children, node }) => {
    const isInsideList = (node as any)?.parent?.type === "listItem";

    return (
      <p
        className={
          isInsideList
            ? "m-0 leading-relaxed text-gray-800 dark:text-gray-200"
            : "m-0 mb-1 leading-relaxed text-gray-800 dark:text-gray-200"
        }
      >
        <TextWithCitations projectId={projectId}>
          {children}
        </TextWithCitations>
      </p>
    );
  },



  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-4 py-2 rounded-r-md text-sm italic my-3">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700 dark:text-gray-300">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
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
    <table className="table-auto border border-gray-300 dark:border-gray-700 mb-3 text-gray-800 dark:text-gray-200">
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-left text-sm text-gray-800 dark:text-gray-200">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm text-gray-800 dark:text-gray-200">
      <TextWithCitations projectId={projectId}>{children}</TextWithCitations>
    </td>
  ),
  hr: () => (
    <hr className="border-t border-gray-300 dark:border-gray-600 my-1" />
  ),
});

// --- MarkdownMessage with Section Handling ---
interface MarkdownMessageProps {
  projectId: string;
  content?: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ projectId, content }) => {
  if (!content) return null;

  // No section break - render normally
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={getMarkdownComponents(projectId)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
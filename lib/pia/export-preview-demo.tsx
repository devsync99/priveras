import React, { useState, useEffect } from "react";
import { CheckCircle, FileText } from "lucide-react";
import { piaChatApi } from "../api/pia-chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUIStore } from "@/lib/store/ui-store";

// Helper function to remove citations from content
const removeCitations = (children: React.ReactNode): React.ReactNode => {
  if (!children) return children;

  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      // Remove all citations like [Source 14, Page 1-23] or [HRAS Case Management...]
      return child.replace(/\[[^\]]+\]/g, "").trim();
    }
    return child;
  });
};

interface ChatMessage {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  isDraftAccepted?: boolean;
}

const ExportPreview = ({
  selectedProject,
  onAcceptedChange,
}: {
  selectedProject: string | null;
  onAcceptedChange: (content: string[]) => void;
}) => {
  const [acceptedMessages, setAcceptedMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const documentRefreshKey = useUIStore((state) => state.documentRefreshKey);

  useEffect(() => {
    onAcceptedChange(acceptedMessages);
  }, [acceptedMessages]);

  useEffect(() => {
    if (!selectedProject) return;

    const load = async () => {
      setLoading(true);
      try {
        const messages = await piaChatApi.getMessages(selectedProject);
        const accepted = messages
          .filter((m) => m.isDraftAccepted && m.type === "assistant")
          .map((m) => m.content);

        setAcceptedMessages(accepted);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedProject, documentRefreshKey]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 py-10 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading drafts...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!acceptedMessages.length) {
    return (
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 py-10 min-h-full flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Accepted Drafts Yet
          </h3>
          <p className="text-gray-600">
            Start accepting draft sections from the chat to build your PIA
            document. Accepted drafts will appear here and can be exported.
          </p>
        </div>
      </div>
    );
  }

  // Content state
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 py-10">
      <div className="bg-white mx-auto max-w-[900px] px-14 py-16 shadow-lg rounded-md">
        {acceptedMessages.map((content, index) => (
          <div key={index} className="mb-14">
            {/* Accepted Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                <CheckCircle size={14} />
                Accepted Draft
              </span>
            </div>

            {/* Markdown */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-emerald-700 mt-8 mb-4 border-b pb-2">
                    {removeCitations(children)}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
                    {removeCitations(children)}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-800 leading-7 mb-4">
                    {removeCitations(children)}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong>{removeCitations(children)}</strong>
                ),
                em: ({ children }) => <em>{removeCitations(children)}</em>,
                li: ({ children }) => <li>{removeCitations(children)}</li>,
                table: ({ children }) => (
                  <table className="w-full border border-gray-300 border-collapse my-6 text-sm">
                    {children}
                  </table>
                ),
                th: ({ children }) => (
                  <th className="border px-4 py-2 bg-gray-100 font-semibold">
                    {removeCitations(children)}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border px-4 py-2 align-top">
                    {removeCitations(children)}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportPreview;

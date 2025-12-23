import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { piaChatApi } from "../api/pia-chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUIStore } from "@/lib/store/ui-store";


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
  const [loading, setLoading] = useState(false);
  const documentRefreshKey = useUIStore(
  (state) => state.documentRefreshKey
);


  useEffect(() => {
    onAcceptedChange(acceptedMessages);
  }, [acceptedMessages]);

  useEffect(() => {
    if (!selectedProject) return;

    const load = async () => {
      setLoading(true);
      const messages = await piaChatApi.getMessages(selectedProject);
      const accepted = messages
        .filter((m) => m.isDraftAccepted && m.type === "assistant")
        .map((m) => m.content);

      setAcceptedMessages(accepted);
      setLoading(false);
    };

    load();
  }, [selectedProject, documentRefreshKey]);

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 py-10">
      <div className="bg-white mx-auto max-w-[900px] px-14 py-16 shadow-lg rounded-md">
        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : (
          acceptedMessages.map((content, index) => (
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
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-800 leading-7 mb-4">
                      {children}
                    </p>
                  ),
                  table: ({ children }) => (
                    <table className="w-full border border-gray-300 border-collapse my-6 text-sm">
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th className="border px-4 py-2 bg-gray-100 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border px-4 py-2 align-top">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExportPreview;

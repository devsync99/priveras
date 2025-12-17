import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { piaChatApi } from "@/lib/api/pia-chat";
import { FileText } from "lucide-react";

interface ViewPiaDocsProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
}

const getFileExtension = (name: string) => {
  const ext = name.split(".").pop();
  return ext ? ext.toUpperCase() : "FILE";
};

function ViewPiaDocs({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: ViewPiaDocsProps) {
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const loadDocs = async () => {
      try {
        const docs = await piaChatApi.getPiaDocs(projectId);
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to load PIA docs:", error);
        setDocuments([]);
      }
    };

    loadDocs();
  }, [isOpen, projectId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PIA Documents" size="lg">
      <div className="space-y-4">
        {/* Project title */}
        {projectTitle && (
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            PIA: {projectTitle}
          </div>
        )}

        {/* Empty state */}
        {documents.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No documents have been uploaded for this project.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                  rounded-xl
                  transition-all
                  shadow-sm hover:shadow
                  w-full sm:w-[calc(50%-0.375rem)]
                "
              >
                <div className="shrink-0">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {doc.name}
                  </p>
                </div>

                {/* File type badge */}
                <div className="shrink-0">
                  <span className="px-2 py-1 text-xs font-semibold bg-linear-to-r from-violet-500 to-indigo-600 text-white rounded-full">
                    {getFileExtension(doc.name)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ViewPiaDocs;

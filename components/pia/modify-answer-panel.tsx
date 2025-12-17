import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { toast } from "sonner";
import { piaChatApi } from "@/lib/api/pia-chat";

interface ModifyAnswerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  piaName?: string;
  previousResponse: string;
  section: string;
  onModified?: (response: string) => void;
}

function ModifyAnswerPanel({
  isOpen,
  onClose,
  piaName,
  previousResponse,
  section,
  onModified,
}: ModifyAnswerPanelProps) {
  const [modifiedText, setModifiedText] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModifiedText("");
      setIsTouched(false);
    }
  }, [isOpen]);

  const isInvalid = isTouched && modifiedText.trim().length === 0;
  const isSubmitDisabled =
    isLoading || !piaName || modifiedText.trim().length === 0;

  const handleSubmit = async () => {
    if (isSubmitDisabled || !piaName) return;

    setIsLoading(true);

    try {
      const { response } = await piaChatApi.modifyResponse({
        pia_name: piaName,
        section,
        previous_response: previousResponse,
        modification_query: modifiedText.trim(),
        projectId: piaName,
      });

      toast.success("Response updated", {
        description: "The PIA response has been modified and saved.",
      });

      // Push updated response to parent
      onModified?.(response);

      onClose();
    } catch (error) {
      toast.error("Modification failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modify Response Request"
      size="lg"
    >
      <div className="space-y-6">
        {/* Previous Response */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Previous Response
            </h3>
          </div>
          <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {previousResponse}
          </div>
        </div>

        {/* Modification Input */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Requested Modifications
          </h3>

          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            onBlur={() => setIsTouched(true)}
            rows={5}
            placeholder="Clearly describe what needs to be changed, added, or removed..."
            className={`w-full rounded-lg border px-4 py-3 text-sm resize-none
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-1
              ${
                isInvalid
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-300"
              }`}
          />

          {isInvalid && (
            <p className="text-xs font-medium text-red-600">
              Modification request cannot be empty.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-5 py-2 text-sm font-medium rounded-md text-white
              ${
                isSubmitDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
              }`}
          >
            {isLoading ? "Submitting..." : "Submit Modifications"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModifyAnswerPanel;

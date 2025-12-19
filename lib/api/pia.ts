// lib/api/pia.ts
import type {
  StartPIAResponse,
  PIAGenerateResponse,
  GeneratePIARequest,
  CompletePIAResponse,
  ChatResponse,
  PiaProgressResponse,
} from "@/lib/types";

const PIA_API_BASE_URL =
  process.env.NEXT_PUBLIC_PIA_API_URL || "http://3.98.57.146:8000";

export const piaApi = {
  /**
   * Start a new PIA assessment by uploading project documents.
   * All documents are tagged with the PIA name and stored in Qdrant.
   *
   * @param files - Array of files to upload (PDF, DOCX, images, etc.)
   * @param projectId - The project ID to associate with this PIA
   * @returns Brief summary and confirmation
   */
  startPIA: async (
    files: File[],
    projectId: string
  ): Promise<StartPIAResponse> => {
    const formData = new FormData();

    // Append all files
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Append project ID
    formData.append("project_id", projectId);

    const response = await fetch("/api/pia/start", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
        errorData.details ||
        `Failed to start PIA: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Generate PIA content - handles both predefined sections and custom queries.
   *
   * Predefined sections (use exact names):
   * - project_description: Project overview, purpose, scope
   * - privacy_analysis: Privacy analysis against regulations
   * - risk_assessment: Security risks and mitigations
   * - appendix_d: Data flow charts
   *
   * @param request - Contains pia_name and query
   * @returns Generated PIA content
   */
  generatePIA: async (
    request: GeneratePIARequest
  ): Promise<PIAGenerateResponse> => {
    const response = await fetch(`${PIA_API_BASE_URL}/pia/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to generate PIA: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Modify a previously generated PIA section.
   * Takes the previous response and user's modification request,
   * applies changes while maintaining context from documents.
   *
   * @param request - Contains pia_name, section, previous_response, and modification_query
   * @returns Modified PIA content
   */

  // Modify PIA response (string-based response)
  modifyPiaResponse: async (
    piaName: string,
    previousResponse: string,
    modificationQuery: string
  ): Promise<string> => {
    const response = await fetch(`${PIA_API_BASE_URL}/pia/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pia_name: piaName,
        session_id: piaName,
        previous_response: previousResponse,
        modification_query: modificationQuery,
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(
        `PIA modify failed (${response.status}): ${rawText || response.statusText
        }`
      );
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("PIA modify returned non-JSON success response");
    }

    if (!data?.response) {
      throw new Error("PIA modify response missing `response` field");
    }

    return data.response;
  },


  /**
   * Complete a PIA and delete all associated documents from Qdrant.
   * This removes all documents uploaded for this PIA, cleaning up the vector store.
   *
   * @param piaName - Name of the PIA to complete and cleanup
   * @returns Confirmation of deletion
   */
  completePIA: async (piaName: string): Promise<CompletePIAResponse> => {
    const formData = new FormData();
    formData.append("pia_name", piaName);

    const response = await fetch(`${PIA_API_BASE_URL}/pia/complete`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to complete PIA: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Get the full prompt for a specific PIA section.
   *
   * Available sections:
   * - project_description
   * - privacy_analysis
   * - risk_assessment
   * - appendix_d
   *
   * @param sectionName - Name of the section
   * @returns Complete prompt text and metadata for the section
   */
  getSectionPrompt: async (sectionName: string): Promise<any> => {
    const response = await fetch(`/api/pia/prompt/${sectionName}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
        errorData.details ||
        `Failed to get section prompt: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Simple chat endpoint - just send your query and get an answer!
   * The system automatically retrieves relevant chunks and responds conversationally.
   *
   * @param query - The chat query
   * @returns Chat response with answer and source citations
   */
  chat: async (query: string): Promise<ChatResponse> => {
    const response = await fetch(`${PIA_API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to chat: ${response.statusText}`
      );
    }

    return response.json();
  },


  /**
 * Get progress of an ongoing PIA generation session
 *
 * @param sessionId - PIA session id (same as projectId)
 */
  getPIAProgress: async (
    sessionId: string
  ): Promise<PiaProgressResponse> => {
    const response = await fetch(
      `${PIA_API_BASE_URL}/progress?session_id=${sessionId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
        `Failed to fetch PIA progress: ${response.statusText}`
      );
    }

    return response.json();
  },

};




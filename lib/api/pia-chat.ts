// lib/api/pia-chat.ts

export interface ChatMessage {
  id: string;
  projectId: string;
  type: "user" | "assistant";
  content: string;
  attachments?: Array<{ name: string; type: string }>;
  actions?: Array<{ label: string; value: string }>;
  status?: "pending" | "completed" | "error";
  isActionResponse?: boolean;
  isDraftAccepted?: boolean;
  isSectionSteps?: boolean;
  sectionId?: string;
  createdAt: Date;
}

export interface SaveMessageRequest {
  projectId: string;
  type: "user" | "assistant";
  content: string;
  attachments?: Array<{ name: string; type: string }>;
  actions?: Array<{ label: string; value: string }>;
  status?: "pending" | "completed" | "error";
  isActionResponse?: boolean;
  isDraftAccepted?: boolean;
  isSectionSteps?: boolean;
  sectionId?: string;
}

export interface PiaDocument {
  name: string;
  type: string;
}

export interface ModifyPiaPayload {
  pia_name: string;
  previous_response: string;
  modification_query: string;
  projectId: string;
}

export interface ModifyPiaResponse {
  response: string;
  messageId: string;
}

export interface PiaProgressResponse {
  session_id: string;
  status_list: string[];
  total_steps: number;
  message: string;
}

export interface GetDocumentByCitationResponse {
  url: string;
  name: string;
}

class PIAChatAPI {
  private baseUrl = "/api/pia/chat";

  /* -------------------- Get URL through citation -------------------- */

  async getDocumentByCitation(
    projectId: string,
    citation: string
  ): Promise<GetDocumentByCitationResponse> {
    const response = await fetch(
      `${
        this.baseUrl
      }/doc-citation?projectId=${projectId}&citation=${encodeURIComponent(
        citation
      )}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch document for citation");
    }

    return response.json();
  }

  /* -------------------- Documents -------------------- */

  async getPiaDocs(projectId: string): Promise<PiaDocument[]> {
    const response = await fetch(`${this.baseUrl}/docs?projectId=${projectId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch documents");
    }

    return response.json();
  }

  /* -------------------- Messages -------------------- */

  async getMessages(projectId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}?projectId=${projectId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch messages");
    }

    const messages = await response.json();

    return messages.map((msg: any) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    }));
  }

  async saveMessage(message: SaveMessageRequest): Promise<ChatMessage> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save message");
    }

    const savedMessage = await response.json();

    return {
      ...savedMessage,
      createdAt: new Date(savedMessage.createdAt),
    };
  }

  async clearHistory(projectId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?projectId=${projectId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to clear chat history");
    }
  }

  /* -------------------- PIA Modify -------------------- */

  async modifyResponse(payload: ModifyPiaPayload): Promise<ModifyPiaResponse> {
    const response = await fetch("/api/pia/modify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to modify PIA response");
    }

    return response.json();
  }

  async acceptDraft(
    messageId: string,
    action?: "replace" | "append"
  ): Promise<ChatMessage> {
    const response = await fetch(`${this.baseUrl}/accept-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, action }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to accept draft");
    }

    const updatedMessage = await response.json();
    return {
      ...updatedMessage,
      createdAt: new Date(updatedMessage.createdAt),
    };
  }

  async getProgress(sessionId: string): Promise<PiaProgressResponse> {
    const response = await fetch(
      `${this.baseUrl}/progress?session_id=${sessionId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch PIA progress");
    }

    return response.json();
  }
}

export const piaChatApi = new PIAChatAPI();

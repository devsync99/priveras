// lib/api/pia-sections.ts
import type { PIASection } from "@/lib/types";

export const piaSectionsApi = {
  // Check if section exists and is accepted
  checkSection: async (
    projectId: string,
    sectionType: string
  ): Promise<{
    exists: boolean;
    isAccepted: boolean;
    sectionId?: string;
    sectionName?: string;
  }> => {
    const response = await fetch(
      `/api/pia/sections/check?projectId=${projectId}&sectionType=${encodeURIComponent(
        sectionType
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to check section: ${response.statusText}`
      );
    }

    return response.json();
  },

  // Generate a new PIA section
  generateSection: async (
    projectId: string,
    sectionType: string,
    sectionName: string,
    query: string,
    action?: "replace" | "append"
  ): Promise<PIASection> => {
    const response = await fetch("/api/pia/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        sectionType,
        sectionName,
        query,
        action,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to generate section: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.section;
  },

  // Get all sections for a project
  getSections: async (projectId: string): Promise<PIASection[]> => {
    const response = await fetch(`/api/pia/generate?projectId=${projectId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch sections: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.sections;
  },

  // Get section statuses for all PIA steps
  getSectionStatuses: async (
    projectId: string
  ): Promise<{
    [sectionType: string]: { exists: boolean; isAccepted: boolean };
  }> => {
    const response = await fetch(
      `/api/pia/sections/status?projectId=${projectId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to fetch section statuses: ${response.statusText}`
      );
    }

    return response.json();
  },

  // Get a specific section with history
  getSection: async (sectionId: string): Promise<any> => {
    const response = await fetch(`/api/pia/sections/${sectionId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch section: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.section;
  },

  // Update section status or content
  updateSection: async (
    sectionId: string,
    updates: { status?: string; content?: string }
  ): Promise<PIASection> => {
    const response = await fetch(`/api/pia/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update section: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.section;
  },

  // Delete a section
  deleteSection: async (sectionId: string): Promise<void> => {
    const response = await fetch(`/api/pia/sections/${sectionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to delete section: ${response.statusText}`
      );
    }
  },

  // Complete PIA and cleanup
  completePIA: async (projectId: string): Promise<any> => {
    const response = await fetch("/api/pia/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to complete PIA: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  },
};

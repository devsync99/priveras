// lib/api/projects.ts
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/types";

export type { Project, CreateProjectInput, UpdateProjectInput };

export const projectsApi = {
  // Fetch all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();
    return data.projects;
  },

  // Create a new project
  createProject: async (input: CreateProjectInput): Promise<Project> => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Failed to create project");
    }
    const data = await response.json();
    return data.project;
  },

  // Update a project
  updateProject: async (
    id: string,
    input: UpdateProjectInput
  ): Promise<Project> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Failed to update project");
    }
    const data = await response.json();
    return data.project;
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete project");
    }
  },
};

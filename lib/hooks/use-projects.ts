// lib/hooks/use-projects.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  projectsApi,
  type CreateProjectInput,
  type UpdateProjectInput,
  type Project,
} from "@/lib/api/projects";

// Query keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters?: unknown) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Fetch all projects
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getProjects,
  });
}

// Create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.createProject(input),
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      // Optimistically add the new project to the cache
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old ? [newProject, ...old] : [newProject];
      });

      toast.success("Project created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

// Update a project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsApi.updateProject(id, input),
    onSuccess: (updatedProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      // Update the specific project in the cache
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old
          ? old.map((project) =>
              project.id === updatedProject.id ? updatedProject : project
            )
          : [updatedProject];
      });

      toast.success("Project updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

// Delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      // Optimistically remove the project from the cache
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old ? old.filter((project) => project.id !== deletedId) : [];
      });

      toast.success("Project deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}

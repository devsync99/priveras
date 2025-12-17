// Example: Using React Query in other components
// This file demonstrates patterns for using React Query throughout the app

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============================================
// Example 1: Simple Query Hook
// ============================================

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: async () => {
      const response = await fetch("/api/user/current");
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json() as Promise<User>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage in component:
// const { data: user, isLoading, error } = useCurrentUser();

// ============================================
// Example 2: Query with Parameters
// ============================================

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
}

export function useProjectMessages(projectId: string | null) {
  return useQuery({
    queryKey: ["messages", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/projects/${projectId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      return data.messages as ChatMessage[];
    },
    enabled: !!projectId, // Only run query if projectId exists
  });
}

// Usage:
// const { data: messages = [] } = useProjectMessages(selectedProjectId);

// ============================================
// Example 3: Mutation with Optimistic Update
// ============================================

interface SendMessageInput {
  projectId: string;
  content: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      const response = await fetch(
        `/api/projects/${input.projectId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: input.content }),
        }
      );
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    // Optimistic update
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["messages", input.projectId],
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        "messages",
        input.projectId,
      ]);

      // Optimistically update cache
      queryClient.setQueryData<ChatMessage[]>(
        ["messages", input.projectId],
        (old = []) => [
          ...old,
          {
            id: "temp-" + Date.now(),
            content: input.content,
            createdAt: new Date().toISOString(),
          },
        ]
      );

      return { previousMessages };
    },
    // On error, rollback
    onError: (err, input, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", input.projectId],
          context.previousMessages
        );
      }
      toast.error("Failed to send message");
    },
    // Always refetch after error or success
    onSettled: (data, error, input) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", input.projectId],
      });
    },
  });
}

// Usage:
// const sendMessage = useSendMessage();
// sendMessage.mutate({ projectId: "123", content: "Hello" });

// ============================================
// Example 4: Dependent Queries
// ============================================

export function useProjectDetails(projectId: string | null) {
  // First query - get project
  const projectQuery = useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      return response.json();
    },
    enabled: !!projectId,
  });

  // Second query - dependent on first
  const documentsQuery = useQuery({
    queryKey: ["documents", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: !!projectId && !!projectQuery.data, // Only run if project exists
  });

  return {
    project: projectQuery.data,
    documents: documentsQuery.data,
    isLoading: projectQuery.isLoading || documentsQuery.isLoading,
  };
}

// ============================================
// Example 5: Infinite Query (Pagination)
// ============================================

import { useInfiniteQuery } from "@tanstack/react-query";

interface MessagePage {
  messages: ChatMessage[];
  hasMore: boolean;
  nextPage: number;
}

export function useInfiniteMessages(projectId: string) {
  return useInfiniteQuery({
    queryKey: ["messages", "infinite", projectId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/projects/${projectId}/messages?page=${pageParam}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<MessagePage>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: MessagePage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
  });
}

// Usage:
// const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMessages(projectId);

// ============================================
// Example 6: Prefetching Data
// ============================================

export function usePrefetchProject() {
  const queryClient = useQueryClient();

  const prefetchProject = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["projects", projectId],
      queryFn: async () => {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error("Failed to fetch project");
        return response.json();
      },
      staleTime: 60 * 1000, // Consider data fresh for 1 minute
    });
  };

  return { prefetchProject };
}

// Usage in a list item hover:
// const { prefetchProject } = usePrefetchProject();
// <div onMouseEnter={() => prefetchProject(project.id)}>

// ============================================
// Example 7: Manual Cache Manipulation
// ============================================

export function useProjectCache() {
  const queryClient = useQueryClient();

  const updateProjectInCache = (projectId: string, updates: Partial<any>) => {
    queryClient.setQueryData(["projects", projectId], (old: any) => ({
      ...old,
      ...updates,
    }));
  };

  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const removeProjectFromCache = (projectId: string) => {
    queryClient.removeQueries({ queryKey: ["projects", projectId] });
  };

  return {
    updateProjectInCache,
    invalidateProjects,
    removeProjectFromCache,
  };
}

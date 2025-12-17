# TanStack React Query Setup

This project uses [TanStack React Query](https://tanstack.com/query/latest) (formerly React Query) for efficient server state management.

## 📁 Project Structure

```
lib/
├── api/
│   └── projects.ts          # API client functions
├── hooks/
│   └── use-projects.ts      # React Query hooks
├── providers/
│   └── react-query-provider.tsx  # QueryClient provider
└── types/
    └── index.ts             # TypeScript type definitions
```

## 🚀 Setup Overview

### 1. QueryClient Provider

The `ReactQueryProvider` is configured in `lib/providers/react-query-provider.tsx` with the following defaults:

- **staleTime**: 1 minute (60,000ms) - reduces refetches on client
- **refetchOnWindowFocus**: false - prevents refetch when window regains focus
- **retry**: 1 - retries failed requests once
- Includes React Query DevTools in development

### 2. API Client Layer

Located in `lib/api/projects.ts`, this provides typed API functions:

- `getProjects()` - Fetch all projects
- `createProject(input)` - Create a new project
- `updateProject(id, input)` - Update a project
- `deleteProject(id)` - Delete a project

### 3. Custom Hooks

Located in `lib/hooks/use-projects.ts`:

#### `useProjects()`

Fetches all projects with automatic caching and refetching.

```tsx
const { data: projects, isLoading, error } = useProjects();
```

#### `useCreateProject()`

Creates a new project with optimistic updates.

```tsx
const createProject = useCreateProject();
createProject.mutate({ projectTitle: "New Project", status: "Draft" });
```

#### `useUpdateProject()`

Updates a project with automatic cache invalidation.

```tsx
const updateProject = useUpdateProject();
updateProject.mutate({ id: "123", input: { status: "In Progress" } });
```

#### `useDeleteProject()`

Deletes a project with optimistic cache updates.

```tsx
const deleteProject = useDeleteProject();
deleteProject.mutate("project-id");
```

## 📖 Usage Examples

### Basic Query Usage

```tsx
"use client";

import { useProjects } from "@/lib/hooks/use-projects";

export function ProjectList() {
  const { data: projects = [], isLoading, error } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>{project.projectTitle}</li>
      ))}
    </ul>
  );
}
```

### Mutation Usage

```tsx
"use client";

import { useState } from "react";
import { useCreateProject } from "@/lib/hooks/use-projects";

export function CreateProjectForm() {
  const [title, setTitle] = useState("");
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(
      { projectTitle: title, status: "Draft" },
      {
        onSuccess: (newProject) => {
          console.log("Created:", newProject);
          setTitle("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title"
      />
      <button type="submit" disabled={createProject.isPending}>
        {createProject.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

## 🎯 Key Features

### Automatic Caching

React Query automatically caches server data and serves it from cache when available, reducing unnecessary network requests.

### Optimistic Updates

Mutations update the cache immediately before the server responds, providing instant UI feedback.

### Background Refetching

Queries can be configured to refetch in the background to keep data fresh.

### DevTools

React Query DevTools are available in development mode (press the React Query icon in the corner).

## 🔑 Query Keys Structure

Query keys follow a hierarchical pattern for easy invalidation:

```typescript
projectKeys.all; // ['projects']
projectKeys.lists(); // ['projects', 'list']
projectKeys.details(); // ['projects', 'detail']
projectKeys.detail(id); // ['projects', 'detail', id]
```

## 🛠️ Adding New Queries

### 1. Add API Function

In `lib/api/[resource].ts`:

```typescript
export const resourceApi = {
  getResource: async (id: string) => {
    const response = await fetch(`/api/resource/${id}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  },
};
```

### 2. Create Custom Hook

In `lib/hooks/use-[resource].ts`:

```typescript
export function useResource(id: string) {
  return useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceApi.getResource(id),
  });
}
```

### 3. Use in Component

```tsx
const { data, isLoading } = useResource(resourceId);
```

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TypeScript Guide](https://tanstack.com/query/latest/docs/framework/react/typescript)
- [Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/best-practices)

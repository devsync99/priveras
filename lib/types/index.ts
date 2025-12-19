// lib/types/index.ts
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Session {
  user: User;
}

export interface Project {
  id: string;
  projectTitle: string;
  status: string;
  createdAt: string;
  userId: string;
}

export interface CreateProjectInput {
  projectTitle: string;
  status?: string;
}

export interface UpdateProjectInput {
  projectTitle?: string;
  status?: string;
}

export interface PIASection {
  id: string;
  projectId: string;
  sectionType: string;
  sectionName: string;
  content: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  generatedBy?: string;
}

export interface PIASectionHistory {
  id: string;
  sectionId: string;
  content: string;
  version: number;
  modifiedBy?: string;
  modificationQuery?: string;
  createdAt: string;
}

// PIA API Types
export interface ChunkInfo {
  file_name: string;
  page: number | string | null;
  chunk_content: string;
}

export interface StartPIAResponse {
  response: string;
}

export interface PIAGenerateResponse {
  response: string;
}

export interface GeneratePIARequest {
  pia_name: string;
  query: string;
  session_id: string;
  history: {
    role: string;
    content: string;
  }[];
}


export interface ModifyPIARequest {
  pia_name: string;
  section: string;
  previous_response: string;
  modification_query: string;
}

export interface CompletePIAResponse {
  pia_name: string;
  message: string;
  documents_deleted: number;
}

export interface ChatResponse {
  answer: string;
  chunks_used: ChunkInfo[];
  num_chunks: number;
}


export interface PiaProgressResponse {
  session_id: string;
  status_list: string[];
  total_steps: number;
  message: string;
}

# PIA API Integration Documentation

## Overview

This document describes the integration of the Priveras AI Engine PIA API into the Priveras application. The PIA API provides AI-powered document processing and Privacy Impact Assessment generation capabilities.

## API Endpoint

**Base URL**: `http://3.98.57.146:8000`  
**Documentation**: http://3.98.57.146:8000/docs

## API Integration Summary

### 1. PIA Start API (`/pia/start`)

**Purpose**: Initialize a new PIA assessment by uploading project documents.

**Request**:

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `files`: Array of files (PDF, DOCX, XLSX, CSV, VSDX, PPTX, images)
  - `pia_name`: Unique identifier for the PIA (e.g., project ID)

**Response**:

```typescript
{
  response: string; // Brief summary and confirmation message
}
```

**Behavior**:

- Documents are processed and stored in Qdrant vector database
- Each document is tagged with the `pia_name` for later retrieval
- The API uses RAG (Retrieval Augmented Generation) to enable document-based question answering

### 2. Other Available Endpoints

#### Generate PIA Section (`/pia/generate`)

- **Purpose**: Generate specific PIA sections or answer custom queries
- **Predefined sections**:
  - `project_description`: Project overview, purpose, scope
  - `privacy_analysis`: Privacy analysis against regulations
  - `risk_assessment`: Security risks and mitigations
  - `appendix_d`: Data flow charts

#### Modify PIA Section (`/pia/modify`)

- **Purpose**: Modify previously generated sections with refinement requests

#### Complete PIA (`/pia/complete`)

- **Purpose**: Finalize PIA and cleanup documents from vector database

#### Get Section Prompt (`/pia/prompt/{section_name}`)

- **Purpose**: Retrieve the system prompt used for a specific section

#### Chat (`/chat`)

- **Purpose**: Simple conversational interface for querying documents

## Implementation Details

### Files Created/Modified

#### 1. **lib/types/index.ts**

Added TypeScript interfaces for all PIA API types:

- `StartPIAResponse`
- `PIAGenerateResponse`
- `GeneratePIARequest`
- `ModifyPIARequest`
- `CompletePIAResponse`
- `ChatResponse`
- `ChunkInfo`

#### 2. **lib/api/pia.ts** (NEW)

Created comprehensive API client module with methods for:

- `startPIA(files, piaName)` - Upload documents and start PIA
- `generatePIA(request)` - Generate PIA sections
- `modifyPIASection(request)` - Modify existing sections
- `completePIA(piaName)` - Complete and cleanup PIA
- `getSectionPrompt(sectionName)` - Get section prompts
- `chat(query)` - Simple chat interface

**Key Features**:

- Proper error handling with descriptive messages
- FormData handling for file uploads
- Type-safe API calls
- Configurable base URL via environment variable

#### 3. **.env.local**

Added PIA API configuration:

```
NEXT_PUBLIC_PIA_API_URL="http://3.98.57.146:8000"
```

#### 4. **components/pia/chat-panel.tsx**

Updated to integrate real API:

- Import `piaApi` client
- Modified `handleFileUpload()` to attach files for batch upload
- Replaced `handleExecutePIA()` with real API call:
  - Calls `piaApi.startPIA()` with files and project ID
  - Displays API response to user
  - Comprehensive error handling with toast notifications
  - Success feedback with section selection options

## User Flow

### Current Implementation:

1. **User uploads files** → Files are attached (not yet uploaded)
2. **User clicks "Execute PIA"** → Triggers `handleExecutePIA()`
3. **API call to `/pia/start`** → Uploads files with project ID as `pia_name`
4. **API processes documents** → Stores in Qdrant with RAG indexing
5. **Success response** → User sees confirmation and section options
6. **User selects section** → Ready for future integration with `/pia/generate`

## Integration Points for Future Development

### 1. Generate Sections

When user clicks a PIA section button, call:

```typescript
const response = await piaApi.generatePIA({
  pia_name: selectedProject,
  query: "project_description", // or other section name
});
```

### 2. Modify Sections

Allow users to refine generated content:

```typescript
const response = await piaApi.modifyPIASection({
  pia_name: selectedProject,
  section: "project_description",
  previous_response: previousContent,
  modification_query: "Make it more concise",
});
```

### 3. Complete PIA

When PIA is finalized, cleanup resources:

```typescript
const response = await piaApi.completePIA(selectedProject);
// Deletes all documents from vector database
```

## Error Handling

The integration includes comprehensive error handling:

- **Network errors**: Caught and displayed to user
- **API errors**: Parsed error details from response
- **Validation errors**: User-friendly messages via toast notifications
- **File type validation**: Only allowed file types accepted

## Security Considerations

1. **Environment Variables**: API URL is configurable via environment variable
2. **File Validation**: Only specific file types are allowed
3. **Error Messages**: No sensitive information exposed in error messages
4. **Project Isolation**: Each PIA is isolated by project ID

## Testing the Integration

### Manual Testing Steps:

1. Start the development server: `npm run dev`
2. Navigate to the PIA Assistant dashboard
3. Select or create a project
4. Upload project documents (PDF, DOCX, etc.)
5. Click "Execute PIA"
6. Verify:
   - Loading state appears
   - Success toast notification
   - API response displayed
   - Section buttons appear

### Expected Behavior:

- Files upload successfully to PIA API
- Documents are processed and stored in Qdrant
- User receives confirmation message
- PIA sections become available for generation

## API Response Examples

### Successful Start:

```json
{
  "response": "Successfully processed 3 documents for PIA 'project-123'. Documents indexed and ready for section generation."
}
```

### Error Response:

```json
{
  "detail": "Invalid file type. Only PDF, DOCX, XLSX, CSV, VSDX, and PPTX are supported."
}
```

## Implementation Status

### ✅ Completed Features

1. **✅ Integrate Generate API**: Section buttons now call `/pia/generate` endpoint

   - Real-time section generation using AI
   - Content stored in database with versioning
   - Error handling and loading states

2. **✅ Add Modify Functionality**: Users can refine generated sections

   - Modal interface for modification requests
   - AI-powered content refinement
   - Version history tracking

3. **✅ Implement Complete API**: Cleanup when PIA is finalized

   - Mark PIA as complete
   - Cleanup documents from vector database
   - Update project status

4. **✅ Store Generated Content**: Sections saved to database

   - Prisma schema for PIA sections
   - Version control and history
   - Status tracking (Draft, Review, Approved)

5. **✅ Add Export Functionality**: Export completed PIA documents
   - Multiple formats: Markdown, HTML, Text, JSON
   - Professional formatting
   - Download as file

### 🔄 Future Enhancements

1. **Add Chat Interface**: Integrate `/chat` endpoint for conversational queries
2. **PDF Export**: Generate PDF documents using a library like Puppeteer
3. **Word Export**: Export to DOCX format
4. **Collaboration Features**: Multi-user editing and comments
5. **Templates**: Pre-defined PIA templates for different industries
6. **Analytics**: Track time spent, completion rates, etc.

## Troubleshooting

### Issue: API connection fails

- **Check**: Ensure PIA API server is running at `http://3.98.57.146:8000`
- **Check**: Environment variable `NEXT_PUBLIC_PIA_API_URL` is set correctly
- **Check**: Network connectivity to API server

### Issue: File upload fails

- **Check**: File types are supported (PDF, DOCX, XLSX, CSV, VSDX, PPTX)
- **Check**: File sizes are within reasonable limits
- **Check**: FormData is properly constructed

### Issue: CORS errors

- **Solution**: Ensure PIA API has CORS configured for your domain
- **Solution**: Check browser console for specific CORS error messages

## Database Schema

### PIASection Table

Stores generated PIA sections with version control.

### PIASectionHistory Table

Tracks version history for audit and rollback.

## New API Routes

### POST `/api/pia/generate` - Generate or update section

### POST `/api/pia/modify` - Modify existing section

### POST `/api/pia/complete` - Complete PIA and cleanup

### GET `/api/pia/export` - Export PIA (markdown, html, txt, json)

### GET/PATCH/DELETE `/api/pia/sections/[id]` - Section CRUD operations

## New Components

- **ModifySectionModal**: Modal for section refinement
- **PIAActionsBar**: Bottom action bar with export and complete
- **PIA Sections API Client**: `lib/api/pia-sections.ts`

## Usage Flow

1. Upload documents → PIA Start API
2. Click section button → Generate API creates section in DB
3. View/modify content → Modify API updates with AI
4. Export → Download in preferred format
5. Complete → Mark done and cleanup vectors

## References

- **API Documentation**: http://3.98.57.146:8000/docs
- **OpenAPI Spec**: http://3.98.57.146:8000/openapi.json
- **PIA API Client**: `lib/api/pia.ts`
- **PIA Sections API**: `lib/api/pia-sections.ts`
- **Type Definitions**: `lib/types/index.ts`
- **Prisma Schema**: `prisma/schema.prisma`

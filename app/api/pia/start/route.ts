import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const PIA_API_BASE_URL =
  process.env.NEXT_PUBLIC_PIA_API_URL || "http://35.182.60.58:8000";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const projectId = formData.get("project_id") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "No project ID provided" },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.pIAProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create new FormData for the external API call
    const externalFormData = new FormData();

    // Append all files
    files.forEach((file) => {
      externalFormData.append("files", file);
    });

    // Use project ID as the PIA name
    externalFormData.append("pia_name", projectId);

    // Forward request to external PIA API
    const response = await fetch(`${PIA_API_BASE_URL}/pia/start`, {
      method: "POST",
      body: externalFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to start PIA: ${response.statusText}`
      );
    }

    const result = await response.json();

    // Update project with uploaded files metadata
    await prisma.pIAProject.update({
      where: { id: projectId },
      data: {
        uploadedFiles: files.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error starting PIA:", error);
    return NextResponse.json(
      {
        error: "Failed to start PIA",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

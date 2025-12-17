// app/api/pia/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { piaApi } from "@/lib/api/pia";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.pIAProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Call PIA API to cleanup documents from vector database
    const piaResponse = await piaApi.completePIA(projectId);

    // Update project status to Completed
    const updatedProject = await prisma.pIAProject.update({
      where: { id: projectId },
      data: {
        status: "Completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      cleanup: piaResponse,
    });
  } catch (error) {
    console.error("Error completing PIA:", error);
    return NextResponse.json(
      {
        error: "Failed to complete PIA",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

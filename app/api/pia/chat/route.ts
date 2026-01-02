// app/api/pia/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET - Get chat messages for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

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
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Get chat messages
    const messages = await prisma.pIAChatMessage.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

// POST - Save a chat message
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      type,
      content,
      attachments,
      actions,
      status,
      isActionResponse,
      isSectionSteps,
      sectionId,
    } = body;

    if (!projectId || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Save chat message
    const message = await prisma.pIAChatMessage.create({
      data: {
        projectId,
        type,
        content,
        attachments: attachments || undefined,
        actions: actions || undefined,
        status: status || null,
        isActionResponse: isActionResponse || false,
        isSectionSteps: isSectionSteps || false,
        sectionId: sectionId || null,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving chat message:", error);
    return NextResponse.json(
      { error: "Failed to save chat message" },
      { status: 500 }
    );
  }
}

// DELETE - Clear chat history for a project
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

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
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Delete all chat messages for the project
    await prisma.pIAChatMessage.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat messages:", error);
    return NextResponse.json(
      { error: "Failed to delete chat messages" },
      { status: 500 }
    );
  }
}

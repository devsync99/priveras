// app/api/pia/sections/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sectionId } = await params;

    // Get section with history
    const section = await prisma.pIASection.findFirst({
      where: {
        id: sectionId,
      },
      include: {
        project: true,
        history: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (section.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      section: section,
    });
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch section",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sectionId } = await params;
    const body = await request.json();
    const { status, content } = body;

    // Get section and verify ownership
    const section = await prisma.pIASection.findFirst({
      where: {
        id: sectionId,
      },
      include: {
        project: true,
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (section.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update section
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (content) {
      // Create history entry before updating content
      await prisma.pIASectionHistory.create({
        data: {
          sectionId: section.id,
          content: section.content,
          version: section.version,
          modifiedBy: session.user.id,
        },
      });

      updateData.content = content;
      updateData.version = section.version + 1;
      updateData.generatedBy = session.user.id;
    }

    const updatedSection = await prisma.pIASection.update({
      where: { id: sectionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      section: updatedSection,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      {
        error: "Failed to update section",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sectionId } = await params;

    // Get section and verify ownership
    const section = await prisma.pIASection.findFirst({
      where: {
        id: sectionId,
      },
      include: {
        project: true,
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (section.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete section (will cascade delete history)
    await prisma.pIASection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      {
        error: "Failed to delete section",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

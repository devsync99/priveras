// app/api/pia/sections/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const sectionType = searchParams.get("sectionType");

    if (!projectId || !sectionType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.pIAProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if section exists
    const section = await prisma.pIASection.findFirst({
      where: {
        projectId,
        sectionType,
      },
      orderBy: {
        createdAt: "desc", // Get the most recent section of this type
      },
    });

    if (!section) {
      return NextResponse.json({ exists: false, isAccepted: false });
    }

    // Check if there's an accepted draft for ANY section of this type
    // This is important because regenerating creates a new section with new ID
    const allSectionsOfType = await prisma.pIASection.findMany({
      where: {
        projectId,
        sectionType,
      },
      select: {
        id: true,
      },
    });

    const sectionIds = allSectionsOfType.map((s) => s.id);

    const acceptedMessage = await prisma.pIAChatMessage.findFirst({
      where: {
        sectionId: {
          in: sectionIds, // Check if any section of this type has an accepted message
        },
        type: "assistant",
        isDraftAccepted: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      exists: true,
      isAccepted: !!acceptedMessage,
      sectionId: section.id,
      sectionName: section.sectionName,
    });
  } catch (error) {
    console.error("Error checking section:", error);
    return NextResponse.json(
      {
        error: "Failed to check section",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

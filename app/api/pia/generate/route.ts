// app/api/pia/generate/route.ts
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
    const { projectId, sectionType, sectionName, query } = body;

    if (!projectId || !sectionType || !query) {
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
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Call PIA API to generate content
    const piaResponse = await piaApi.generatePIA({
      pia_name: projectId,
      query: query,
    });

    // Check if section already exists
    let section = await prisma.pIASection.findFirst({
      where: {
        projectId: projectId,
        sectionType: sectionType,
      },
    });

    if (section) {
      // Create history entry for the old version
      await prisma.pIASectionHistory.create({
        data: {
          sectionId: section.id,
          content: section.content,
          version: section.version,
          modifiedBy: session.user.id,
        },
      });

      // Update existing section
      section = await prisma.pIASection.update({
        where: { id: section.id },
        data: {
          content: piaResponse.response,
          version: section.version + 1,
          updatedAt: new Date(),
          generatedBy: "AI",
        },
      });
    } else {
      // Create new section
      section = await prisma.pIASection.create({
        data: {
          projectId: projectId,
          sectionType: sectionType,
          sectionName: sectionName || sectionType,
          content: piaResponse.response,
          generatedBy: "AI",
        },
      });
    }

    return NextResponse.json({
      success: true,
      section: section,
    });
  } catch (error) {
    console.error("Error generating PIA section:", error);
    return NextResponse.json(
      {
        error: "Failed to generate section",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get all sections for the project
    const sections = await prisma.pIASection.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      sections: sections,
    });
  } catch (error) {
    console.error("Error fetching PIA sections:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sections",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

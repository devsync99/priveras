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
    const { projectId, sectionType, sectionName, query, action } = body;

    if (!projectId || !sectionType || !query) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // 🔹 Fetch chat history for this PIA project
    const chatHistory = await prisma.pIAChatMessage.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        type: true,
        content: true,
      },
    });

    // 🔹 Map DB records to API history format
    const history = chatHistory.map((msg) => ({
      role: msg.type, // "user" | "assistant"
      content: msg.content,
    }));

    // 🔹 Call PIA API with updated payload
    const piaResponse = await piaApi.generatePIA({
      pia_name: projectId,
      query: query,
      session_id: projectId,
      history: history,
    });

    // Check if section already exists
    let section = await prisma.pIASection.findFirst({
      where: {
        projectId,
        sectionType,
      },
    });

    if (section) {
      // Determine behavior based on action parameter
      if (action === "append") {
        // Create a new section with a versioned name
        const existingSections = await prisma.pIASection.findMany({
          where: {
            projectId,
            sectionType,
          },
        });

        const newVersion = existingSections.length + 1;
        const versionedName = `${
          sectionName || sectionType
        } (Version ${newVersion})`;

        section = await prisma.pIASection.create({
          data: {
            projectId,
            sectionType,
            sectionName: versionedName,
            content: piaResponse.response,
            version: newVersion,
            generatedBy: "AI",
          },
        });
      } else {
        // Default behavior: replace (update existing section)
        // Save previous version to history
        await prisma.pIASectionHistory.create({
          data: {
            sectionId: section.id,
            content: section.content,
            version: section.version,
            modifiedBy: session.user.id,
          },
        });

        section = await prisma.pIASection.update({
          where: { id: section.id },
          data: {
            content: piaResponse.response,
            version: section.version + 1,
            updatedAt: new Date(),
            generatedBy: "AI",
          },
        });
      }
    } else {
      section = await prisma.pIASection.create({
        data: {
          projectId,
          sectionType,
          sectionName: sectionName || sectionType,
          content: piaResponse.response,
          generatedBy: "AI",
        },
      });
    }

    return NextResponse.json({
      success: true,
      section,
      history,
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

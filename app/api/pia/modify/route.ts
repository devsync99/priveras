import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/session";
import { piaApi } from "@/lib/api/pia";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      pia_name,
      previous_response,
      modification_query,
      projectId,
    } = body;

    if (
      !pia_name ||
      !previous_response ||
      !modification_query ||
      !projectId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Call external PIA API
    const modifiedResponse = await piaApi.modifyPiaResponse(
      pia_name,
      previous_response,
      modification_query
    );

    // 2. Save assistant message (IMPORTANT: null, not {})
    const savedMessage = await prisma.pIAChatMessage.create({
      data: {
        projectId,
        type: "assistant",
        content: modifiedResponse,
        attachments: Prisma.JsonNull,
        actions: Prisma.JsonNull,
        status: "completed",
        isActionResponse: false,
      },
    });

    return NextResponse.json({
      response: modifiedResponse,
      messageId: savedMessage.id,
    });
  } catch (error) {
    console.error("Error modifying PIA response:", error);

    return NextResponse.json(
      {
        error: "Failed to modify PIA response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

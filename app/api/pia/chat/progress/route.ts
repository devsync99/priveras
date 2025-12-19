import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { piaApi } from "@/lib/api/pia";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    // session_id === projectId
    const project = await prisma.pIAProject.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // 🔹 Call external PIA progress API
    const progress = await piaApi.getPIAProgress(sessionId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching PIA progress:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch PIA progress",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

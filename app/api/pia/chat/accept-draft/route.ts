// app/api/pia/chat/accept-draft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Update message in DB
    const updatedMessage = await prisma.pIAChatMessage.update({
      where: { id: messageId },
      data: { isDraftAccepted: true },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error accepting draft:", error);
    return NextResponse.json({ error: "Failed to accept draft" }, { status: 500 });
  }
}

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

    const { messageId, action } = await request.json();
    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Get the message first to find the section
    const message = await prisma.pIAChatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update message in DB
    const updatedMessage = await prisma.pIAChatMessage.update({
      where: { id: messageId },
      data: { isDraftAccepted: true },
    });

    // If the message is linked to a section, mark the section as Approved
    // and handle replace vs append logic
    if (message.sectionId) {
      const section = await prisma.pIASection.findUnique({
        where: { id: message.sectionId },
      });

      if (section) {
        if (action === "append") {
          // Create a new section version with the new content
          const existingSections = await prisma.pIASection.findMany({
            where: {
              projectId: message.projectId,
              sectionType: section.sectionType,
            },
          });

          const newVersion = existingSections.length + 1;
          const versionedName = `${section.sectionName} (Version ${newVersion})`;

          const newSection = await prisma.pIASection.create({
            data: {
              projectId: message.projectId,
              sectionType: section.sectionType,
              sectionName: versionedName,
              content: section.content,
              version: newVersion,
              generatedBy: "AI",
              status: "Approved",
            },
          });

          // Update the message to link to the new section
          await prisma.pIAChatMessage.update({
            where: { id: messageId },
            data: { sectionId: newSection.id },
          });
        } else {
          // Replace: Unmark all other previously accepted messages for this section

          await prisma.pIAChatMessage.updateMany({
            where: {
              projectId: message.projectId,
              sectionId: message.sectionId,
              isDraftAccepted: true,
              NOT: {
                id: messageId, // Don't unmark the current message
              },
            },
            data: {
              isDraftAccepted: false,
            },
          });

          await prisma.pIASection.update({
            where: { id: message.sectionId },
            data: { status: "Approved" },
          });
        }
      }
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error accepting draft:", error);
    return NextResponse.json(
      { error: "Failed to accept draft" },
      { status: 500 }
    );
  }
}

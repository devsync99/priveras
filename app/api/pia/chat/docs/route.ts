// app/api/pia/chat/docs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Prisma } from "@prisma/client";

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

        const project = await prisma.pIAProject.findFirst({
            where: { id: projectId, userId: session.user.id },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or access denied" },
                { status: 404 }
            );
        }

        const messages = await prisma.pIAChatMessage.findMany({
            where: {
                projectId,
                attachments: {
                    not: Prisma.JsonNull,
                },
            },
            select: {
                attachments: true,
            },
        });

        const docsMap = new Map<string, any>();

        messages.forEach((msg) => {
            const attachments = msg.attachments as any[] | null;
            attachments?.forEach((file) => {
                if (!docsMap.has(file.name)) {
                    docsMap.set(file.name, file);
                }
            });
        });

        return NextResponse.json([...docsMap.values()]);
    } catch (error) {
        console.error("Error fetching PIA documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch PIA documents" },
            { status: 500 }
        );
    }
}

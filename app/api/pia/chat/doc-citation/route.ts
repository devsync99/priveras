// app/api/pia/chat/doc-citation/route.ts
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
    const citation = searchParams.get("citation");

    if (!projectId || !citation) {
      return NextResponse.json(
        { error: "Project ID and citation are required" },
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

    const uploadedFiles: Array<{
      url: string;
      name: string;
      size: number;
      type: string;
    }> = Array.isArray(project.uploadedFiles)
      ? (project.uploadedFiles as Array<{
          url: string;
          name: string;
          size: number;
          type: string;
        }>)
      : [];

    // Extract the "source" from citation like "[Source 14, Page 1]"
    const match = citation.match(/\[?([^\]]+)\]?/);
    if (!match) {
      return NextResponse.json({ error: "Invalid citation format" }, { status: 400 });
    }

    const source = match[1].trim().split(",")[0]; // Take only the source part
    // Find file that contains the source string (case-insensitive)
    const file = uploadedFiles.find((f) =>
      f.name.toLowerCase().includes(source.toLowerCase())
    );

    if (!file) {
      return NextResponse.json(
        { error: `Document for '${source}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ url: file.url, name: file.name });
  } catch (error) {
    console.error("Error fetching document by citation:", error);
    return NextResponse.json(
      { error: "Failed to fetch document by citation" },
      { status: 500 }
    );
  }
}

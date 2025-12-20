import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const PIA_API_BASE_URL = process.env.NEXT_PUBLIC_PIA_API_URL || "http://15.222.164.48:8000";

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const projectId = formData.get("project_id") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "No project ID provided" }, { status: 400 });
    }

    // 2️⃣ Verify project ownership
    const project = await prisma.pIAProject.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 3️⃣ Check for duplicate file names in DB
    const existingFiles = (project.uploadedFiles as Array<{ name: string }>) || [];
    for (const file of files) {
      if (existingFiles.find((f) => f.name === file.name)) {
        return NextResponse.json(
          { error: `File "${file.name}" already exists in the project.` },
          { status: 400 }
        );
      }
    }

    // 4️⃣ Prepare external API call
    const externalFormData = new FormData();
    files.forEach((file) => externalFormData.append("files", file));
    externalFormData.append("pia_name", projectId);
    externalFormData.append("session_id", projectId);

    // 5️⃣ Forward request to external PIA API
    const response = await fetch(`${PIA_API_BASE_URL}/pia/start`, {
      method: "POST",
      body: externalFormData,
    });

    const externalResult = await response.json().catch(() => ({}));

    // ❌ If external API failed, stop and do not save anything
    if (!response.ok) {
      return NextResponse.json({
        error: "External PIA API failed. Files not saved.",
        externalResult,
      }, { status: 500 });
    }

    // 6️⃣ Upload files to S3 in parallel with timestamp-based keys
    const uploadedFilesMetadata = await Promise.all(
      files.map(async (file) => {
        const timestamp = Date.now();
        const key = `${projectId}/${timestamp}_${file.name}`;

        const arrayBuffer = await file.arrayBuffer();
        const fileContent = new Uint8Array(arrayBuffer);

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            Body: fileContent,
            ContentType: file.type,
          })
        );

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          url: fileUrl,
        };
      })
    );

    // 7️⃣ Update project DB with uploaded files
    await prisma.pIAProject.update({
      where: { id: projectId },
      data: {
        uploadedFiles: [...existingFiles, ...uploadedFilesMetadata],
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      uploadedFiles: uploadedFilesMetadata,
      externalResult,
    });
  } catch (error) {
    console.error("Error starting PIA:", error);
    return NextResponse.json(
      { error: "Failed to start PIA", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

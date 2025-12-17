// app/api/pia/export/route.ts
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
    const format = searchParams.get("format") || "markdown";

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

    // Get sections for the project
    const sections = await prisma.pIASection.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "No sections to export" },
        { status: 400 }
      );
    }

    // Combine project and sections for export
    const projectWithSections = {
      ...project,
      sections,
    };

    // Generate export content based on format
    let content = "";
    let contentType = "text/plain";
    let filename = `${project.projectTitle.replace(/[^a-z0-9]/gi, "_")}_PIA`;

    if (format === "markdown") {
      contentType = "text/markdown";
      filename += ".md";
      content = generateMarkdown(projectWithSections);
    } else if (format === "html") {
      contentType = "text/html";
      filename += ".html";
      content = generateHTML(projectWithSections);
    } else if (format === "json") {
      contentType = "application/json";
      filename += ".json";
      content = JSON.stringify(projectWithSections, null, 2);
    } else {
      contentType = "text/plain";
      filename += ".txt";
      content = generatePlainText(projectWithSections);
    }

    // Return file as download
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting PIA:", error);
    return NextResponse.json(
      {
        error: "Failed to export PIA",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateMarkdown(project: any): string {
  const now = new Date().toLocaleDateString();

  let markdown = `# Privacy Impact Assessment
## ${project.projectTitle}

**Status:** ${project.status}  
**Created:** ${new Date(project.createdAt).toLocaleDateString()}  
**Last Updated:** ${new Date(project.updatedAt).toLocaleDateString()}  
${
  project.completedAt
    ? `**Completed:** ${new Date(project.completedAt).toLocaleDateString()}  `
    : ""
}
**Exported:** ${now}

---

`;

  project.sections.forEach((section: any, index: number) => {
    markdown += `## ${index + 1}. ${section.sectionName}\n\n`;
    markdown += `**Type:** ${section.sectionType}  \n`;
    markdown += `**Status:** ${section.status}  \n`;
    markdown += `**Version:** ${section.version}  \n`;
    markdown += `**Last Updated:** ${new Date(
      section.updatedAt
    ).toLocaleDateString()}\n\n`;
    markdown += `### Content\n\n`;
    markdown += section.content;
    markdown += `\n\n---\n\n`;
  });

  markdown += `\n\n*This document was automatically generated from the Priveras PIA Assistant.*\n`;

  return markdown;
}

function generateHTML(project: any): string {
  const now = new Date().toLocaleDateString();

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PIA - ${project.projectTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 0.5rem; }
    h2 { color: #7c3aed; margin-top: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h3 { color: #059669; margin-top: 1.5rem; }
    .metadata { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
    .metadata p { margin: 0.25rem 0; }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin: 1.5rem 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .section-meta { font-size: 0.875rem; color: #6b7280; }
    .content { margin-top: 1rem; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem; }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Privacy Impact Assessment</h1>
  <h2>${project.projectTitle}</h2>
  
  <div class="metadata">
    <p><strong>Status:</strong> ${project.status}</p>
    <p><strong>Created:</strong> ${new Date(
      project.createdAt
    ).toLocaleDateString()}</p>
    <p><strong>Last Updated:</strong> ${new Date(
      project.updatedAt
    ).toLocaleDateString()}</p>
    ${
      project.completedAt
        ? `<p><strong>Completed:</strong> ${new Date(
            project.completedAt
          ).toLocaleDateString()}</p>`
        : ""
    }
    <p><strong>Exported:</strong> ${now}</p>
  </div>

`;

  project.sections.forEach((section: any, index: number) => {
    html += `
  <div class="section">
    <div class="section-header">
      <h2>${index + 1}. ${section.sectionName}</h2>
    </div>
    <div class="section-meta">
      <strong>Type:</strong> ${section.sectionType} | 
      <strong>Status:</strong> ${section.status} | 
      <strong>Version:</strong> ${section.version} | 
      <strong>Last Updated:</strong> ${new Date(
        section.updatedAt
      ).toLocaleDateString()}
    </div>
    <div class="content">
      ${section.content}
    </div>
  </div>
`;
  });

  html += `
  <div class="footer">
    <p>This document was automatically generated from the Priveras PIA Assistant.</p>
    <p>© ${new Date().getFullYear()} Priveras. All rights reserved.</p>
  </div>
</body>
</html>`;

  return html;
}

function generatePlainText(project: any): string {
  const now = new Date().toLocaleDateString();

  let text = `PRIVACY IMPACT ASSESSMENT\n`;
  text += `${project.projectTitle}\n`;
  text += `${"=".repeat(80)}\n\n`;

  text += `Status: ${project.status}\n`;
  text += `Created: ${new Date(project.createdAt).toLocaleDateString()}\n`;
  text += `Last Updated: ${new Date(project.updatedAt).toLocaleDateString()}\n`;
  if (project.completedAt) {
    text += `Completed: ${new Date(
      project.completedAt
    ).toLocaleDateString()}\n`;
  }
  text += `Exported: ${now}\n`;
  text += `\n${"=".repeat(80)}\n\n`;

  project.sections.forEach((section: any, index: number) => {
    text += `${index + 1}. ${section.sectionName}\n`;
    text += `${"-".repeat(80)}\n`;
    text += `Type: ${section.sectionType}\n`;
    text += `Status: ${section.status}\n`;
    text += `Version: ${section.version}\n`;
    text += `Last Updated: ${new Date(
      section.updatedAt
    ).toLocaleDateString()}\n\n`;
    text += `CONTENT:\n`;
    text += section.content.replace(/<[^>]*>/g, ""); // Strip HTML tags
    text += `\n\n${"=".repeat(80)}\n\n`;
  });

  text += `\nThis document was automatically generated from the Priveras PIA Assistant.\n`;

  return text;
}

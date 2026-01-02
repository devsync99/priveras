// app/api/pia/sections/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get all sections for this project
    const sections = await prisma.pIASection.findMany({
      where: { projectId },
      select: {
        sectionType: true,
        status: true,
      },
    });

    // Define all possible section types
    const allSectionTypes = [
      "Executive Summary Section",
      "Introduction Section",
      "Project Description",
      "Scope of the Privacy Analysis",
      "Business Processes",
      "IT Systems & Applications",
      "Data Flow & Data Handling",
      "Access Controls",
      "Security Assessments",
      "Privacy Summary or Analysis",
      "Risk Assessment & Mitigation",
      "Appendices",
    ];

    // Create a map of section statuses
    const statusMap: {
      [key: string]: { exists: boolean; isAccepted: boolean };
    } = {};

    allSectionTypes.forEach((sectionType) => {
      const section = sections.find((s) => s.sectionType === sectionType);
      statusMap[sectionType] = {
        exists: !!section,
        isAccepted: section?.status === "Approved",
      };
    });

    return NextResponse.json(statusMap);
  } catch (error) {
    console.error("Failed to get section statuses:", error);
    return NextResponse.json(
      {
        error: "Failed to get section statuses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const PIA_API_BASE_URL =
  process.env.NEXT_PUBLIC_PIA_API_URL || "http://3.98.57.146:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section } = await params;

    if (!section) {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 }
      );
    }

    // Forward request to external PIA API
    const response = await fetch(`${PIA_API_BASE_URL}/pia/prompt/${section}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Failed to get section prompt: ${response.statusText}`
      );
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting section prompt:", error);
    return NextResponse.json(
      {
        error: "Failed to get section prompt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

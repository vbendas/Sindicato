import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate claim types
    const { claimTypes, otherDescription } = body;
    if (
      !claimTypes ||
      (!claimTypes.unpaidWages &&
        !claimTypes.unfairPractices &&
        !claimTypes.retaliation &&
        !claimTypes.other)
    ) {
      return NextResponse.json(
        { error: "Please select at least one claim type" },
        { status: 400 }
      );
    }

    if (claimTypes.other && !otherDescription?.trim()) {
      return NextResponse.json(
        { error: "Please provide a description for 'Other' claim type" },
        { status: 400 }
      );
    }

    // TODO: Validate data and save to Neon DB
    // For now, just log and return success
    console.log("Case submitted:", body);

    // In production:
    // await sql`INSERT INTO cases (...) VALUES (...)`;

    return NextResponse.json(
      { message: "Case submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting case:", error);
    return NextResponse.json(
      { error: "Failed to submit case" },
      { status: 500 }
    );
  }
}

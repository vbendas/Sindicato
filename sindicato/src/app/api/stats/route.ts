import { NextResponse } from "next/server";

const mockStats = {
  totalCases: 1,
  totalUnpaid: 5000,
  activeCompanies: 1,
  workersLegal: 1,
  casesResolved: 0,
  companies: [
    {
      name: "Alignerr / Labelbox",
      caseCount: 1,
      totalUnpaid: 5000,
      wageClaims: 1,
      unfairPracticeClaims: 0,
      retaliationClaims: 0,
      otherClaims: 0,
    },
  ],
};

export async function GET() {
  return NextResponse.json(mockStats);
}

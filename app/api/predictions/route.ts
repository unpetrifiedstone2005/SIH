import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const locationId = searchParams.get('locationId');
    
    const whereClause = locationId ? { locationId: parseInt(locationId) } : {};
    
    const predictions = await prisma.prediction.findMany({
      where: whereClause,
      include: {
        location: true,
        sourceReading: true,
        alerts: true,
      },
      orderBy: {
        predictionTimestamp: 'desc'
      },
      take: limit
    });
    
    return NextResponse.json({
      predictions,
      count: predictions.length
    });
    
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch predictions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use GET to retrieve predictions." },
    { status: 405 }
  );
}

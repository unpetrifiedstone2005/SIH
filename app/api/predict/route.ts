import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { PrismaClient } from "../../generated/prisma";

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to parse prediction output
function parsePredictionOutput(predictionString: string) {
  // Extract risk percentage from string like "The chance of rockfall is 84.5299%. Top contributing factors: ..."
  const riskMatch = predictionString.match(/The chance of rockfall is ([\d.]+)%/);
  const riskScore = riskMatch ? parseFloat(riskMatch[1]) : 0;

  // Extract contributing factors
  const factorsMatch = predictionString.match(/Top contributing factors: (.+)/);
  const factorsText = factorsMatch ? factorsMatch[1].trim().replace(/\.$/, '') : ""; // Remove trailing period

  const contributingFactors = [];
  if (factorsText) {
    const factorRegex = /([\w\s]+) \(([\w/]+)\) \((\d+\.\d+)\%\)/g;
    let match;
    while ((match = factorRegex.exec(factorsText)) !== null) {
      contributingFactors.push({
        factor: match[1].trim(),
        unit: match[2].trim(),
        contribution: parseFloat(match[3]),
      });
    }
  }

  // Determine risk level based on score
  let riskLevel: "Low" | "Moderate" | "High" | "Critical";
  if (riskScore < 30) {
    riskLevel = "Low";
  } else if (riskScore < 60) {
    riskLevel = "Moderate";
  } else if (riskScore < 85) {
    riskLevel = "High";
  } else {
    riskLevel = "Critical";
  }

  return {
    riskScore,
    riskLevel,
    contributingFactors,
  };
}


// Helper function to create or get default location
async function getDefaultLocation() {
  let location = await prisma.monitoredLocation.findFirst({
    where: { name: "Default Analysis Location" },
  });

  if (!location) {
    location = await prisma.monitoredLocation.create({
      data: {
        name: "Default Analysis Location",
        description: "Default location for manual rockfall risk analysis",
      },
    });
  }

  return location;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    if (!body.features || !Array.isArray(body.features)) {
      return NextResponse.json(
        { error: "Request body must contain a 'features' array" },
        { status: 400 }
      );
    }

    if (body.features.length !== 13) {
      return NextResponse.json(
        { error: "Exactly 13 features are required" },
        { status: 400 }
      );
    }

    // Validate that all features are numbers
    for (let i = 0; i < body.features.length; i++) {
      if (typeof body.features[i] !== "number" || isNaN(body.features[i])) {
        return NextResponse.json(
          { error: `Feature at index ${i} must be a valid number` },
          { status: 400 }
        );
      }
    }

    // Get the absolute path to the predict.py script
    const scriptPath = path.join(process.cwd(), "ml", "predict.py");

    return new Promise((resolve, reject) => {
      // Spawn Python process with the features as arguments
      const pythonCommand = process.platform === "win32" ? "python" : "python3";
      const py = spawn(pythonCommand, [
        scriptPath,
        ...body.features.map(String),
      ]);

      let output = "";
      let errorOutput = "";

      py.stdout.on("data", (data) => {
        output += data.toString();
      });

      py.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Python error:", data.toString());
      });

      py.on("close", async (code) => {
        if (code !== 0) {
          console.error("Python script failed with code:", code);
          console.error("Error output:", errorOutput);
          reject(
            NextResponse.json(
              {
                error: "ML inference failed",
                details: errorOutput || "Unknown error",
                exitCode: code,
              },
              { status: 500 }
            )
          );
        } else {
          const prediction = output.trim();

          if (!prediction) {
            reject(
              NextResponse.json(
                { error: "No prediction output received" },
                { status: 500 }
              )
            );
            return;
          }

          // Parse the prediction output
          const parsedPrediction = parsePredictionOutput(prediction);

          // Get or create default location
          const location = await getDefaultLocation();

          // Create sensor reading with the input features
          const sensorReading = await prisma.sensorReading.create({
            data: {
              timestamp: new Date(),
              locationId: location.id,
              rainfall: body.features[0],
              depthToGroundwater: body.features[1],
              poreWaterPressure: body.features[2],
              surfaceRunoff: body.features[3],
              unitWeight: body.features[4],
              cohesion: body.features[5],
              internalFrictionAngle: body.features[6],
              slopeAngle: body.features[7],
              slopeHeight: body.features[8],
              poreWaterPressureRatio: body.features[9],
              benchHeight: body.features[10],
              benchWidth: body.features[11],
              interRampAngle: body.features[12],
            },
          });

          // Create prediction record
          const predictionRecord = await prisma.prediction.create({
            data: {
              riskScore: parsedPrediction.riskScore,
              riskLevel: parsedPrediction.riskLevel,
              contributingFactors: parsedPrediction.contributingFactors,
              locationId: location.id,
              sourceReadingId: sensorReading.id,
            },
          });

          // Create alert if risk level is High or Critical
          if (
            parsedPrediction.riskLevel === "High" ||
            parsedPrediction.riskLevel === "Critical"
          ) {
            await prisma.alert.create({
              data: {
                message: `Risk level ${parsedPrediction.riskLevel} detected: ${parsedPrediction.riskScore.toFixed(2)}% chance of rockfall.`,
                predictionId: predictionRecord.id,
              },
            });
          }

          resolve(
            NextResponse.json({
              prediction,
              features: body.features,
              timestamp: new Date().toISOString(),
              databaseRecord: {
                predictionId: predictionRecord.id.toString(),
                sensorReadingId: sensorReading.id.toString(),
                locationId: location.id,
                riskLevel: parsedPrediction.riskLevel,
                riskScore: parsedPrediction.riskScore,
                contributingFactors: parsedPrediction.contributingFactors,
              },
            })
          );
        }
      });

      py.on("error", (error) => {
        console.error("Failed to start Python process:", error);
        reject(
          NextResponse.json(
            {
              error: "Failed to start ML inference process",
              details: error.message,
            },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Clean up Prisma client connection
    await prisma.$disconnect();
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to make predictions." },
    { status: 405 }
  );
}

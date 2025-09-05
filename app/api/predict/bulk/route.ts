import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { PrismaClient } from "../../../generated/prisma";

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to parse prediction output (same as single prediction)
function parsePredictionOutput(predictionString: string) {
  const riskMatch = predictionString.match(/The chance of rockfall is ([\d.]+)%/);
  const riskScore = riskMatch ? parseFloat(riskMatch[1]) : 0;

  const factorsMatch = predictionString.match(/Top contributing factors: (.+)/);
  const factorsText = factorsMatch ? factorsMatch[1].trim().replace(/\.$/, '') : "";

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

// Helper function to run prediction for a single row
async function runPrediction(features: number[]): Promise<{
  success: boolean;
  prediction?: any;
  error?: string;
}> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), "ml", "predict.py");
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    
    const py = spawn(pythonCommand, [scriptPath, ...features.map(String)]);
    
    let output = "";
    let errorOutput = "";
    
    py.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    
    py.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Python script failed: ${errorOutput || "Unknown error"}`,
        });
      } else {
        const prediction = output.trim();
        if (!prediction) {
          resolve({
            success: false,
            error: "No prediction output received",
          });
        } else {
          try {
            const parsedPrediction = parsePredictionOutput(prediction);
            resolve({
              success: true,
              prediction: {
                rawOutput: prediction,
                ...parsedPrediction,
              },
            });
          } catch (error) {
            resolve({
              success: false,
              error: `Failed to parse prediction: ${error}`,
            });
          }
        }
      }
    });
    
    py.on("error", (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`,
      });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.rows || !Array.isArray(body.rows)) {
      return NextResponse.json(
        { error: "Request body must contain a 'rows' array" },
        { status: 400 }
      );
    }
    
    if (body.rows.length === 0) {
      return NextResponse.json(
        { error: "At least one row is required" },
        { status: 400 }
      );
    }
    
    if (body.rows.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 rows allowed per batch" },
        { status: 400 }
      );
    }
    
    // Validate each row has exactly 13 features
    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      if (!Array.isArray(row) || row.length !== 13) {
        return NextResponse.json(
          { error: `Row ${i + 1} must contain exactly 13 numerical features` },
          { status: 400 }
        );
      }
      
      for (let j = 0; j < row.length; j++) {
        if (typeof row[j] !== "number" || isNaN(row[j])) {
          return NextResponse.json(
            { error: `Row ${i + 1}, feature ${j + 1} must be a valid number` },
            { status: 400 }
          );
        }
      }
    }
    
    // Get or create default location
    const location = await getDefaultLocation();
    
    // Process each row
    const results = [];
    const errors = [];
    
    for (let i = 0; i < body.rows.length; i++) {
      const features = body.rows[i];
      
      try {
        // Run prediction
        const predictionResult = await runPrediction(features);
        
        if (!predictionResult.success) {
          errors.push({
            row: i + 1,
            error: predictionResult.error,
          });
          continue;
        }
        
        // Create sensor reading
        const sensorReading = await prisma.sensorReading.create({
          data: {
            timestamp: new Date(),
            locationId: location.id,
            rainfall: features[0],
            depthToGroundwater: features[1],
            poreWaterPressure: features[2],
            surfaceRunoff: features[3],
            unitWeight: features[4],
            cohesion: features[5],
            internalFrictionAngle: features[6],
            slopeAngle: features[7],
            slopeHeight: features[8],
            poreWaterPressureRatio: features[9],
            benchHeight: features[10],
            benchWidth: features[11],
            interRampAngle: features[12],
          },
        });
        
        // Create prediction record
        const predictionRecord = await prisma.prediction.create({
          data: {
            riskScore: predictionResult.prediction.riskScore,
            riskLevel: predictionResult.prediction.riskLevel,
            contributingFactors: predictionResult.prediction.contributingFactors,
            locationId: location.id,
            sourceReadingId: sensorReading.id,
          },
        });
        
        // Create alert if high risk
        if (
          predictionResult.prediction.riskLevel === "High" ||
          predictionResult.prediction.riskLevel === "Critical"
        ) {
          await prisma.alert.create({
            data: {
              message: `Risk level ${predictionResult.prediction.riskLevel} detected: ${predictionResult.prediction.riskScore.toFixed(2)}% chance of rockfall.`,
              predictionId: predictionRecord.id,
            },
          });
        }
        
        results.push({
          row: i + 1,
          features,
          prediction: predictionResult.prediction.rawOutput,
          databaseRecord: {
            predictionId: predictionRecord.id.toString(),
            sensorReadingId: sensorReading.id.toString(),
            locationId: location.id,
            riskLevel: predictionResult.prediction.riskLevel,
            riskScore: predictionResult.prediction.riskScore,
            contributingFactors: predictionResult.prediction.contributingFactors,
          },
        });
        
      } catch (error) {
        errors.push({
          row: i + 1,
          error: `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        totalRows: body.rows.length,
        successful: results.length,
        failed: errors.length,
      },
      results,
      errors,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Bulk prediction API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST for bulk predictions." },
    { status: 405 }
  );
}

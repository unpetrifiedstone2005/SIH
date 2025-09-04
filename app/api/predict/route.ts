import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

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
      if (typeof body.features[i] !== 'number' || isNaN(body.features[i])) {
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
      // Try python3 first, then python (for Windows compatibility)
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      const py = spawn(pythonCommand, [scriptPath, ...body.features.map(String)]);
      
      let output = "";
      let errorOutput = "";
      
      py.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      py.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Python error:", data.toString());
      });
      
      py.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script failed with code:", code);
          console.error("Error output:", errorOutput);
          reject(NextResponse.json(
            { 
              error: "ML inference failed", 
              details: errorOutput || "Unknown error",
              exitCode: code 
            }, 
            { status: 500 }
          ));
        } else {
          const prediction = output.trim();
          
          if (!prediction) {
            reject(NextResponse.json(
              { error: "No prediction output received" },
              { status: 500 }
            ));
            return;
          }
          
          // TODO: Insert prediction into NeonDB here
          // For now, just return the prediction
          
          resolve(NextResponse.json({ 
            prediction,
            features: body.features,
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      py.on("error", (error) => {
        console.error("Failed to start Python process:", error);
        reject(NextResponse.json(
          { 
            error: "Failed to start ML inference process",
            details: error.message 
          },
          { status: 500 }
        ));
      });
    });
    
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to make predictions." },
    { status: 405 }
  );
}

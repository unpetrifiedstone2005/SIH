import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: Request) {
  const body = await req.json(); // { features: [1.2, 3.4, 5.6] }

  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["ml/predict.py", ...body.features]);

    let output = "";
    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    py.on("close", (code) => {
      if (code !== 0) {
        reject(NextResponse.json({ error: "ML inference failed" }, { status: 500 }));
      } else {
        const prediction = output.trim();

        // TODO: Insert prediction into NeonDB here

        resolve(NextResponse.json({ prediction }));
      }
    });
  });
}

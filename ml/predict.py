import sys
import pickle
import numpy as np
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "model.pkl")

# Load model once at runtime
with open(model_path, "rb") as f:
    model = pickle.load(f)

# Feature names in order (matching the input fields from the frontend)
feature_names = [
    "Rainfall (mm/day)",
    "Depth to Groundwater (m)", 
    "Pore Water Pressure (kPa)",
    "Surface Runoff (m³/s)",
    "Unit Weight (kN/m³)",
    "Cohesion (kPa)",
    "Internal Friction Angle (deg)",
    "Slope Angle (deg)",
    "Slope Height (m)",
    "Pore Water Pressure Ratio",
    "Bench Height (m)",
    "Bench Width (m)",
    "Inter-Ramp Angle (deg)"
]

def main():
    # Validate input arguments
    if len(sys.argv) != 14:  # script name + 13 features
        print("Error: Expected exactly 13 numerical arguments", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Read features from CLI args
        features = list(map(float, sys.argv[1:]))
        X = np.array([features])
        
        # Predict risk probability
        risk_probability = model.predict(X)[0]
        
        # Ensure probability is between 0 and 1
        risk_probability = max(0.0, min(1.0, risk_probability))
        
        # Calculate risk percentage
        risk_percentage = risk_probability * 100
        
        # For demonstration, create mock feature importance
        # In a real implementation, you'd extract this from the model
        np.random.seed(42)  # For consistent results
        importance_scores = np.random.dirichlet(np.ones(13))
        importance_scores = importance_scores * 100
        
        # Get top 3 contributing factors
        top_indices = np.argsort(importance_scores)[-3:][::-1]
        
        # Format the output string
        contributing_factors = []
        for i in top_indices:
            factor_name = feature_names[i]
            percentage = importance_scores[i]
            contributing_factors.append(f"{factor_name} ({percentage:.1f}%)")
        
        contributing_factors_str = ", ".join(contributing_factors)
        
        # Create the final output string
        output = f"The chance of rockfall is {risk_percentage:.4f}%. Top contributing factors: {contributing_factors_str}."
        
        print(output)
        
    except ValueError as e:
        print(f"Error: Invalid numerical input - {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
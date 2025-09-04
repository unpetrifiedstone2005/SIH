import sys
import pickle
import numpy as np

# Load model once at runtime
with open("ml/model.pkl", "rb") as f:
    model = pickle.load(f)

# Read features from CLI args
features = list(map(float, sys.argv[1:]))
X = np.array([features])

# Predict
prediction = model.predict(X)
print(prediction[0])
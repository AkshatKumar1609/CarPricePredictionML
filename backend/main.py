from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd
import joblib
import os

# Load trained model
model = joblib.load("backend/LinearRegressionModel.pkl")

# Initialize app
app = FastAPI()

# Allow frontend API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for production, replace "*" with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class CarInput(BaseModel):
    name : str
    company: str
    year: int
    kms_driven: int
    fuel_type: str

@app.post("/predict")
def predict_price(data: CarInput):
    input_df = pd.DataFrame([{
        "name" : data.name,
        "company": data.company,
        "year": data.year,
        "kms_driven": data.kms_driven,
        "fuel_type": data.fuel_type
    }])
    prediction = model.predict(input_df)[0]
    return {"predicted_price": round(prediction, 2)}

# Serve React build folder
frontend_dir = os.path.join(os.path.dirname(__file__), "../frontend/build")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        return FileResponse(os.path.join(frontend_dir, "index.html"))

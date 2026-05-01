import base64
import io
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# Relative imports assuming same directory
from ml_model import predict_dr, generate_gradcam, predict_mobile, generate_mobile_heatmap, generate_preprocessed_preview
from fuzzy_engine import compute_urgency
from fastapi import Form

app = FastAPI(title="OpticaNet+ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...), mode: str = Form("fundus")):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Generate Preprocessed Preview
    preprocessed_img = generate_preprocessed_preview(image)
    _, prep_buffer = cv2.imencode('.jpg', preprocessed_img)
    preprocessed_b64 = base64.b64encode(prep_buffer).decode('utf-8')
    
    if mode == "mobile":
        risk_level, confidence, risk_val = predict_mobile(image)
        heatmap_img = generate_mobile_heatmap(image)
        
        _, buffer = cv2.imencode('.jpg', heatmap_img)
        heatmap_b64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "mode": mode,
            "risk_level": risk_level,
            "confidence": float(confidence),
            "recommendation": "This is a preliminary screening based on external eye features. It does not confirm diabetic retinopathy. A fundus scan is recommended for accurate diagnosis.",
            "heatmap_image": heatmap_b64,
            "preprocessed_image": preprocessed_b64,
            "urgency": risk_level  # reuse for badge
        }
    else:
        # Fundus Mode (Original)
        # Preprocess & Predict
        stage, confidence, severity_val, lesion_val = predict_dr(image)
        
        # Generate Heatmap
        heatmap_img = generate_gradcam(image)
        
        # Fuzzy Logic
        urgency, recommendation = compute_urgency(severity_val, lesion_val)
        
        # Encode Heatmap
        _, buffer = cv2.imencode('.jpg', heatmap_img)
        heatmap_b64 = base64.b64encode(buffer).decode('utf-8')
        
        # Map raw values to categories for display
        def val_to_cat(v):
            if v < 0.33: return "Low"
            if v < 0.66: return "Medium"
            return "High"
            
        return {
            "mode": mode,
            "stage": stage,
            "confidence": float(confidence),
            "urgency": urgency,
            "recommendation": recommendation,
            "heatmap_image": heatmap_b64,
            "preprocessed_image": preprocessed_b64,
            "fuzzy_severity": val_to_cat(severity_val),
            "fuzzy_lesion": val_to_cat(lesion_val)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

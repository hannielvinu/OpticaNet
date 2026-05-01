# 👁️ OpticaNet+ — Smart Diabetic Retinopathy Detector

A full-stack AI-powered web application for detecting **Diabetic Retinopathy** from retinal images and normal naked eye images using **Deep Learning + Explainable AI + Fuzzy Logic**.

This system combines medical imaging, interpretable AI, and intelligent decision-making to assist in early diagnosis and risk assessment.

---

## 📋 Overview

OpticaNet+ is designed to simulate a **real-world clinical decision support system** by:

- Detecting diabetic retinopathy using deep learning
- Highlighting affected regions via explainable AI (Grad-CAM)
- Providing adaptive medical recommendations using fuzzy logic

It delivers both **prediction + explanation**, making it more trustworthy for medical use.

---

## 🏗️ Architecture

### 🔹 Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion

### 🔹 Backend
- FastAPI (Python)
- TensorFlow / Keras
- OpenCV

---

## ⚙️ How It Works

### 🧠 Phase 1: Deep Learning Detection
- Uses MobileNetV2 for retinal image classification
- Predicts presence and severity of diabetic retinopathy

### 🔍 Phase 2: Explainable AI (Grad-CAM)
- Generates heatmaps highlighting critical regions
- Helps interpret model decisions

### 🧮 Phase 3: Fuzzy Logic Decision Engine
- Inputs:
  - Severity score
  - Lesion density
- Outputs:
  - Medical urgency level
  - Personalized recommendations

---

## 📁 Project Structure

```
OpticaNet+/
├── frontend/        # React frontend
├── backend/         # FastAPI backend
├── models/          # ML models (optional)
└── README.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py
```

API will run on: `http://localhost:8000`  
*Note: MobileNetV2 weights (~14MB) download on first run*

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on: `http://localhost:5173`

---

## 🎯 Features

- 🖼️ Drag & Drop Image Upload
- 🤖 MobileNetV2-based Deep Learning Model
- 🔍 Grad-CAM Explainability
- 🧠 Fuzzy Logic Recommendation Engine
- 🎨 Modern UI with Tailwind & Animations

---

## 📊 Output

- DR Prediction (Positive/Negative)
- Severity Level
- Heatmap Visualization
- Medical Urgency Score
- Health Recommendations

---

## 🧪 Example Workflow

1. Upload retinal image  
2. Model processes input  
3. Heatmap generated  
4. Severity evaluated  
5. Recommendations provided  

---

## ⚠️ Limitations

- Prototype-level system  
- Limited dataset scope  
- Not for clinical use  
- Simplified fuzzy logic rules  

---

## 🚀 Future Enhancements

- Real-world dataset integration  
- Multi-class DR grading  
- Cloud deployment  
- Doctor dashboard  
- Advanced explainability  

---

## 👩‍💻 Author

Developed as a demonstration of:
- Deep Learning in Healthcare  
- Explainable AI (XAI)  
- Intelligent Decision Systems  

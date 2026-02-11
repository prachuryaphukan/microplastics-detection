# AI Microplastics Detection System

An end-to-end AI-powered system for detecting and classifying microplastic particles in water samples using a **YOLOv8** object detection model, a **Flask REST API**, and a **React Native** mobile interface.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00BFFF)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🔬 Overview

Microplastic pollution is a growing environmental and health concern, but traditional laboratory analysis is expensive and time-consuming. This project provides a **demo-ready, deployable alternative** that uses AI to detect microplastic particles from smartphone camera images.

### Key Features

| Feature | Description |
|---|---|
| **4-Class Detection** | Detects **Fragment**, **Fiber**, **Film**, and **Pellet** particles |
| **YOLOv8 Model** | Trained on [Roboflow Microplastics Dataset](https://universe.roboflow.com/) (400+ annotated images) |
| **REST API** | Flask backend with image upload, base64 input, and JSON results |
| **Mobile App** | React Native (Expo) app with camera capture & rich result visualization |
| **Confidence Scoring** | Color-coded confidence levels (High / Medium / Low) for each detection |
| **Demo Mode** | Works without a model file by generating simulated detections |

---

## 📁 Project Structure

```
microplastics_detection/
├── backend/
│   ├── app.py              # Flask API (endpoints: /predict, /health, /classes)
│   ├── detector.py         # YOLOv8 inference engine + demo fallback
│   ├── config.py           # Centralized configuration
│   ├── train_model.py      # Training script (Roboflow + YOLOv8)
│   ├── test_api.py         # API smoke tests
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables (optional)
│   └── model/              # Place your trained .pt file here
├── frontend/
│   ├── App.js              # Main React Native entry point
│   ├── src/
│   │   ├── api.js          # Axios-based API service
│   │   └── components/
│   │       ├── CameraView.js   # Camera / gallery image picker
│   │       └── ResultsView.js  # Detection results visualization
│   ├── package.json
│   ├── app.json            # Expo configuration
│   └── babel.config.js
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & npm
- **Expo CLI** (`npm install -g expo-cli`)
- *(Optional)* Roboflow API key for training your own model

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the API server
python app.py
```

The API starts at `http://localhost:5000`. Verify with:

```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `w` for web preview.

### 3. Train Your Own Model (Optional)

```bash
cd backend
pip install roboflow

python train_model.py --api-key YOUR_ROBOFLOW_API_KEY
```

The best checkpoint is automatically saved to `model/microplastics_best.pt`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/classes` | List the 4 particle types |
| `POST` | `/api/predict` | Upload image → detection results |
| `GET` | `/api/predict/annotated` | Download last annotated image |

### POST `/api/predict`

**Request** (multipart/form-data):
```
image: <file>
```

**Response** (JSON):
```json
{
  "request_id": "a1b2c3d4",
  "detections": [
    {
      "class_id": 0,
      "class_name": "Fragment",
      "confidence": 0.9234,
      "bbox": { "x1": 120.5, "y1": 80.3, "x2": 200.1, "y2": 160.7 }
    }
  ],
  "summary": {
    "total_particles": 5,
    "counts_by_type": { "Fragment": 2, "Fiber": 1, "Film": 1, "Pellet": 1 },
    "avg_confidence": 0.7832,
    "max_confidence": 0.9234
  },
  "annotated_image_base64": "<base64 JPEG>"
}
```

---

## 🧪 Testing

```bash
cd backend

# Start the server in one terminal
python app.py

# Run smoke tests in another terminal
python test_api.py
```

---

## 🤖 Model Details

| Property | Value |
|----------|-------|
| Architecture | YOLOv8n (nano) |
| Dataset | Roboflow Microplastics (400+ images) |
| Classes | Fragment, Fiber, Film, Pellet |
| Input Size | 640 × 640 |
| Confidence Threshold | 0.25 (configurable) |
| IoU Threshold | 0.45 (configurable) |

---

## 🛠️ Configuration

All settings can be configured via environment variables or the `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | `model/microplastics_best.pt` | Path to YOLOv8 weights |
| `CONFIDENCE_THRESHOLD` | `0.25` | Minimum confidence score |
| `IOU_THRESHOLD` | `0.45` | NMS IoU threshold |
| `IMAGE_SIZE` | `640` | Inference resolution |
| `PORT` | `5000` | Server port |

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) – State-of-the-art object detection
- [Roboflow](https://roboflow.com/) – Dataset hosting and annotation tools
- [Expo](https://expo.dev/) – React Native development platform

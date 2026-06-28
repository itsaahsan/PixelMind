# PixelMind — Chest X-Ray Pneumonia Classifier

Fine-tuned ResNet-50 for pneumonia detection with Grad-CAM explainability. Upload any chest X-ray image and get an instant diagnosis with a heatmap showing exactly which regions the model focused on.

## Features

- **Single Image Classification** — Upload a chest X-ray, get PNEUMONIA or NORMAL prediction with confidence score
- **Grad-CAM Heatmap** — Visual explanation showing which part of the X-ray the model focused on
- **Batch Upload** — Analyze multiple X-rays at once with progress tracking
- **Analysis History** — Past predictions saved in localStorage, revisit anytime
- **Slider Comparison** — Drag to compare original vs Grad-CAM overlay side by side
- **Model Info Panel** — Detailed breakdown of prediction probabilities and model architecture
- **Download Report** — Export analysis as a PNG report with original + Grad-CAM images
- **Export CSV** — Download batch results as a CSV spreadsheet

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
cd backend
docker build -t pixelmind .
docker run -p 8000:8000 pixelmind
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (model status, accuracy, version) |
| POST | `/api/predict` | Classify X-ray image (JPEG/PNG, max 10MB) |

### Response Format
```json
{
  "label": "PNEUMONIA",
  "confidence": 92.45,
  "probability": 0.9245,
  "gradcam": "<base64-encoded PNG>"
}
```

## Tech Stack

- **Model**: PyTorch + ResNet-50 (transfer learning, 5,863 chest X-ray images)
- **Grad-CAM**: pytorch-grad-cam (layer4[-1] target layer)
- **API**: FastAPI + Uvicorn
- **Frontend**: React + TypeScript + Tailwind CSS
- **Dataset**: Chest X-Ray Images (Kaggle)

## Project Structure

```
pixelmind/
├── backend/
│   ├── model/
│   │   ├── model.py          # ResNet-50 architecture
│   │   ├── inference.py      # Prediction + Grad-CAM
│   │   ├── train.py          # Training script
│   │   └── weights/
│   │       └── best_model.pth
│   ├── api/
│   │   ├── main.py           # FastAPI app
│   │   ├── routes.py         # Endpoints
│   │   └── schemas.py        # Pydantic models
│   ├── tests/
│   │   └── test_api.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.tsx
│   │   │   ├── XRayViewer.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   ├── AnalysisHistory.tsx
│   │   │   ├── BatchUpload.tsx
│   │   │   ├── BatchResults.tsx
│   │   │   ├── ComparisonView.tsx
│   │   │   ├── DownloadReport.tsx
│   │   │   └── ModelInfo.tsx
│   │   ├── App.tsx
│   │   └── api.ts
│   └── package.json
└── README.md
```

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router


app = FastAPI(
    title="PixelMind API",
    description="Chest X-Ray Pneumonia Classifier",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pixelmind-78oe.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "model": "ResNet50", "runtime": "ONNX", "version": "1.0.0"}


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "PixelMind API is running"}

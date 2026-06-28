from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="PixelMind API",
    description="Chest X-Ray Pneumonia Classifier with Grad-CAM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "PixelMind API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}

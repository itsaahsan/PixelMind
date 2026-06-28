import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

logger = logging.getLogger("uvicorn")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from model.inference import load_model
        load_model()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Model loading failed: {e}")
    yield


app = FastAPI(
    title="PixelMind API",
    description="Chest X-Ray Pneumonia Classifier with Grad-CAM",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pixelmind-78oe.onrender.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "PixelMind API is running"}


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    from model.inference import _model
    return {"status": "healthy", "model_loaded": _model is not None}

from fastapi import APIRouter, UploadFile, File, HTTPException
from model.inference import predict

router = APIRouter()


@router.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(400, "Only JPEG and PNG allowed")
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 10MB.")
    image_bytes = await file.read()
    return predict(image_bytes)

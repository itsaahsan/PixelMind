from fastapi import APIRouter, UploadFile, File, HTTPException
from model.inference import predict

router = APIRouter()


@router.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG and PNG images are accepted",
        )
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Max 10MB.",
        )
    image_bytes = await file.read()
    result = predict(image_bytes)
    return result

from pydantic import BaseModel


class PredictResponse(BaseModel):
    label: str
    confidence: float
    probability: float
    gradcam: str

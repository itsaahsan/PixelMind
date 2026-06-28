import io
import os
import base64
import numpy as np
from PIL import Image
import onnxruntime as ort

_session = None
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def load_model():
    global _session
    if _session is None:
        path = os.path.join(os.path.dirname(__file__), "weights", "model.onnx")
        _session = ort.InferenceSession(path, providers=["CPUExecutionProvider"])


def predict(image_bytes: bytes) -> dict:
    if _session is None:
        load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224), Image.BILINEAR)
    arr = np.array(image, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = arr.transpose(2, 0, 1)[np.newaxis]

    output = _session.run(None, {"input": arr})[0]
    prob = float(1 / (1 + np.exp(-output[0][0])))
    label = "PNEUMONIA" if prob > 0.5 else "NORMAL"
    confidence = prob if prob > 0.5 else 1 - prob

    return {
        "label": label,
        "confidence": round(confidence * 100, 2),
        "probability": round(prob, 4),
        "gradcam": "",
    }

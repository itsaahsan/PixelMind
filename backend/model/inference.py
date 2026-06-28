import io
import gc

import numpy as np
from PIL import Image

_model = None
_transform = None
_torch = None


def load_model():
    global _model, _transform, _torch
    if _model is None:
        _model, _transform, _torch = _load_model()


def _load_model():
    import os
    import torch
    torch.set_num_threads(1)
    from torchvision import transforms
    from .model import PixelMindModel

    device = torch.device("cpu")

    model = PixelMindModel()
    weights_path = os.path.join(os.path.dirname(__file__), "weights", "best_model.pth")
    state = torch.load(weights_path, map_location=device)
    model.load_state_dict(state)
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    del state
    gc.collect()

    return model, transform, torch


def predict(image_bytes: bytes) -> dict:
    global _model, _transform, _torch
    if _model is None:
        load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(image).unsqueeze(0)

    with _torch.no_grad():
        output = _model(tensor)
        prob = _torch.sigmoid(output).item()
        label = "PNEUMONIA" if prob > 0.5 else "NORMAL"
        confidence = prob if prob > 0.5 else 1 - prob

    return {
        "label": label,
        "confidence": round(confidence * 100, 2),
        "probability": round(prob, 4),
        "gradcam": None,
    }

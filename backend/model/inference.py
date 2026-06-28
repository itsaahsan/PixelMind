import io
import gc
import threading

import numpy as np
from PIL import Image

_model = None
_transform = None
_torch = None
_gradcam_cls = None
_show_cam = None


def load_model():
    global _model, _transform, _torch, _gradcam_cls, _show_cam
    if _model is None:
        _model, _transform, _torch = _load_model()
    if _gradcam_cls is None:
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.image import show_cam_on_image
        _gradcam_cls = GradCAM
        _show_cam = show_cam_on_image


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


def _compute_gradcam(tensor, image):
    cam = _gradcam_cls(model=_model, target_layers=[_model.base.layer4[-1]])
    grayscale_cam = cam(input_tensor=tensor)[0]
    rgb = np.array(image.resize((224, 224))) / 255.0
    cam_image = _show_cam(rgb, grayscale_cam, use_rgb=True)
    cam_pil = Image.fromarray(cam_image)
    buf = io.BytesIO()
    cam_pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def predict(image_bytes: bytes) -> dict:
    import base64
    global _model, _transform, _torch, _gradcam_cls, _show_cam
    if _model is None:
        load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(image).unsqueeze(0)

    with _torch.no_grad():
        output = _model(tensor)
        prob = _torch.sigmoid(output).item()
        label = "PNEUMONIA" if prob > 0.5 else "NORMAL"
        confidence = prob if prob > 0.5 else 1 - prob

    cam_b64 = None
    try:
        result = [None]
        def _run_cam():
            try:
                result[0] = _compute_gradcam(tensor, image)
            except Exception:
                pass
        t = threading.Thread(target=_run_cam, daemon=True)
        t.start()
        t.join(timeout=3)
        if not t.is_alive():
            cam_b64 = result[0]
    except Exception:
        pass

    return {
        "label": label,
        "confidence": round(confidence * 100, 2),
        "probability": round(prob, 4),
        "gradcam": cam_b64,
    }

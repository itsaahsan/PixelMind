import io
import gc
import multiprocessing
import base64

import numpy as np
from PIL import Image

_model = None
_transform = None
_torch = None
_weights_path = None


def load_model():
    global _model, _transform, _torch, _weights_path
    if _model is None:
        _model, _transform, _torch, _weights_path = _load_model()


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

    return model, transform, torch, weights_path


def _gradcam_worker(weights_path, tensor_bytes, image_bytes, result_queue):
    try:
        import torch
        import torch.nn as nn
        from torchvision import models, transforms
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.image import show_cam_on_image

        device = torch.device("cpu")
        model = models.resnet50(weights=None)
        model.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(2048, 1))
        state = torch.load(weights_path, map_location=device)
        model.load_state_dict(state)
        model.eval()

        tensor = torch.load(io.BytesIO(tensor_bytes), map_location=device)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        cam = GradCAM(model=model, target_layers=[model.base.layer4[-1]])
        grayscale_cam = cam(input_tensor=tensor)[0]
        rgb = np.array(image.resize((224, 224))) / 255.0
        cam_image = show_cam_on_image(rgb, grayscale_cam, use_rgb=True)
        cam_pil = Image.fromarray(cam_image)
        buf = io.BytesIO()
        cam_pil.save(buf, format="PNG")
        result_queue.put(base64.b64encode(buf.getvalue()).decode())
    except Exception:
        result_queue.put(None)


def predict(image_bytes: bytes) -> dict:
    global _model, _transform, _torch, _weights_path
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
        buf = io.BytesIO()
        torch = _torch
        torch.save(tensor, buf)
        tensor_bytes = buf.getvalue()

        result_queue = multiprocessing.Queue()
        p = multiprocessing.Process(
            target=_gradcam_worker,
            args=(_weights_path, tensor_bytes, image_bytes, result_queue),
            daemon=True,
        )
        p.start()
        p.join(timeout=12)
        if p.is_alive():
            p.terminate()
            p.join(timeout=2)
        elif not result_queue.empty():
            cam_b64 = result_queue.get_nowait()
    except Exception:
        pass

    return {
        "label": label,
        "confidence": round(confidence * 100, 2),
        "probability": round(prob, 4),
        "gradcam": cam_b64,
    }

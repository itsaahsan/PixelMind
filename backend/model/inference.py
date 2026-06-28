import torch
torch.set_num_threads(1)

import numpy as np
from PIL import Image
import io
import base64
from torchvision import transforms
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from .model import PixelMindModel

DEVICE = torch.device("cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

model = PixelMindModel()
model.load_state_dict(
    torch.load("model/weights/best_model.pth", map_location=DEVICE)
)
model.eval()


def predict(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(tensor)
        prob = torch.sigmoid(output).item()
        label = "PNEUMONIA" if prob > 0.5 else "NORMAL"
        confidence = prob if prob > 0.5 else 1 - prob

    cam = GradCAM(model=model, target_layers=[model.base.layer4[-1]])
    grayscale_cam = cam(input_tensor=tensor)[0]

    rgb = np.array(image.resize((224, 224))) / 255.0
    cam_image = show_cam_on_image(rgb, grayscale_cam, use_rgb=True)
    cam_pil = Image.fromarray(cam_image)

    buf = io.BytesIO()
    cam_pil.save(buf, format="PNG")
    cam_b64 = base64.b64encode(buf.getvalue()).decode()

    return {
        "label": label,
        "confidence": round(confidence * 100, 2),
        "probability": round(prob, 4),
        "gradcam": cam_b64,
    }

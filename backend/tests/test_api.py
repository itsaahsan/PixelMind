import io
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model"] == "MobileNetV2"
    assert data["runtime"] == "ONNX"


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "PixelMind API" in response.json()["message"]


def test_predict_invalid_filetype():
    response = client.post(
        "/api/predict",
        files={"file": ("test.txt", io.BytesIO(b"not an image"), "text/plain")},
    )
    assert response.status_code == 400


def test_predict_valid_image():
    from PIL import Image

    img = Image.new("RGB", (224, 224), color="black")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("xray.jpg", buf, "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["label"] in ["PNEUMONIA", "NORMAL"]
    assert 0 < data["confidence"] <= 100
    assert "probability" in data
    assert "gradcam" in data

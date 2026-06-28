import io
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PixelMind API" in data["message"]


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
    assert "label" in data
    assert data["label"] in ["PNEUMONIA", "NORMAL"]
    assert "confidence" in data
    assert data["confidence"] > 0
    assert "gradcam" in data
    assert "probability" in data


def test_predict_image_loaded():
    from PIL import Image

    img = Image.new("RGB", (224, 224), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("xray.png", buf, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["label"] in ["PNEUMONIA", "NORMAL"]
    assert 0 < data["confidence"] <= 100

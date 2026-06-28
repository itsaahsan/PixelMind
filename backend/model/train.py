import os
import shutil
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from model.model import PixelMindModel

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EPOCHS = 10
BATCH = 32
LR = 1e-4
DATA_DIR = "data"

train_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

val_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


def download_dataset():
    if os.path.exists(os.path.join(DATA_DIR, "train")):
        print("Dataset already exists, skipping download.")
        return

    try:
        import kagglehub
        print("Downloading chest X-ray dataset via kagglehub...")
        path = kagglehub.dataset_download("paultimothymooney/chest-xray-pneumonia")
        src = os.path.join(path, "chest_xray")
        if os.path.exists(src):
            shutil.move(src, DATA_DIR)
        else:
            shutil.move(path, DATA_DIR)
        print("Dataset ready.")
    except ImportError:
        print("Install kagglehub: pip install kagglehub")
        raise
    except Exception as e:
        print(f"Download failed: {e}")
        raise


def main():
    download_dataset()

    train_path = os.path.join(DATA_DIR, "train")
    val_path = os.path.join(DATA_DIR, "val")

    if not os.path.exists(train_path):
        raise FileNotFoundError(
            f"Training data not found at {train_path}. "
            "Download from: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia"
        )

    train_ds = datasets.ImageFolder(train_path, transform=train_tf)
    val_ds = datasets.ImageFolder(val_path, transform=val_tf)
    train_dl = DataLoader(train_ds, batch_size=BATCH, shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=BATCH)

    print(f"Train: {len(train_ds)} images | Val: {len(val_ds)} images")

    model = PixelMindModel().to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    criterion = nn.BCEWithLogitsLoss()

    best_acc = 0
    for epoch in range(EPOCHS):
        model.train()
        for images, labels in train_dl:
            images = images.to(DEVICE)
            labels = labels.float().to(DEVICE)
            optimizer.zero_grad()
            loss = criterion(model(images).squeeze(), labels)
            loss.backward()
            optimizer.step()

        model.eval()
        correct = total = 0
        with torch.no_grad():
            for images, labels in val_dl:
                images = images.to(DEVICE)
                labels = labels.float().to(DEVICE)
                preds = torch.sigmoid(model(images).squeeze()) > 0.5
                correct += (preds == labels.bool()).sum().item()
                total += labels.size(0)

        acc = correct / total
        print(f"Epoch {epoch + 1}/{EPOCHS} | Val Acc: {acc:.4f}")
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), "model/weights/best_model.pth")
            print(f"  -> Saved best model (acc={acc:.4f})")

    print(f"Best accuracy: {best_acc:.4f}")


if __name__ == "__main__":
    main()

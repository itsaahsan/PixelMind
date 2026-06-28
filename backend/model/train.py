import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from model.model import PixelMindModel

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EPOCHS = 10
BATCH = 32
LR = 1e-4

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

train_ds = datasets.ImageFolder("data/train", transform=train_tf)
val_ds = datasets.ImageFolder("data/val", transform=val_tf)

train_dl = DataLoader(train_ds, batch_size=BATCH, shuffle=True)
val_dl = DataLoader(val_ds, batch_size=BATCH)

model = PixelMindModel().to(DEVICE)
optimizer = torch.optim.Adam(model.parameters(), lr=LR)
criterion = nn.BCEWithLogitsLoss()

best_acc = 0
for epoch in range(EPOCHS):
    model.train()
    for images, labels in train_dl:
        images, labels = images.to(DEVICE), labels.float().to(DEVICE)
        optimizer.zero_grad()
        loss = criterion(model(images).squeeze(), labels)
        loss.backward()
        optimizer.step()

    model.eval()
    correct = total = 0
    with torch.no_grad():
        for images, labels in val_dl:
            images, labels = images.to(DEVICE), labels.float().to(DEVICE)
            preds = torch.sigmoid(model(images).squeeze()) > 0.5
            correct += (preds == labels.bool()).sum().item()
            total += labels.size(0)

    acc = correct / total
    print(f"Epoch {epoch + 1} | Val Acc: {acc:.4f}")
    if acc > best_acc:
        best_acc = acc
        torch.save(model.state_dict(), "model/weights/best_model.pth")

print(f"Best accuracy: {best_acc:.4f}")

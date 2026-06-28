import torch
import torch.nn as nn
from torchvision import models


class PixelMindModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.base = models.resnet50(weights=None)
        self.base.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(2048, 1),
        )

    def forward(self, x):
        return self.base(x)

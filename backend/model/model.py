import torch
import torch.nn as nn
from torchvision import models


class PixelMindModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.base = models.mobilenet_v2(weights=None)
        self.base.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(1280, 1),
        )

    def forward(self, x):
        return self.base(x)

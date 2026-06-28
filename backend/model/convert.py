import os
import torch
from model.model import PixelMindModel

WEIGHTS = os.path.join(os.path.dirname(__file__), "weights", "best_model.pth")
OUTPUT = os.path.join(os.path.dirname(__file__), "weights", "model.onnx")


def convert():
    model = PixelMindModel()
    state = torch.load(WEIGHTS, map_location="cpu", weights_only=True)
    model.load_state_dict(state)
    model.eval()

    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model, dummy, OUTPUT,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        opset_version=17,
        dynamo=False,
    )
    size_mb = os.path.getsize(OUTPUT) / 1024 / 1024
    print(f"Exported {OUTPUT} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    convert()

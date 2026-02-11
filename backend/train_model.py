"""
Model Training Script – Microplastics YOLOv8
=============================================
Downloads the Roboflow microplastics dataset and trains a YOLOv8 model.

Prerequisites:
    pip install roboflow ultralytics

Usage:
    python train_model.py --api-key YOUR_ROBOFLOW_API_KEY

The best checkpoint is saved to  model/microplastics_best.pt
"""
import argparse
import os
import shutil

from ultralytics import YOLO


def download_dataset(api_key: str, workspace: str = "microplastics", project: str = "microplastics-detection", version: int = 1):
    """Download dataset from Roboflow."""
    from roboflow import Roboflow

    rf = Roboflow(api_key=api_key)
    proj = rf.workspace(workspace).project(project)
    dataset = proj.version(version).download("yolov8")
    return dataset.location


def train(data_yaml: str, epochs: int = 100, imgsz: int = 640, batch: int = 16):
    """Train YOLOv8 nano on the microplastics dataset."""
    model = YOLO("yolov8n.pt")  # start from pretrained nano
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        name="microplastics_run",
        patience=20,
        save=True,
        plots=True,
    )
    return results


def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 on microplastics data")
    parser.add_argument("--api-key", required=True, help="Roboflow API key")
    parser.add_argument("--workspace", default="microplastics")
    parser.add_argument("--project", default="microplastics-detection")
    parser.add_argument("--version", type=int, default=1)
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    args = parser.parse_args()

    print("📥  Downloading dataset from Roboflow …")
    data_dir = download_dataset(args.api_key, args.workspace, args.project, args.version)
    data_yaml = os.path.join(data_dir, "data.yaml")
    print(f"    Dataset location: {data_dir}")

    print("🚀  Starting training …")
    train(data_yaml, epochs=args.epochs, imgsz=args.imgsz, batch=args.batch)

    # Copy best weights to model/ directory
    best_src = os.path.join("runs", "detect", "microplastics_run", "weights", "best.pt")
    best_dst = os.path.join("model", "microplastics_best.pt")
    os.makedirs("model", exist_ok=True)
    if os.path.exists(best_src):
        shutil.copy2(best_src, best_dst)
        print(f"✅  Best model saved to {best_dst}")
    else:
        print("⚠️  best.pt not found – check training output.")


if __name__ == "__main__":
    main()

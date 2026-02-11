"""
Quick smoke test for the Microplastics Detection API.

Usage:
    python test_api.py [--url http://localhost:5000]
"""
import argparse
import json
import sys
from pathlib import Path

import requests
from PIL import Image


def create_test_image(path: str = "test_sample.jpg") -> str:
    """Create a small synthetic test image."""
    img = Image.new("RGB", (640, 640), color=(120, 180, 200))
    img.save(path)
    return path


def test_health(base: str) -> None:
    r = requests.get(f"{base}/api/health")
    r.raise_for_status()
    data = r.json()
    print(f"[HEALTH] status={data['status']}  model_loaded={data['model_loaded']}  demo={data.get('demo_mode')}")


def test_classes(base: str) -> None:
    r = requests.get(f"{base}/api/classes")
    r.raise_for_status()
    print(f"[CLASSES] {json.dumps(r.json(), indent=2)}")


def test_predict(base: str, image_path: str) -> None:
    with open(image_path, "rb") as f:
        r = requests.post(f"{base}/api/predict", files={"image": f})
    r.raise_for_status()
    data = r.json()
    print(f"[PREDICT] request_id={data['request_id']}")
    print(f"          total_particles={data['summary']['total_particles']}")
    print(f"          counts={data['summary']['counts_by_type']}")
    print(f"          avg_confidence={data['summary']['avg_confidence']}")
    print(f"          annotated_image_size={len(data.get('annotated_image_base64', ''))} chars (base64)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:5000", help="API base URL")
    args = parser.parse_args()

    base = args.url.rstrip("/")
    print(f"Testing API at {base}\n{'=' * 50}")

    test_health(base)
    test_classes(base)

    img_path = create_test_image()
    test_predict(base, img_path)
    Path(img_path).unlink(missing_ok=True)

    print(f"{'=' * 50}\nAll tests passed ✓")


if __name__ == "__main__":
    main()

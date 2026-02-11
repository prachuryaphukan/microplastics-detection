"""
YOLOv8 Microplastics Detector
Loads a trained YOLOv8 model and provides inference utilities.
"""
import io
import os
import logging
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO

import config

logger = logging.getLogger(__name__)


class MicroplasticsDetector:
    """Wraps a YOLOv8 model for microplastics detection."""

    def __init__(self, model_path: str | None = None):
        self.model_path = model_path or config.MODEL_PATH
        self.model: YOLO | None = None
        self._load_model()

    # ------------------------------------------------------------------ #
    #  Model loading
    # ------------------------------------------------------------------ #
    def _load_model(self) -> None:
        """Load the YOLOv8 model from disk."""
        if os.path.exists(self.model_path):
            logger.info("Loading YOLOv8 model from %s", self.model_path)
            self.model = YOLO(self.model_path)
            logger.info("Model loaded successfully.")
        else:
            logger.warning(
                "Model file not found at %s. "
                "Running in DEMO mode with simulated detections.",
                self.model_path,
            )
            self.model = None

    # ------------------------------------------------------------------ #
    #  Inference
    # ------------------------------------------------------------------ #
    def detect(self, image: Image.Image) -> dict[str, Any]:
        """
        Run detection on a PIL Image.

        Returns
        -------
        dict with keys:
            detections : list[dict]  – per-box results
            summary    : dict        – counts & statistics
            annotated  : bytes       – JPEG-encoded annotated image
        """
        if self.model is not None:
            return self._real_detect(image)
        return self._demo_detect(image)

    # ------------------------------------------------------------------ #
    #  Real inference path
    # ------------------------------------------------------------------ #
    def _real_detect(self, image: Image.Image) -> dict[str, Any]:
        results = self.model.predict(
            source=image,
            conf=config.CONFIDENCE_THRESHOLD,
            iou=config.IOU_THRESHOLD,
            imgsz=config.IMAGE_SIZE,
            verbose=False,
        )

        detections: list[dict] = []
        result = results[0]
        boxes = result.boxes

        for i in range(len(boxes)):
            cls_id = int(boxes.cls[i].item())
            conf = float(boxes.conf[i].item())
            x1, y1, x2, y2 = boxes.xyxy[i].tolist()
            detections.append(
                {
                    "class_id": cls_id,
                    "class_name": config.CLASS_NAMES.get(cls_id, f"class_{cls_id}"),
                    "confidence": round(conf, 4),
                    "bbox": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2),
                    },
                }
            )

        annotated_img = self._annotate(image, detections)
        summary = self._build_summary(detections)

        return {
            "detections": detections,
            "summary": summary,
            "annotated_image": annotated_img,
        }

    # ------------------------------------------------------------------ #
    #  Demo / fallback path (no model file)
    # ------------------------------------------------------------------ #
    def _demo_detect(self, image: Image.Image) -> dict[str, Any]:
        """Generate plausible demo detections when no model is available."""
        w, h = image.size
        rng = np.random.default_rng(42)

        demo_dets = []
        n = rng.integers(3, 8)
        for _ in range(n):
            cls_id = int(rng.integers(0, 4))
            conf = round(float(rng.uniform(0.45, 0.97)), 4)
            cx, cy = rng.uniform(0.1, 0.9, size=2)
            bw, bh = rng.uniform(0.04, 0.15, size=2)
            demo_dets.append(
                {
                    "class_id": cls_id,
                    "class_name": config.CLASS_NAMES[cls_id],
                    "confidence": conf,
                    "bbox": {
                        "x1": round((cx - bw / 2) * w, 2),
                        "y1": round((cy - bh / 2) * h, 2),
                        "x2": round((cx + bw / 2) * w, 2),
                        "y2": round((cy + bh / 2) * h, 2),
                    },
                }
            )

        annotated_img = self._annotate(image, demo_dets)
        summary = self._build_summary(demo_dets)
        summary["demo_mode"] = True

        return {
            "detections": demo_dets,
            "summary": summary,
            "annotated_image": annotated_img,
        }

    # ------------------------------------------------------------------ #
    #  Annotation
    # ------------------------------------------------------------------ #
    @staticmethod
    def _annotate(image: Image.Image, detections: list[dict]) -> bytes:
        """Draw bounding boxes and labels on a copy of the image."""
        img = image.copy().convert("RGB")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 14)
        except (IOError, OSError):
            font = ImageFont.load_default()

        for det in detections:
            b = det["bbox"]
            cls_id = det["class_id"]
            color = config.CLASS_COLORS.get(cls_id, (255, 255, 255))
            label = f'{det["class_name"]} {det["confidence"]:.0%}'

            draw.rectangle([b["x1"], b["y1"], b["x2"], b["y2"]], outline=color, width=2)

            # label background
            text_bbox = draw.textbbox((b["x1"], b["y1"]), label, font=font)
            draw.rectangle(
                [text_bbox[0] - 2, text_bbox[1] - 2, text_bbox[2] + 2, text_bbox[3] + 2],
                fill=color,
            )
            draw.text((b["x1"], b["y1"]), label, fill=(0, 0, 0), font=font)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    # ------------------------------------------------------------------ #
    #  Summary helper
    # ------------------------------------------------------------------ #
    @staticmethod
    def _build_summary(detections: list[dict]) -> dict:
        counts: dict[str, int] = {}
        confidences: list[float] = []
        for det in detections:
            name = det["class_name"]
            counts[name] = counts.get(name, 0) + 1
            confidences.append(det["confidence"])

        return {
            "total_particles": len(detections),
            "counts_by_type": counts,
            "avg_confidence": round(float(np.mean(confidences)), 4) if confidences else 0.0,
            "max_confidence": round(float(np.max(confidences)), 4) if confidences else 0.0,
        }

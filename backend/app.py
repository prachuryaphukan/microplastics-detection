"""
Flask API – Microplastics Detection Service
============================================
Endpoints:
    POST /api/predict         – upload image → detection results (JSON)
    GET  /api/predict/annotated – get annotated image for last prediction
    GET  /api/health          – service health check
    GET  /api/classes         – list supported particle types
"""
import base64
import io
import logging
import os
import uuid

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv

import config
from detector import MicroplasticsDetector

# ------------------------------------------------------------------ #
#  Bootstrap
# ------------------------------------------------------------------ #
load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

# Ensure directories exist
os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(config.RESULTS_FOLDER, exist_ok=True)

# Model (loaded once at startup)
detector = MicroplasticsDetector()

# Temporary store for last annotated image (simple in-memory cache)
_last_annotated: dict = {}


# ------------------------------------------------------------------ #
#  Helpers
# ------------------------------------------------------------------ #
def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS


# ------------------------------------------------------------------ #
#  Routes
# ------------------------------------------------------------------ #
@app.route("/api/health", methods=["GET"])
def health():
    """Service health check."""
    return jsonify({
        "status": "ok",
        "model_loaded": detector.model is not None,
        "demo_mode": detector.model is None,
    })


@app.route("/api/classes", methods=["GET"])
def get_classes():
    """List the 4 particle types the model can detect."""
    return jsonify({
        "classes": [
            {"id": k, "name": v}
            for k, v in config.CLASS_NAMES.items()
        ],
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Accept an image and return detection results.

    Supports two input modes:
      1. multipart/form-data  – field name ``image``
      2. JSON body            – ``{"image": "<base64-encoded-image>"}``
    """
    image: Image.Image | None = None
    request_id = str(uuid.uuid4())[:8]

    # --- Mode 1: file upload ---
    if "image" in request.files:
        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not _allowed_file(file.filename):
            return jsonify({"error": f"Unsupported file type. Allowed: {config.ALLOWED_EXTENSIONS}"}), 400
        image = Image.open(file.stream)

    # --- Mode 2: base64 JSON ---
    elif request.is_json and "image" in (request.json or {}):
        try:
            img_data = base64.b64decode(request.json["image"])
            image = Image.open(io.BytesIO(img_data))
        except Exception as exc:
            return jsonify({"error": f"Invalid base64 image: {exc}"}), 400
    else:
        return jsonify({"error": "No image provided. Send via 'image' file field or base64 JSON."}), 400

    # --- Run detection ---
    logger.info("[%s] Running detection on %dx%d image …", request_id, *image.size)
    result = detector.detect(image)

    # Save annotated image bytes for optional retrieval
    _last_annotated["bytes"] = result["annotated_image"]

    # Encode annotated image as base64 for inline response
    annotated_b64 = base64.b64encode(result["annotated_image"]).decode("utf-8")

    response = {
        "request_id": request_id,
        "detections": result["detections"],
        "summary": result["summary"],
        "annotated_image_base64": annotated_b64,
    }

    logger.info(
        "[%s] Detection complete – %d particles found.",
        request_id,
        result["summary"]["total_particles"],
    )
    return jsonify(response)


@app.route("/api/predict/annotated", methods=["GET"])
def get_annotated():
    """Return the last annotated image as a JPEG file."""
    if "bytes" not in _last_annotated:
        return jsonify({"error": "No annotated image available. Run /api/predict first."}), 404
    return send_file(
        io.BytesIO(_last_annotated["bytes"]),
        mimetype="image/jpeg",
        download_name="annotated_result.jpg",
    )


# ------------------------------------------------------------------ #
#  Entry point
# ------------------------------------------------------------------ #
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    logger.info("Starting Microplastics Detection API on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug)

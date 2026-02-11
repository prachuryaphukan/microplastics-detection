"""
Configuration for the Microplastics Detection Backend.
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Model ---
MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    os.path.join(BASE_DIR, "model", "microplastics_best.pt"),
)

# --- Detection ---
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.25"))
IOU_THRESHOLD = float(os.environ.get("IOU_THRESHOLD", "0.45"))
IMAGE_SIZE = int(os.environ.get("IMAGE_SIZE", "640"))

# --- Class Names ---
# The 4 microplastic particle types detected by the model.
CLASS_NAMES = {
    0: "Fragment",
    1: "Fiber",
    2: "Film",
    3: "Pellet",
}

# --- Colors (for annotation) ---
CLASS_COLORS = {
    0: (255, 87, 51),   # Fragment  – coral
    1: (51, 255, 87),   # Fiber     – green
    2: (51, 87, 255),   # Film      – blue
    3: (255, 215, 0),   # Pellet    – gold
}

# --- Upload ---
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
RESULTS_FOLDER = os.path.join(BASE_DIR, "results")
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "tiff", "webp"}

/**
 * API service for communicating with the Flask backend.
 */
import axios from "axios";
import { Platform } from "react-native";

// Android emulator uses 10.0.2.2 for host loopback;
// iOS simulator and web use localhost.
const getBaseUrl = () => {
    if (Platform.OS === "android") return "http://10.0.2.2:5000";
    return "http://localhost:5000";
};

const API_BASE = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

/**
 * Upload an image file for microplastics detection.
 * @param {string} imageUri – local file URI of the image
 * @returns {Promise<object>} detection response
 */
export async function detectMicroplastics(imageUri) {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("image", {
        uri: imageUri,
        name: filename,
        type: mimeType,
    });

    const { data } = await api.post("/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

/**
 * Health check.
 */
export async function healthCheck() {
    const { data } = await api.get("/api/health");
    return data;
}

/**
 * Get list of detectable particle classes.
 */
export async function getClasses() {
    const { data } = await api.get("/api/classes");
    return data;
}

export default api;

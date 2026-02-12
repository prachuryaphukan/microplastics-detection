/**
 * API service for communicating with the Flask backend.
 * Handles both mobile (React Native) and web (browser) environments.
 */
import axios from "axios";
import { Platform } from "react-native";

const getBaseUrl = () => {
    if (Platform.OS === "android") return "http://10.0.2.2:5000";
    return "http://localhost:5000";
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000,
});

/**
 * Upload an image for microplastics detection.
 * @param {string} imageUri – local file URI or blob URL of the image
 * @returns {Promise<object>} detection response
 */
export async function detectMicroplastics(imageUri) {
    const formData = new FormData();

    if (Platform.OS === "web") {
        // On web, imageUri is a blob URL — fetch it and append as a File object
        console.log("[api] Web: fetching blob from", imageUri);
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], "sample.jpg", { type: blob.type || "image/jpeg" });
        formData.append("image", file);
    } else {
        // On mobile, pass the URI object (React Native handles it)
        const filename = imageUri.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        formData.append("image", { uri: imageUri, name: filename, type: mimeType });
    }

    console.log("[api] Sending prediction request...");
    const { data } = await api.post("/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("[api] Prediction response received:", data.summary);
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

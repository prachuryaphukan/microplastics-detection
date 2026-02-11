/**
 * CameraView – Image capture / pick component
 */
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function CameraView({ onImageSelected }) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (useCamera) => {
        setLoading(true);
        try {
            let result;
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission required", "Camera access is needed to capture samples.");
                    setLoading(false);
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.9,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission required", "Gallery access is needed to select images.");
                    setLoading(false);
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.9,
                });
            }

            if (!result.canceled && result.assets?.[0]) {
                const uri = result.assets[0].uri;
                setPreview(uri);
                onImageSelected && onImageSelected(uri);
            }
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Preview area */}
            <View style={styles.previewContainer}>
                {preview ? (
                    <Image source={{ uri: preview }} style={styles.preview} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="scan-outline" size={64} color="#4fc3f7" />
                        <Text style={styles.placeholderText}>
                            Capture or select a water sample image
                        </Text>
                    </View>
                )}
            </View>

            {loading && <ActivityIndicator size="large" color="#4fc3f7" style={{ marginVertical: 12 }} />}

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, styles.cameraButton]}
                    onPress={() => pickImage(true)}
                    disabled={loading}
                >
                    <Ionicons name="camera" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.galleryButton]}
                    onPress={() => pickImage(false)}
                    disabled={loading}
                >
                    <Ionicons name="images" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", marginBottom: 8 },
    previewContainer: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#121830",
        borderWidth: 1,
        borderColor: "rgba(79, 195, 247, 0.25)",
        marginBottom: 16,
    },
    preview: { width: "100%", height: "100%" },
    placeholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    placeholderText: {
        color: "#8892b0",
        fontSize: 15,
        marginTop: 12,
        textAlign: "center",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 14,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
    },
    cameraButton: {
        backgroundColor: "#0288d1",
    },
    galleryButton: {
        backgroundColor: "#7c4dff",
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

/**
 * CameraView – Modern image capture / pick component
 */
import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const isWeb = Platform.OS === "web";

export default function CameraView({ onImageSelected }) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (useCamera) => {
        setLoading(true);
        try {
            let result;
            if (isWeb) {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    quality: 0.9,
                });
            } else if (useCamera) {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (perm.status !== "granted") {
                    Alert.alert("Permission required", "Camera access is needed.");
                    setLoading(false);
                    return;
                }
                result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.9 });
            } else {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (perm.status !== "granted") {
                    Alert.alert("Permission required", "Gallery access is needed.");
                    setLoading(false);
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });
            }
            if (!result.canceled && result.assets?.[0]) {
                setPreview(result.assets[0].uri);
                onImageSelected?.(result.assets[0].uri);
            }
        } catch (err) {
            Alert.alert("Error", String(err.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Preview Card */}
            <View style={styles.previewCard}>
                {preview ? (
                    <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholder}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="water-outline" size={32} color="#67e8f9" />
                        </View>
                        <Text style={styles.placeholderTitle}>Water Sample Analysis</Text>
                        <Text style={styles.placeholderSub}>
                            Upload a microscopy image to detect{"\n"}microplastic particles
                        </Text>

                        {/* Feature pills */}
                        <View style={styles.pillRow}>
                            {["Fragment", "Fiber", "Film", "Pellet"].map((type) => (
                                <View key={type} style={styles.pill}>
                                    <View style={[styles.pillDot, { backgroundColor: pillColors[type] }]} />
                                    <Text style={styles.pillText}>{type}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {loading && <ActivityIndicator size="large" color="#67e8f9" style={{ marginVertical: 12 }} />}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
                <Pressable
                    style={({ pressed }) => [styles.button, styles.primaryBtn, pressed && styles.pressed]}
                    onPress={() => pickImage(true)}
                    disabled={loading}
                >
                    <View style={styles.btnIconWrap}>
                        <Ionicons name={isWeb ? "cloud-upload-outline" : "camera-outline"} size={20} color="#67e8f9" />
                    </View>
                    <View>
                        <Text style={styles.btnLabel}>{isWeb ? "Upload Image" : "Take Photo"}</Text>
                        <Text style={styles.btnHint}>{isWeb ? "Select from computer" : "Use device camera"}</Text>
                    </View>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.button, styles.secondaryBtn, pressed && styles.pressed]}
                    onPress={() => pickImage(false)}
                    disabled={loading}
                >
                    <View style={styles.btnIconWrap}>
                        <Ionicons name="images-outline" size={20} color="#a78bfa" />
                    </View>
                    <View>
                        <Text style={styles.btnLabel}>Gallery</Text>
                        <Text style={styles.btnHint}>Choose existing</Text>
                    </View>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const pillColors = {
    Fragment: "#f87171",
    Fiber: "#4ade80",
    Film: "#60a5fa",
    Pellet: "#fbbf24",
};

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 8 },

    /* Preview Card */
    previewCard: {
        width: "100%",
        minHeight: 240,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        borderWidth: 1,
        borderColor: "rgba(103, 232, 249, 0.1)",
        marginBottom: 14,
    },
    previewImage: { width: "100%", height: 280 },
    placeholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(103, 232, 249, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(103, 232, 249, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    placeholderTitle: {
        color: "#e2e8f0",
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
    },
    placeholderSub: {
        color: "#64748b",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 19,
        marginBottom: 16,
    },

    /* Pills */
    pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(148, 163, 184, 0.08)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(148, 163, 184, 0.1)",
    },
    pillDot: { width: 6, height: 6, borderRadius: 3 },
    pillText: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },

    /* Buttons */
    buttonRow: { flexDirection: "row", gap: 10 },
    button: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
        borderRadius: 14,
        cursor: "pointer",
    },
    primaryBtn: {
        backgroundColor: "rgba(103, 232, 249, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(103, 232, 249, 0.15)",
    },
    secondaryBtn: {
        backgroundColor: "rgba(167, 139, 250, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(167, 139, 250, 0.15)",
    },
    pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
    btnIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.04)",
        alignItems: "center",
        justifyContent: "center",
    },
    btnLabel: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
    btnHint: { color: "#64748b", fontSize: 10, marginTop: 1 },
});

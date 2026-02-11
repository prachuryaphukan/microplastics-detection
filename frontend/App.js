/**
 * Microplastics Detection – Main App
 */
import React, { useState, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    StatusBar,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraView from "./src/components/CameraView";
import ResultsView from "./src/components/ResultsView";
import { detectMicroplastics, healthCheck } from "./src/api";

const TABS = {
    CAPTURE: "capture",
    RESULTS: "results",
};

export default function App() {
    const [tab, setTab] = useState(TABS.CAPTURE);
    const [selectedImage, setSelectedImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState(null);

    // -------- Health check --------
    const checkServer = useCallback(async () => {
        try {
            const data = await healthCheck();
            setServerStatus(data);
            Alert.alert(
                "Server Status",
                `Status: ${data.status}\nModel loaded: ${data.model_loaded}\nDemo mode: ${data.demo_mode}`
            );
        } catch (err) {
            Alert.alert("Connection Error", "Cannot reach the backend server.\nMake sure the Flask API is running on port 5000.");
        }
    }, []);

    // -------- Analyze --------
    const analyzeImage = useCallback(async () => {
        if (!selectedImage) {
            Alert.alert("No Image", "Please capture or select an image first.");
            return;
        }

        setLoading(true);
        try {
            const data = await detectMicroplastics(selectedImage);
            setResult(data);
            setTab(TABS.RESULTS);
        } catch (err) {
            console.error(err);
            Alert.alert(
                "Analysis Failed",
                err.response?.data?.error || err.message || "Unknown error"
            );
        } finally {
            setLoading(false);
        }
    }, [selectedImage]);

    // -------- Reset --------
    const reset = () => {
        setSelectedImage(null);
        setResult(null);
        setTab(TABS.CAPTURE);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0e1a" />

            {/* ---- Header ---- */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="water" size={26} color="#4fc3f7" />
                    <Text style={styles.title}>Microplastics AI</Text>
                </View>
                <TouchableOpacity onPress={checkServer} style={styles.statusButton}>
                    <Ionicons
                        name="server"
                        size={18}
                        color={serverStatus?.status === "ok" ? "#69f0ae" : "#8892b0"}
                    />
                </TouchableOpacity>
            </View>

            {/* ---- Tab Bar ---- */}
            <View style={styles.tabBar}>
                <TabButton
                    label="Capture"
                    icon="camera"
                    active={tab === TABS.CAPTURE}
                    onPress={() => setTab(TABS.CAPTURE)}
                />
                <TabButton
                    label="Results"
                    icon="analytics"
                    active={tab === TABS.RESULTS}
                    onPress={() => setTab(TABS.RESULTS)}
                    disabled={!result}
                />
            </View>

            {/* ---- Content ---- */}
            <View style={styles.content}>
                {tab === TABS.CAPTURE ? (
                    <>
                        <CameraView onImageSelected={setSelectedImage} />

                        {/* Action Buttons */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.analyzeButton, !selectedImage && styles.disabledButton]}
                                onPress={analyzeImage}
                                disabled={!selectedImage || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="search" size={20} color="#fff" />
                                        <Text style={styles.analyzeText}>Analyze Sample</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {(selectedImage || result) && (
                                <TouchableOpacity style={styles.resetButton} onPress={reset}>
                                    <Ionicons name="refresh" size={20} color="#ff5252" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                ) : (
                    <ResultsView result={result} />
                )}
            </View>

            {/* ---- Footer ---- */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    AI Microplastics Detection System • YOLOv8
                </Text>
            </View>
        </SafeAreaView>
    );
}

function TabButton({ label, icon, active, onPress, disabled }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[styles.tab, active && styles.activeTab, disabled && { opacity: 0.4 }]}
        >
            <Ionicons name={icon} size={18} color={active ? "#4fc3f7" : "#607d8b"} />
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#0a0e1a",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },

    /* Header */
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: { color: "#e0e0e0", fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
    statusButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: "rgba(79, 195, 247, 0.1)",
    },

    /* Tabs */
    tabBar: {
        flexDirection: "row",
        marginHorizontal: 20,
        backgroundColor: "#121830",
        borderRadius: 14,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 11,
    },
    activeTab: { backgroundColor: "rgba(79, 195, 247, 0.15)" },
    tabLabel: { color: "#607d8b", fontSize: 14, fontWeight: "600" },
    activeTabLabel: { color: "#4fc3f7" },

    /* Content */
    content: { flex: 1, paddingHorizontal: 20 },

    /* Actions */
    actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    analyzeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#00897b",
        paddingVertical: 16,
        borderRadius: 14,
    },
    disabledButton: { opacity: 0.45 },
    analyzeText: { color: "#fff", fontSize: 17, fontWeight: "700" },
    resetButton: {
        padding: 16,
        borderRadius: 14,
        backgroundColor: "rgba(255, 82, 82, 0.12)",
    },

    /* Footer */
    footer: { paddingVertical: 10, alignItems: "center" },
    footerText: { color: "#455a64", fontSize: 11 },
});

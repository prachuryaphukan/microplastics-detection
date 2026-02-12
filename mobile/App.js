/**
 * Microplastics Detection – Main App
 * Modern glassmorphism design with gradient accents
 */
import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
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

const TABS = { CAPTURE: "capture", RESULTS: "results" };

export default function App() {
  const [tab, setTab] = useState(TABS.CAPTURE);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  const checkServer = useCallback(async () => {
    try {
      const data = await healthCheck();
      setServerStatus(data);
      Alert.alert("Server Status", `Status: ${data.status}\nModel: ${data.model_loaded ? "Loaded" : "Demo mode"}`);
    } catch {
      Alert.alert("Connection Error", "Cannot reach the backend.\nEnsure Flask API is running on port 5000.");
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) { Alert.alert("No Image", "Select an image first."); return; }
    setLoading(true);
    try {
      const data = await detectMicroplastics(selectedImage);
      setResult(data);
      setTab(TABS.RESULTS);
    } catch (err) {
      Alert.alert("Analysis Failed", err.response?.data?.error || err.message || "Unknown error");
    } finally { setLoading(false); }
  }, [selectedImage]);

  const reset = () => { setSelectedImage(null); setResult(null); setTab(TABS.CAPTURE); };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060b18" />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="water" size={20} color="#67e8f9" />
          </View>
          <View>
            <Text style={styles.title}>MicroplasticAI</Text>
            <Text style={styles.subtitle}>YOLOv8 Detection System</Text>
          </View>
        </View>
        <Pressable onPress={checkServer} style={styles.statusButton}>
          <View style={[styles.statusDot, serverStatus?.status === "ok" && styles.statusDotOnline]} />
          <Ionicons name="server-outline" size={16} color="#94a3b8" />
        </Pressable>
      </View>

      {/* ─── Tab Bar ─── */}
      <View style={styles.tabBar}>
        {[
          { key: TABS.CAPTURE, label: "Capture", icon: "camera-outline" },
          { key: TABS.RESULTS, label: "Results", icon: "bar-chart-outline", disabled: !result },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            disabled={t.disabled}
            style={[styles.tab, tab === t.key && styles.activeTab, t.disabled && { opacity: 0.35 }]}
          >
            <Ionicons name={t.icon} size={16} color={tab === t.key ? "#67e8f9" : "#64748b"} />
            <Text style={[styles.tabLabel, tab === t.key && styles.activeTabLabel]}>{t.label}</Text>
            {tab === t.key && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      {/* ─── Content ─── */}
      <View style={styles.content}>
        {tab === TABS.CAPTURE ? (
          <>
            <CameraView onImageSelected={setSelectedImage} />

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.analyzeButton,
                  !selectedImage && styles.disabledButton,
                  pressed && selectedImage && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={analyzeImage}
                disabled={!selectedImage || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                    <Text style={styles.analyzeText}>Analyze Sample</Text>
                  </>
                )}
              </Pressable>

              {(selectedImage || result) && (
                <Pressable
                  style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.7 }]}
                  onPress={reset}
                >
                  <Ionicons name="close" size={18} color="#f87171" />
                </Pressable>
              )}
            </View>
          </>
        ) : (
          <ResultsView result={result} />
        )}
      </View>

      {/* ─── Footer ─── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by YOLOv8 • Microplastics Detection</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#060b18",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(103, 232, 249, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#f1f5f9", fontSize: 20, fontWeight: "800", letterSpacing: 0.3 },
  subtitle: { color: "#64748b", fontSize: 11, fontWeight: "500", marginTop: 1 },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#64748b",
  },
  statusDotOnline: { backgroundColor: "#4ade80" },

  /* Tabs */
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
    position: "relative",
  },
  activeTab: { backgroundColor: "rgba(103, 232, 249, 0.08)" },
  tabLabel: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  activeTabLabel: { color: "#67e8f9" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#67e8f9",
  },

  /* Content */
  content: { flex: 1, paddingHorizontal: 20 },

  /* Actions */
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  analyzeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0891b2",
    paddingVertical: 15,
    borderRadius: 13,
    cursor: "pointer",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 20px rgba(8, 145, 178, 0.35)" }
      : { elevation: 6 }),
  },
  disabledButton: {
    opacity: 0.35,
    ...(Platform.OS === "web" ? { boxShadow: "none" } : { elevation: 0 }),
  },
  analyzeText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
  resetButton: {
    padding: 15,
    borderRadius: 13,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.15)",
    cursor: "pointer",
  },

  /* Footer */
  footer: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.06)",
  },
  footerText: { color: "#334155", fontSize: 10, fontWeight: "500", letterSpacing: 0.5 },
});

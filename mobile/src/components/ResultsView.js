/**
 * ResultsView – Modern detection results visualization
 */
import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CLASS_COLORS = {
    Fragment: "#f87171",
    Fiber: "#4ade80",
    Film: "#60a5fa",
    Pellet: "#fbbf24",
};

const CONFIDENCE_LEVELS = [
    { min: 0.8, label: "High", color: "#4ade80", icon: "shield-checkmark" },
    { min: 0.5, label: "Medium", color: "#fbbf24", icon: "alert-circle" },
    { min: 0, label: "Low", color: "#f87171", icon: "warning" },
];

function getConfLevel(c) {
    return CONFIDENCE_LEVELS.find((l) => c >= l.min) || CONFIDENCE_LEVELS[2];
}

export default function ResultsView({ result }) {
    if (!result) return null;
    const { detections, summary, annotated_image_base64 } = result;

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="analytics-outline" size={18} color="#67e8f9" />
                </View>
                <Text style={styles.sectionTitle}>Analysis Results</Text>
                {summary.demo_mode && (
                    <View style={styles.demoBadge}>
                        <Ionicons name="flask-outline" size={12} color="#fbbf24" />
                        <Text style={styles.demoText}>Demo</Text>
                    </View>
                )}
            </View>

            {/* Annotated Image */}
            {annotated_image_base64 && (
                <View style={styles.imageCard}>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${annotated_image_base64}` }}
                        style={styles.annotatedImage}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Summary Stats */}
            <View style={styles.statsRow}>
                <StatCard icon="layers-outline" label="Particles" value={summary.total_particles} color="#67e8f9" />
                <StatCard icon="speedometer-outline" label="Avg Conf." value={`${(summary.avg_confidence * 100).toFixed(0)}%`} color="#4ade80" />
                <StatCard icon="trophy-outline" label="Best" value={`${(summary.max_confidence * 100).toFixed(0)}%`} color="#fbbf24" />
            </View>

            {/* Distribution */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Particle Distribution</Text>
                {Object.entries(summary.counts_by_type).map(([name, count]) => {
                    const pct = summary.total_particles > 0 ? (count / summary.total_particles) * 100 : 0;
                    const color = CLASS_COLORS[name] || "#94a3b8";
                    return (
                        <View key={name} style={styles.distRow}>
                            <View style={styles.distLeft}>
                                <View style={[styles.distDot, { backgroundColor: color }]} />
                                <Text style={styles.distName}>{name}</Text>
                            </View>
                            <View style={styles.distBarBg}>
                                <View style={[styles.distBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                            </View>
                            <Text style={styles.distCount}>{count}</Text>
                            <Text style={styles.distPct}>{pct.toFixed(0)}%</Text>
                        </View>
                    );
                })}
            </View>

            {/* Detection List */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Detections ({detections.length})</Text>
                {detections.map((det, i) => {
                    const lev = getConfLevel(det.confidence);
                    const color = CLASS_COLORS[det.class_name] || "#94a3b8";
                    return (
                        <View key={i} style={styles.detItem}>
                            <View style={styles.detTop}>
                                <View style={[styles.classBadge, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
                                    <View style={[styles.classDot, { backgroundColor: color }]} />
                                    <Text style={[styles.classText, { color }]}>{det.class_name}</Text>
                                </View>
                                <View style={styles.confWrap}>
                                    <Ionicons name={lev.icon} size={14} color={lev.color} />
                                    <Text style={[styles.confVal, { color: lev.color }]}>{(det.confidence * 100).toFixed(1)}%</Text>
                                </View>
                            </View>
                            <Text style={styles.bboxText}>
                                ({det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)}) → ({det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)})
                            </Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: `${color}12`, borderColor: `${color}20` }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    /* Section header */
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    sectionIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: "rgba(103, 232, 249, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: { color: "#e2e8f0", fontSize: 18, fontWeight: "800", flex: 1 },
    demoBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(251, 191, 36, 0.2)",
    },
    demoText: { color: "#fbbf24", fontSize: 11, fontWeight: "700" },

    /* Image */
    imageCard: {
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        borderWidth: 1,
        borderColor: "rgba(103, 232, 249, 0.1)",
        marginBottom: 14,
    },
    annotatedImage: { width: "100%", height: 280 },

    /* Stats */
    statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    statCard: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "rgba(148, 163, 184, 0.08)",
    },
    statIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    statValue: { color: "#f1f5f9", fontSize: 22, fontWeight: "800" },
    statLabel: { color: "#64748b", fontSize: 10, fontWeight: "600", marginTop: 2, letterSpacing: 0.3 },

    /* Cards */
    card: {
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(148, 163, 184, 0.08)",
    },
    cardTitle: { color: "#94a3b8", fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 },

    /* Distribution */
    distRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    distLeft: { flexDirection: "row", alignItems: "center", width: 80 },
    distDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    distName: { color: "#cbd5e1", fontSize: 13, fontWeight: "600" },
    distBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 3,
        marginHorizontal: 10,
        overflow: "hidden",
    },
    distBarFill: { height: 6, borderRadius: 3 },
    distCount: { color: "#e2e8f0", fontSize: 14, fontWeight: "700", width: 22, textAlign: "right" },
    distPct: { color: "#64748b", fontSize: 11, width: 32, textAlign: "right" },

    /* Detections */
    detItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148, 163, 184, 0.06)",
    },
    detTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    classBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    classDot: { width: 6, height: 6, borderRadius: 3 },
    classText: { fontSize: 12, fontWeight: "700" },
    confWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
    confVal: { fontSize: 14, fontWeight: "800" },
    bboxText: { color: "#475569", fontSize: 11, marginTop: 6, fontFamily: Platform.OS === "web" ? "monospace" : undefined },
});

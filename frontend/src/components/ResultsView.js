/**
 * ResultsView – Detection results visualization
 */
import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CLASS_COLORS = {
    Fragment: "#FF5733",
    Fiber: "#33FF57",
    Film: "#3357FF",
    Pellet: "#FFD700",
};

const CONFIDENCE_LEVELS = [
    { min: 0.8, label: "High", color: "#00e676", icon: "checkmark-circle" },
    { min: 0.5, label: "Medium", color: "#ffab00", icon: "alert-circle" },
    { min: 0, label: "Low", color: "#ff5252", icon: "warning" },
];

function getConfidenceLevel(conf) {
    return CONFIDENCE_LEVELS.find((l) => conf >= l.min) || CONFIDENCE_LEVELS[2];
}

export default function ResultsView({ result }) {
    if (!result) return null;

    const { detections, summary, annotated_image_base64 } = result;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerCard}>
                <View style={styles.headerRow}>
                    <Ionicons name="analytics" size={24} color="#4fc3f7" />
                    <Text style={styles.headerTitle}>Detection Results</Text>
                </View>
                {summary.demo_mode && (
                    <View style={styles.demoBadge}>
                        <Ionicons name="flask" size={14} color="#ffab00" />
                        <Text style={styles.demoText}>Demo Mode</Text>
                    </View>
                )}
            </View>

            {/* Annotated Image */}
            {annotated_image_base64 && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${annotated_image_base64}` }}
                        style={styles.annotatedImage}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
                <SummaryCard
                    icon="cellular"
                    label="Total Found"
                    value={summary.total_particles}
                    color="#4fc3f7"
                />
                <SummaryCard
                    icon="speedometer"
                    label="Avg Confidence"
                    value={`${(summary.avg_confidence * 100).toFixed(1)}%`}
                    color="#69f0ae"
                />
                <SummaryCard
                    icon="trophy"
                    label="Max Confidence"
                    value={`${(summary.max_confidence * 100).toFixed(1)}%`}
                    color="#ffd740"
                />
            </View>

            {/* Counts by Type */}
            <Text style={styles.sectionTitle}>Particle Distribution</Text>
            <View style={styles.distributionContainer}>
                {Object.entries(summary.counts_by_type).map(([name, count]) => (
                    <View key={name} style={styles.typeRow}>
                        <View style={[styles.typeDot, { backgroundColor: CLASS_COLORS[name] || "#888" }]} />
                        <Text style={styles.typeName}>{name}</Text>
                        <View style={styles.typeBarBg}>
                            <View
                                style={[
                                    styles.typeBarFill,
                                    {
                                        width: `${(count / summary.total_particles) * 100}%`,
                                        backgroundColor: CLASS_COLORS[name] || "#888",
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.typeCount}>{count}</Text>
                    </View>
                ))}
            </View>

            {/* Individual Detections */}
            <Text style={styles.sectionTitle}>Detections ({detections.length})</Text>
            {detections.map((det, i) => {
                const level = getConfidenceLevel(det.confidence);
                return (
                    <View key={i} style={styles.detectionCard}>
                        <View style={styles.detRow}>
                            <View
                                style={[styles.classBadge, { backgroundColor: CLASS_COLORS[det.class_name] || "#888" }]}
                            >
                                <Text style={styles.classBadgeText}>{det.class_name}</Text>
                            </View>
                            <View style={styles.confBadge}>
                                <Ionicons name={level.icon} size={16} color={level.color} />
                                <Text style={[styles.confText, { color: level.color }]}>
                                    {(det.confidence * 100).toFixed(1)}%
                                </Text>
                                <Text style={[styles.confLabel, { color: level.color }]}>{level.label}</Text>
                            </View>
                        </View>
                        <Text style={styles.bboxText}>
                            bbox: ({det.bbox.x1.toFixed(0)}, {det.bbox.y1.toFixed(0)}) → (
                            {det.bbox.x2.toFixed(0)}, {det.bbox.y2.toFixed(0)})
                        </Text>
                    </View>
                );
            })}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function SummaryCard({ icon, label, value, color }) {
    return (
        <View style={styles.summaryCard}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 4 },

    /* Header */
    headerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerTitle: { color: "#e0e0e0", fontSize: 20, fontWeight: "700" },
    demoBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255, 171, 0, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    demoText: { color: "#ffab00", fontSize: 12, fontWeight: "600" },

    /* Annotated Image */
    imageContainer: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#121830",
        borderWidth: 1,
        borderColor: "rgba(79, 195, 247, 0.2)",
        marginBottom: 16,
    },
    annotatedImage: { width: "100%", height: "100%" },

    /* Summary */
    summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    summaryCard: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#121830",
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "rgba(79, 195, 247, 0.15)",
    },
    summaryValue: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 6 },
    summaryLabel: { color: "#8892b0", fontSize: 11, marginTop: 2 },

    /* Section */
    sectionTitle: { color: "#b0bec5", fontSize: 14, fontWeight: "600", marginBottom: 10 },

    /* Distribution */
    distributionContainer: {
        backgroundColor: "#121830",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(79, 195, 247, 0.12)",
    },
    typeRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    typeName: { color: "#cfd8dc", width: 70, fontSize: 13 },
    typeBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 4,
        marginHorizontal: 8,
    },
    typeBarFill: { height: 8, borderRadius: 4 },
    typeCount: { color: "#e0e0e0", fontSize: 14, fontWeight: "600", width: 26, textAlign: "right" },

    /* Detection cards */
    detectionCard: {
        backgroundColor: "#121830",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(79, 195, 247, 0.1)",
    },
    detRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    classBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    classBadgeText: { color: "#000", fontSize: 12, fontWeight: "700" },
    confBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    confText: { fontSize: 14, fontWeight: "700" },
    confLabel: { fontSize: 11 },
    bboxText: { color: "#607d8b", fontSize: 11, marginTop: 6 },
});

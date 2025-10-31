import { Ionicons } from "@expo/vector-icons";
import { Barometer } from "expo-sensors";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { truncateKey } from "../chainz/hederaWallet";
import { Color } from "../constant/Color";
import { useHedera } from "../context/HederaContext";

const STREAM_INTERVAL_MS = 4_000;

const MessageItem = ({ item }) => {
  const payload = item.message?.decoded;
  const timestamp = item.receivedAt;
  const formatted = timestamp
    ? `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`
    : item.consensusTimestamp;

  return (
    <View style={styles.messageRow}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageSequence}>#{item.sequenceNumber}</Text>
        <Text style={styles.messageTimestamp}>{formatted}</Text>
      </View>
      <Text style={styles.messageBody}>
        {typeof payload === "string"
          ? payload
          : JSON.stringify(payload, null, 2)}
      </Text>
    </View>
  );
};

export default function DeviceInfo() {
  const navigation = useNavigation();
  const {
    wallet,
    topic,
    topicStatus,
    messageStatus,
    messages,
    createTopic,
    startSubscription,
    stopSubscription,
    subscriptionActive,
    publishMessage,
  } = useHedera();

  const [sensorSample, setSensorSample] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const sensorSubscriptionRef = useRef(null);
  const lastPublishedRef = useRef(0);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0)),
    [messages]
  );

  const startSensorUpdates = () => {
    if (sensorSubscriptionRef.current) {
      return;
    }
    Barometer.setUpdateInterval(2000);
    sensorSubscriptionRef.current = Barometer.addListener((data) => {
      setSensorSample({ ...data, timestamp: Date.now() });
    });
  };

  const stopSensorUpdates = () => {
    if (sensorSubscriptionRef.current?.remove) {
      sensorSubscriptionRef.current.remove();
    }
    sensorSubscriptionRef.current = null;
  };

  const ensureTopic = async () => {
    if (topic?.topicId) {
      return topic;
    }
    return createTopic({ memo: "Hardora Device Stream" });
  };

  const handleCreateTopic = async () => {
    try {
      await ensureTopic();
      Alert.alert("Topic Ready", "A new Hedera topic is configured for this device.");
    } catch (error) {
      Alert.alert("Hedera Topic", error.message || "Unable to create topic");
    }
  };

  const handleStartStreaming = async () => {
    try {
      await ensureTopic();
      await startSubscription();
      startSensorUpdates();
      setIsStreaming(true);
    } catch (error) {
      Alert.alert("Streaming", error.message || "Unable to start streaming");
    }
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    stopSensorUpdates();
  };

  const toggleSubscription = async () => {
    try {
      if (subscriptionActive) {
        stopSubscription();
      } else {
        await ensureTopic();
        await startSubscription();
      }
    } catch (error) {
      Alert.alert("Subscription", error.message || "Unable to update subscription");
    }
  };

  useEffect(() => {
    return () => {
      stopSensorUpdates();
      stopSubscription();
    };
  }, [stopSubscription]);

  useEffect(() => {
    if (!isStreaming || !sensorSample) {
      return;
    }

    const now = Date.now();
    if (now - lastPublishedRef.current < STREAM_INTERVAL_MS) {
      return;
    }
    lastPublishedRef.current = now;

    publishMessage({
      pressure: sensorSample.pressure,
      relativeAltitude: sensorSample.relativeAltitude,
    }).catch((error) => {
      Alert.alert("Publish", error.message || "Failed to submit sensor payload");
      setIsStreaming(false);
      stopSensorUpdates();
    });
  }, [sensorSample, isStreaming, publishMessage]);

  const sensorSummary = sensorSample
    ? `${sensorSample.pressure?.toFixed(2) ?? "--"} hPa`
    : "--";

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back-outline"
          color="#f5f5f5"
          size={26}
          onPress={() => navigation.navigate("AccountDashboard")}
        />
        <Text style={styles.title}>Device & Hedera Topic</Text>
      </View>

      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.sectionsContainer}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Wallet</Text>
              <Text style={styles.sectionDescription}>
                {wallet
                  ? truncateKey(wallet.publicKeyDer, { visible: 12 })
                  : "Generate a wallet to begin."}
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hedera Topic</Text>
                {(topicStatus.loading || messageStatus.loading) && (
                  <ActivityIndicator size="small" color="#ffc000" />
                )}
              </View>
              <Text style={styles.sectionDescription}>
                {topic?.topicId || "No topic yet"}
              </Text>
              {(topicStatus.error || messageStatus.error) && (
                <Text style={styles.errorText}>
                  {topicStatus.error || messageStatus.error}
                </Text>
              )}
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleCreateTopic}
                  disabled={topicStatus.loading}
                >
                  <Text style={styles.secondaryButtonText}>
                    {topic?.topicId ? "Refresh" : "Create Topic"}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={toggleSubscription}>
                  <Text style={styles.actionButtonText}>
                    {subscriptionActive ? "Stop Listening" : "Listen"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Sensor Stream</Text>
              <Text style={styles.sensorValue}>{sensorSummary}</Text>
              <Text style={styles.sectionDescription}>
                Streaming device barometer readings to Hedera Consensus Service.
              </Text>

              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.actionButton, isStreaming && styles.actionButtonDisabled]}
                  onPress={handleStartStreaming}
                  disabled={isStreaming}
                >
                  <Text style={styles.actionButtonText}>Start</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.stopButton, !isStreaming && styles.actionButtonDisabled]}
                  onPress={handleStopStreaming}
                  disabled={!isStreaming}
                >
                  <Text style={styles.stopButtonText}>Stop</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.feedTitle}>Topic Messages</Text>
          </View>
        }
        renderItem={({ item }) => <MessageItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="podium-outline" size={42} color="#ffc000" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>
              Start streaming to push barometer readings into the Hedera topic.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Color.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    fontWeight: "600",
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 18,
  },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "600",
  },
  sectionDescription: {
    color: "#f5f5f5",
    opacity: 0.75,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#ffb4ab",
    fontSize: 13,
  },
  sensorValue: {
    color: "#ffc000",
    fontSize: 40,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ffc000",
    borderRadius: 24,
    paddingVertical: 10,
  },
  actionButtonText: {
    textAlign: "center",
    color: Color.bg,
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ffc000",
  },
  secondaryButtonText: {
    textAlign: "center",
    color: "#ffc000",
    fontWeight: "600",
    fontSize: 14,
  },
  stopButton: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
  stopButtonText: {
    textAlign: "center",
    color: "#f5f5f5",
    fontWeight: "600",
    fontSize: 14,
  },
  feedTitle: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 120,
  },
  messageRow: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  messageSequence: {
    color: "#ffc000",
    fontWeight: "600",
  },
  messageTimestamp: {
    color: "#f5f5f5",
    opacity: 0.7,
    fontSize: 12,
  },
  messageBody: {
    color: "#f5f5f5",
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyDescription: {
    color: "#f5f5f5",
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Color } from "../constant/Color";
import { useHedera } from "../context/HederaContext";

export default function SetupWalletScreen() {
  const navigation = useNavigation();
  const { wallet, walletStatus, createWallet, account, accountStatus } = useHedera();

  const handleGenerateWallet = async () => {
    try {
      await createWallet();
    } catch (error) {
      Alert.alert("Hedera Wallet", error.message || "Unable to generate wallet");
    }
  };

  const copyToClipboard = async (value, label) => {
    if (!value) {
      return;
    }
    await Clipboard.setStringAsync(value);
    Alert.alert("Copied", `${label} copied to clipboard.`);
  };

  const goToVerification = () => {
    navigation.navigate("Verify");
  };

  const mnemonicWords = wallet?.mnemonicWords ?? [];
  const columns = useMemo(() => {
    const perColumn = Math.ceil(mnemonicWords.length / 2);
    return [mnemonicWords.slice(0, perColumn), mnemonicWords.slice(perColumn)];
  }, [mnemonicWords]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Hedera Wallet</Text>
          <Text style={styles.subtitle}>
            Generate a new Hedera key pair. Store the seed phrase securely to
            retain access to your account.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Seed Phrase</Text>
            <Pressable
              style={styles.generateButton}
              onPress={handleGenerateWallet}
              disabled={walletStatus.loading}
            >
              <Text style={styles.generateButtonText}>
                {walletStatus.loading ? "Generating…" : wallet ? "Regenerate" : "Generate"}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.cardHint}>
            A new wallet is created locally on your device. We do not transmit
            seed phrases or keys to any server.
          </Text>

          {wallet ? (
            <View style={styles.seedContainer}>
              <View style={styles.seedHeader}>
                <Text style={styles.seedLabel}>Write these {mnemonicWords.length} words down in order.</Text>
                <Pressable
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(wallet.mnemonic, "Seed phrase")}
                >
                  <Ionicons name="copy-outline" color={Color.bg} size={18} />
                  <Text style={styles.copyButtonText}>Copy Phrase</Text>
                </Pressable>
              </View>
              <View style={styles.seedGrid}>
                {columns.map((column, columnIndex) => (
                  <View style={styles.seedColumn} key={`column-${columnIndex}`}>
                    {column.map((word, index) => {
                      const displayIndex = columnIndex * Math.ceil(mnemonicWords.length / 2) + index + 1;
                      return (
                        <View style={styles.seedCard} key={`${displayIndex}-${word}`}>
                          <Text style={styles.seedIndex}>{displayIndex.toString().padStart(2, "0")}</Text>
                          <Text style={styles.seedWord}>{word}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
              <Text style={styles.warning}>
                Never share your seed phrase. Anyone with this phrase can control your assets.
              </Text>

              {accountStatus.loading && (
                <Text style={styles.accountStatusText}>Requesting Hedera account…</Text>
              )}

              {accountStatus.error && (
                <Text style={styles.accountStatusError}>{accountStatus.error}</Text>
              )}

              {account?.accountId && (
                <View style={styles.accountCard}>
                  <Text style={styles.accountLabel}>Provisioned Account ID</Text>
                  <Text style={styles.accountValue}>{account.accountId}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" color="#ffc000" size={48} />
              <Text style={styles.emptyTitle}>No wallet yet</Text>
              <Text style={styles.emptyDescription}>
                Tap Generate to create a new Hedera wallet and reveal its seed phrase.
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={goToVerification}
          style={[styles.nextButton, !wallet && styles.nextButtonDisabled]}
          disabled={!wallet}
        >
          <Text style={styles.nextButtonText}>Continue to Verification</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Color.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    color: "#f5f5f5",
    opacity: 0.8,
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#f5f5f5",
    fontSize: 20,
    fontWeight: "600",
  },
  cardHint: {
    color: "#f5f5f5",
    opacity: 0.75,
    fontSize: 14,
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: "#ffc000",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  generateButtonText: {
    color: Color.bg,
    fontSize: 14,
    fontWeight: "600",
  },
  seedContainer: {
    gap: 16,
  },
  seedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  seedLabel: {
    color: "#f5f5f5",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  seedGrid: {
    flexDirection: "row",
    gap: 12,
  },
  seedColumn: {
    flex: 1,
    gap: 12,
  },
  seedCard: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  seedIndex: {
    color: "#ffc000",
    fontWeight: "600",
    fontSize: 14,
    width: 24,
  },
  seedWord: {
    color: "#f5f5f5",
    fontSize: 16,
    textTransform: "lowercase",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffc000",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  copyButtonText: {
    color: Color.bg,
    fontWeight: "600",
    fontSize: 13,
  },
  warning: {
    color: "#ffb4ab",
    fontSize: 13,
    lineHeight: 18,
  },
  accountStatusText: {
    marginTop: 6,
    color: "#f5f5f5",
    opacity: 0.8,
    fontSize: 13,
  },
  accountStatusError: {
    marginTop: 6,
    color: "#ffb4ab",
    fontSize: 13,
  },
  accountCard: {
    marginTop: 12,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  accountLabel: {
    color: "#f5f5f5",
    opacity: 0.7,
    fontSize: 12,
  },
  accountValue: {
    color: "#ffc000",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyDescription: {
    color: "#f5f5f5",
    opacity: 0.75,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 260,
  },
  nextButton: {
    marginTop: 24,
    backgroundColor: "#ffc000",
    paddingVertical: 14,
    borderRadius: 35,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    textAlign: "center",
    color: Color.bg,
    fontSize: 18,
    fontWeight: "600",
  },
});

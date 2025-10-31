import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Color } from "../constant/Color";
import { useHedera } from "../context/HederaContext";

export default function VerifyScreen() {
  const navigation = useNavigation();
  const { wallet } = useHedera();
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

  const goBack = () => {
    navigation.navigate("SetupWalletScreen");
  };

  useEffect(() => {
    if (!wallet?.mnemonicWords) {
      setAvailableWords([]);
      setSelectedWords([]);
      return;
    }

    const shuffled = wallet.mnemonicWords
      .map((word, index) => ({ word, originalIndex: index, uid: `${index}-${word}-${Math.random()}` }))
      .map((item) => ({ ...item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort, ...rest }) => rest);
    setAvailableWords(shuffled);
    setSelectedWords([]);
  }, [wallet?.mnemonicWords]);

  const handleSelectWord = (entry) => {
    setAvailableWords((prev) => prev.filter((item) => item.uid !== entry.uid));
    setSelectedWords((prev) => [...prev, entry]);
  };

  const handleRemoveWord = (index) => {
    setSelectedWords((prev) => {
      const clone = [...prev];
      const [removed] = clone.splice(index, 1);
      setAvailableWords((words) => [...words, removed]);
      return clone;
    });
  };

  const proceed = () => {
    if (!wallet?.mnemonicWords) {
      Alert.alert("No Wallet", "Generate a wallet before verifying.");
      navigation.navigate("SetupWalletScreen");
      return;
    }

    if (!isValid) {
      Alert.alert("Incorrect Order", "Please tap the words in the correct order to continue.");
      return;
    }

    navigation.navigate("Proceed");
  };

  const clearSelection = () => {
    if (!wallet?.mnemonicWords) {
      return;
    }
    setAvailableWords((prev) => [...prev, ...selectedWords]);
    setSelectedWords([]);
  };

  const expectedPhrase = wallet?.mnemonicWords ?? [];
  const isValid = useMemo(() => {
    if (!expectedPhrase.length || selectedWords.length !== expectedPhrase.length) {
      return false;
    }
    return selectedWords.every((entry, index) => entry.originalIndex === index);
  }, [expectedPhrase, selectedWords]);

  const isComplete = selectedWords.length === expectedPhrase.length;

  const hasWallet = Boolean(wallet?.mnemonicWords?.length);

  useEffect(() => {
    if (!hasWallet) {
      Alert.alert("No Wallet", "Generate a seed phrase before verification.");
      navigation.navigate("SetupWalletScreen");
    }
  }, [hasWallet, navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="arrow-back-outline" color="#f5f5f5" size={26} onPress={goBack} />
          <Text style={styles.title}>Verify Seed Phrase</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tap the words in the correct order</Text>
          <Text style={styles.cardDescription}>
            This step ensures you have a safe copy of your seed phrase. Choose each
            word once until the full phrase is reconstructed.
          </Text>

          <View style={styles.selectedContainer}>
            {selectedWords.length ? (
              selectedWords.map((entry, index) => (
                <Pressable
                  key={`${entry.uid}-selected`}
                  style={[styles.selectedChip, isValid && index === selectedWords.length - 1 && isComplete ? styles.selectedChipValid : null]}
                  onPress={() => handleRemoveWord(index)}
                >
                  <Text style={styles.selectedIndex}>{index + 1}.</Text>
                  <Text style={styles.selectedText}>{entry.word}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.placeholderText}>Your selections will appear here.</Text>
            )}
          </View>

          <View style={styles.wordBank}>
            {availableWords.map((entry) => (
              <Pressable
                key={entry.uid}
                style={styles.wordChip}
                onPress={() => handleSelectWord(entry)}
              >
                <Text style={styles.wordChipText}>{entry.word}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.controlsRow}>
            <Pressable style={[styles.controlButton, styles.secondaryButton]} onPress={clearSelection} disabled={!selectedWords.length}>
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </Pressable>
            <Pressable
              style={[styles.controlButton, (!isComplete || !isValid) && styles.controlButtonDisabled]}
              onPress={proceed}
              disabled={!isComplete || !isValid}
            >
              <Text style={styles.controlButtonText}>Proceed</Text>
            </Pressable>
          </View>
        </View>
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
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
  cardTitle: {
    color: "#f5f5f5",
    fontSize: 20,
    fontWeight: "600",
  },
  cardDescription: {
    color: "#f5f5f5",
    opacity: 0.75,
    fontSize: 15,
    lineHeight: 22,
  },
  selectedContainer: {
    minHeight: 80,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "flex-start",
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  selectedChip: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectedChipValid: {
    backgroundColor: "rgba(34, 197, 94, 0.28)",
  },
  selectedIndex: {
    color: "#ffc000",
    fontWeight: "600",
    fontSize: 14,
  },
  selectedText: {
    color: "#f5f5f5",
    fontSize: 14,
  },
  wordBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  wordChip: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  wordChipText: {
    color: Color.bg,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "lowercase",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: "#ffc000",
    borderRadius: 30,
    paddingVertical: 12,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    textAlign: "center",
    color: Color.bg,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ffc000",
  },
  secondaryButtonText: {
    textAlign: "center",
    color: "#ffc000",
    fontSize: 16,
    fontWeight: "600",
  },
});

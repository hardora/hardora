import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color } from "../constant/Color";

export default function ConnectTrustedDevices() {
  const navigation = useNavigation();

  const steps = [
    "Insert the trusted device into the provided port.",
    "Ensure the device status indicator shows a solid light.",
    "Tap the connect button below to finalize pairing.",
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons
            name="arrow-back-outline"
            color="#f5f5f5"
            size={26}
            onPress={() => navigation.navigate("AccountDashboard")}
          />
          <Text style={styles.title}>Connect Trusted Device</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Setup</Text>
          <Text style={styles.description}>
            Follow the steps below to securely connect your trusted device.
          </Text>

          <View style={styles.steps}>
            {steps.map((step, index) => (
              <View style={styles.stepRow} key={step}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepIndex}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Proceed")}
          >
            <Text style={styles.primaryText}>Connect Device</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.homeButton}
          onPress={() => navigation.navigate("AccountDashboard")}
        >
          <Ionicons name="home-outline" color="#f5f5f5" size={26} />
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
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 30,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#424674",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 18,
  },
  cardTitle: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    color: "#f5f5f5",
    opacity: 0.85,
    fontSize: 16,
    lineHeight: 22,
  },
  steps: {
    gap: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffc000",
    justifyContent: "center",
    alignItems: "center",
  },
  stepIndex: {
    color: Color.bg,
    fontWeight: "700",
  },
  stepText: {
    color: "#f5f5f5",
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#ffc000",
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: Color.bg,
    fontSize: 18,
    fontWeight: "600",
  },
  homeButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 50,
    padding: 14,
    alignSelf: "center",
    marginTop: 8,
  },
});

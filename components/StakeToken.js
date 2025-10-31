import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color } from "../constant/Color";

export default function StakeToken() {
  const navigation = useNavigation();

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
          <Text style={styles.title}>Stake Token</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.subtleText}>Available Balance</Text>
          <Text style={styles.balanceValue}>23.008</Text>
          <Text style={styles.metaText}>Equiv: $500.27</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Amount To Stake</Text>
          <Text style={styles.stakeAmount}>10.00</Text>

          <Text style={styles.description}>
            You are about to stake 10.00 Hardora tokens as a
            node/validator. Ensure you have reviewed the details before
            proceeding to validate the stake.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("ValidateStake")}
          >
            <Text style={styles.primaryText}>Stake Now</Text>
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
  balanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 20,
    gap: 10,
    alignItems: "flex-start",
  },
  subtleText: {
    color: "#f5f5f5",
    opacity: 0.7,
    fontSize: 16,
  },
  balanceValue: {
    color: "#f5f5f5",
    fontSize: 40,
    fontWeight: "700",
  },
  metaText: {
    color: "#f5f5f5",
    fontSize: 14,
    opacity: 0.8,
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
  stakeAmount: {
    color: "#f5f5f5",
    fontSize: 48,
    fontWeight: "700",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.25)",
    borderRadius: 28,
    paddingVertical: 20,
  },
  description: {
    color: "#f5f5f5",
    fontSize: 16,
    opacity: 0.85,
    lineHeight: 22,
    textAlign: "center",
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

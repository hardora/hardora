import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color } from "../constant/Color";

export default function AccountInformation() {
  const navigation = useNavigation();

  const stakeMeta = [
    { label: "Stake Date", value: "16/03/2023" },
    { label: "Withdrawal Date", value: "15/05/2023" },
    { label: "Time", value: "09:23:01 am" },
  ];

  const nodeMeta = [
    { label: "Node Username", value: "femi0x00" },
    { label: "Node ID", value: "0xab58051b...259aec9" },
    { label: "Role", value: "Validator" },
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
          <Text style={styles.title}>Account Information</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.subtleText}>Available Balance</Text>
          <Text style={styles.balanceValue}>23.008</Text>
          <View style={styles.balanceMeta}>
            <Text style={styles.metaText}>Equiv: $217.50</Text>
            <Text style={styles.metaText}>Validation: 17</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Stake Information</Text>
            <Ionicons
              style={styles.iconButton}
              name="copy-outline"
              color="#ffc000"
              size={22}
            />
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Amount Staked</Text>
            <Text style={styles.metricValue}>23.008</Text>
          </View>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>Equiv: $217.50</Text>
          </View>

          <View style={styles.metaList}>
            {stakeMeta.map((item) => (
              <View style={styles.metaRow} key={item.label}>
                <Text style={styles.metaLabel}>{item.label}</Text>
                <Text style={styles.metaValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Node Information</Text>
            <Ionicons
              style={styles.iconButton}
              name="copy-outline"
              color="#ffc000"
              size={22}
            />
          </View>

          <View style={styles.metaList}>
            {nodeMeta.map((item) => (
              <View style={styles.metaRow} key={item.label}>
                <Text style={styles.metaLabel}>{item.label}</Text>
                <Text style={styles.metaValue}>{item.value}</Text>
              </View>
            ))}
          </View>
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
    gap: 12,
  },
  subtleText: {
    color: "#f5f5f5",
    opacity: 0.7,
    fontSize: 16,
  },
  balanceValue: {
    color: "#f5f5f5",
    fontSize: 42,
    fontWeight: "700",
  },
  balanceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    paddingVertical: 18,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    padding: 6,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    color: "#f5f5f5",
    fontSize: 16,
    opacity: 0.85,
  },
  metricValue: {
    color: "#f5f5f5",
    fontSize: 20,
    fontWeight: "600",
  },
  tagRow: {
    alignItems: "flex-end",
  },
  tag: {
    color: "#f5f5f5",
    fontSize: 14,
    borderColor: "#f5f5f5",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  metaList: {
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    color: "#f5f5f5",
    opacity: 0.8,
    fontSize: 16,
  },
  metaValue: {
    color: "#f5f5f5",
    fontSize: 16,
    fontWeight: "500",
  },
  homeButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 50,
    padding: 14,
    alignSelf: "center",
    marginTop: 8,
  },
});

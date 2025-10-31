import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color } from "../constant/Color";

export default function Staked() {
  const navigation = useNavigation();

  const summaryRows = [
    { label: "Node ID", value: "0xad40234i...564bbb4" },
    { label: "Date", value: "16/03/2023" },
    { label: "Time", value: "09:23:01 am" },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stake Submitted Successfully</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-done" color={Color.bg} size={30} />
          </View>
          <Text style={styles.statusText}>
            Your stake has been recorded and is now active on the network.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Stake Summary</Text>
            <Ionicons
              name="copy-outline"
              color="#ffc000"
              size={22}
              style={styles.iconButton}
            />
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount Staked</Text>
            <Text style={styles.amountValue}>10.0000</Text>
          </View>
          <Text style={styles.meta}>Equiv: $217.50</Text>

          <View style={styles.metaList}>
            {summaryRows.map((row) => (
              <View style={styles.metaRow} key={row.label}>
                <Text style={styles.metaLabel}>{row.label}</Text>
                <Text style={styles.metaValue}>{row.value}</Text>
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
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#424674",
    borderRadius: 28,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 16,
  },
  statusBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffc000",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#f5f5f5",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.9,
  },
  card: {
    backgroundColor: "#424674",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
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
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    color: "#f5f5f5",
    fontSize: 16,
    opacity: 0.85,
  },
  amountValue: {
    color: "#f5f5f5",
    fontSize: 32,
    fontWeight: "700",
  },
  meta: {
    color: "#f5f5f5",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "right",
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
  },
});

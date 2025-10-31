import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color } from "../constant/Color";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const quickActions = [
    { icon: "add-outline", label: "Buy" },
    { icon: "arrow-down-outline", label: "Receive" },
    { icon: "arrow-up-outline", label: "Send" },
    { icon: "grid-outline", label: "More" },
  ];

  const managementItems = [
    {
      icon: "add-circle-outline",
      label: "Connect Trusted Device",
      onPress: () => navigation.navigate("TrustedDevices"),
    },
    {
      icon: "wallet-outline",
      label: "Stake Token",
      onPress: () => navigation.navigate("StakeToken"),
    },
    {
      icon: "document-attach-outline",
      label: "Account Information",
      onPress: () => navigation.navigate("AccountInformation"),
    },
    {
      icon: "information-circle-outline",
      label: "Trusted Device Info",
      onPress: () => navigation.navigate("DeviceInfo"),
    },
    {
      icon: "settings-outline",
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Dashboard</Text>
          <Pressable style={styles.usernameButton}>
            <Ionicons name="add-outline" color={Color.bg} size={18} />
            <Text style={styles.usernameText}>Add Username</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.subtleText}>Available Balance</Text>
          </View>
          <Text style={styles.amount}>23.008</Text>
          <View style={styles.balanceMeta}>
            <Text style={styles.metaText}>Equiv: $500.27</Text>
            <Text style={styles.metaText}>Validation: 17</Text>
          </View>

          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <View style={styles.quickCard} key={action.label}>
                <View style={styles.quickIcon}>
                  <Ionicons name={action.icon} color="#f5f5f5" size={18} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Manage Account</Text>
          <ScrollView
            style={styles.sectionList}
            contentContainerStyle={styles.sectionListContent}
            showsVerticalScrollIndicator={false}
          >
            {managementItems.map((item, index) => (
              <Pressable
                style={[
                  styles.sectionItem,
                  index === managementItems.length - 1 && styles.sectionItemLast,
                ]}
                key={item.label}
                onPress={item.onPress}
              >
                <View style={styles.sectionIcon}>
                  <Ionicons name={item.icon} color="#ffc000" size={22} />
                </View>
                <Text style={styles.sectionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" color="#9ca3af" size={18} />
              </Pressable>
            ))}
          </ScrollView>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 28,
    fontWeight: "700",
  },
  usernameButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  usernameText: {
    color: Color.bg,
    fontSize: 14,
    fontWeight: "600",
  },
  balanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtleText: {
    color: "#f5f5f5",
    opacity: 0.7,
    fontSize: 16,
  },
  amount: {
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
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  quickCard: {
    alignItems: "center",
    width: "24%",
    gap: 12,
  },
  quickIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 999,
    padding: 12,
  },
  quickLabel: {
    color: "#f5f5f5",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    marginHorizontal: -20,
  },
  sectionTitle: {
    color: Color.bg,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionList: {
    maxHeight: 270,
  },
  sectionListContent: {
    paddingBottom: 4,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 20, 50, 0.08)",
  },
  sectionItemLast: {
    borderBottomWidth: 0,
  },
  sectionIcon: {
    backgroundColor: "rgba(255, 192, 0, 0.12)",
    borderRadius: 14,
    padding: 10,
    marginRight: 16,
  },
  sectionLabel: {
    flex: 1,
    color: Color.bg,
    fontSize: 16,
    fontWeight: "500",
  },
});

import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, StyleSheet, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { truncateKey } from "../chainz/hederaWallet";
import { Color } from "../constant/Color";
import { useHedera } from "../context/HederaContext";

export default function ProceedToHome() {
  const navigation = useNavigation();
  const { wallet, topic, account, accountStatus } = useHedera();

  function nextHandler() {
    navigation.navigate("AccountDashboard");
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.logo}>
          {/* <Image source={require("../assets/images/logo_s.png")} /> */}
        </View>
        <View>
          <Text style={styles.textBig}>Congratulations!</Text>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Hedera Public Key</Text>
          <Text style={styles.walletValue}>
            {wallet ? truncateKey(wallet.publicKeyDer, { visible: 12 }) : "No wallet available"}
          </Text>
        </View>

        {topic?.topicId && (
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Device Topic ID</Text>
            <Text style={styles.walletValue}>{topic.topicId}</Text>
          </View>
        )}

        {account?.accountId && (
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Hedera Account</Text>
            <Text style={styles.walletValue}>{account.accountId}</Text>
          </View>
        )}

        {accountStatus?.error && (
          <Text style={styles.errorText}>Account provisioning failed: {accountStatus.error}</Text>
        )}

        <View style={styles.buttonHolder}>
          <Pressable
            onPress={nextHandler}
            style={
              ([({ pressed }) => pressed && styles.pressed], styles.nextButton)
            }
          >
            <View
              style={{
                marginHorizontal: 10,
              }}
            >
              <Text style={styles.next}>Proceed To Homepage</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "white",
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: "#ffc000",
    padding: 5,
    borderRadius: 35,
    marginVertical: 30,
  },
  next: {
    backgroundColor: "#ffc000",
    padding: 5,
    borderRadius: 35,
    fontSize: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 24,
    textAlign: "center",
    color: "white",
  },
  textBig: {
    color: "white",
    fontSize: 40,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonHolder: {
    borderRadius: 40,
    marginVertical: 30,
    paddingHorizontal: 60,
    justifyContent: "center",
  },
  logo: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  walletCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 24,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 8,
  },
  walletLabel: {
    color: "#f5f5f5",
    opacity: 0.75,
    fontSize: 14,
    textAlign: "center",
  },
  walletValue: {
    color: "#f5f5f5",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  errorText: {
    color: "#ffb4ab",
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 16,
    fontSize: 14,
  },

  container: {
    flex: 1,
    backgroundColor: Color.bg,
    paddingTop: 10,
  },
});

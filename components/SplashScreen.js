import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Image, SafeAreaView, StyleSheet, View } from "react-native";
import { Color } from "../constant/Color";
import { useHedera } from "../context/HederaContext";

const SplashScreen = ({ navigation }) => {
  const { wallet, walletHydrated } = useHedera();

  useEffect(() => {
    if (!walletHydrated) {
      return;
    }

    const targetRoute = wallet ? "AccountDashboard" : "Home";
    const timeout = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: targetRoute }],
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [navigation, wallet, walletHydrated]);

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.rootContainer}>
        <View style={styles.logoImage}>
          <SafeAreaView>
            {/* <Image source={require("../assets/images/logo.png")} /> */}
          </SafeAreaView>
        </View>
        <View style={styles.nodeImage}>
          {/* <Image source={require("../assets/images/illus.png")} /> */}
        </View>
      </View>
    </>
  );
};
export default SplashScreen;

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: Color.bg,
    flex: 1,
  },
  nodeImage: {
    marginTop: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  splash: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
});

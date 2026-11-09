import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bildirimler Sayfası</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D2749",
  },
});

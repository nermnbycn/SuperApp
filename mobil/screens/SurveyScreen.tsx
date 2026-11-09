import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SurveyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anketler Sayfası</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D2749",
  },
});

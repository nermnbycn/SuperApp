
import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MessageScreen from "../screens/MessageScreen";
import AppHeader from "../components/AppHeader";

export type MessageStackParamList = {
  Message: undefined;
};

const Stack = createNativeStackNavigator<MessageStackParamList>();

export default function MessageNavigator() {
  return (
    <View style={styles.container}>
      <AppHeader showShortcuts={false} />

      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Message"
            component={MessageScreen}
          />
        </Stack.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    flex: 1,
  },
});

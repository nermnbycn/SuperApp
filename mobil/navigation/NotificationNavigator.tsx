
import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NotificationScreen from "../screens/NotificationScreen";
import AppHeader from "../components/AppHeader";

export type NotificationStackParamList = {
  Notification: undefined;
};

const Stack = createNativeStackNavigator<NotificationStackParamList>();

export default function NotificationNavigator() {
  return (
    <View style={styles.container}>
      <AppHeader showShortcuts={false} />

      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
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

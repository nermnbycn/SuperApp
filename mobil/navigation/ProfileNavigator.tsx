
import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/ProfileScreen";
import AppHeader from "../components/AppHeader";

export type ProfileStackParamList = {
  Profile: undefined;
};

type Props = {
  onLogout: () => Promise<void>;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator({ onLogout }: Props) {
  return (
    <View style={styles.container}>
      <AppHeader showShortcuts={false} />

      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Profile">
            {() => <ProfileScreen onLogout={onLogout} />}
          </Stack.Screen>
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

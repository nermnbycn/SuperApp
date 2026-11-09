import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";

export type AnnouncementStackParamList = {
  home: undefined;
};

const Stack = createNativeStackNavigator<AnnouncementStackParamList>();

export default function AnnouncementNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

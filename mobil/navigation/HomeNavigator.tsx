
import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppHeader from "../components/AppHeader";

import HomeScreen from "../screens/HomeScreen";
import CompanyNewScreen from "../screens/CompanyNewScreen";
import BlogScreen from "../screens/BlogScreen";
import SurveyScreen from "../screens/SurveyScreen";
import AnnouncementsScreen from "../screens/AnnouncmentScreen";
import BlogDetailScreen from "../screens/BlogDetailScreen";
import GroupNewsDetailScreen from "../screens/GroupNewsDetailScreen";
import AnnouncementDetailScreen from "../screens/AnnouncementDetailScreen";

export type HomeStackParamList = {
  Home: undefined;
  Blog: undefined;
  CompanyNew: undefined;
  Survey: undefined;
  Announcement: undefined;
  BlogDetail: { blogId: number };
  GroupNewsDetail: { newId: number };
  AnnouncementDetail: { announcementId: number };
};

interface HomeNavigatorProps {
  onShortcutPress: (key: string) => void;
}

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator({
  onShortcutPress,
}: HomeNavigatorProps) {
  return (
    <View style={styles.container}>
      {/* SABİT APP HEADER */}
      <View style={styles.headerLayer}>
        <AppHeader
          showShortcuts={true}
          onShortcutPress={onShortcutPress}
        />
      </View>

      {/* HEADER ALTINDA DEĞİŞEN SAYFALAR */}
      <View style={styles.content}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#F7F8FA",
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />

          <Stack.Screen
            name="Blog"
            component={BlogScreen}
          />

          <Stack.Screen
            name="CompanyNew"
            component={CompanyNewScreen}
          />

          <Stack.Screen
            name="Announcement"
            component={AnnouncementsScreen}
          />

          <Stack.Screen
            name="Survey"
            component={SurveyScreen}
          />

          <Stack.Screen
            name="BlogDetail"
            component={BlogDetailScreen}
          />

          <Stack.Screen
            name="GroupNewsDetail"
            component={GroupNewsDetailScreen}
          />

          <Stack.Screen
            name="AnnouncementDetail"
            component={AnnouncementDetailScreen}
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

  headerLayer: {
    position: "relative",
    zIndex: 20,
    backgroundColor: "transparent",
    overflow: "visible",
  },

  content: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    marginTop: -20,
    zIndex: 1,
  },
});

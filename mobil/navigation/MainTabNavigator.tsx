
import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeNavigator from "./HomeNavigator";
import MessageNavigator from "./MessageNavigator";
import NotificationNavigator from "./NotificationNavigator";
import ProfileNavigator from "./ProfileNavigator";

export type MainTabParamList = {
  HomeTab: undefined;
  MessageTab: undefined;
  SuperAppTab: undefined;
  NotificationTab: undefined;
  ProfileTab: undefined;
};

interface MainTabNavigatorProps {
  onSuperAppPress: () => void;
  onLogout: () => Promise<void>;
  onShortcutPress: (key: string) => void;
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type TabIconProps = {
  focused: boolean;
  activeName: IconName;
  inactiveName: IconName;
  offsetY: number;
  iconSize: number;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function EmptySuperAppScreen() {
  return null;
}

const COLORS = {
  primary: "#1D2749",
  white: "#FFFFFF",
  centerOuter: "#DBE4F5",
  notification: "#DC2626",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function TabIcon({
  focused,
  activeName,
  inactiveName,
  offsetY,
  iconSize,
}: TabIconProps) {
  return (
    <View
      style={[
        styles.tabIconCenter,
        {
          transform: [{ translateY: offsetY }],
        },
      ]}
    >
      <Ionicons
        name={focused ? activeName : inactiveName}
        size={iconSize}
        color={COLORS.primary}
      />
    </View>
  );
}

export default function MainTabNavigator({
  onSuperAppPress,
  onLogout,
  onShortcutPress,
}: MainTabNavigatorProps) {
  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();

  const shortestSide = Math.min(width, height);

  const responsiveScale = clamp(
    shortestSide / 430,
    1,
    1.5,
  );

  const barScale = Math.min(responsiveScale, 1.15);
  const buttonScale = Math.min(responsiveScale, 1.35);

  const tabHeight = 66 * barScale;
  const tabBarHeight = tabHeight + insets.bottom;
  const iconSize = 29 * barScale;

  const iconOffset = -insets.bottom / 2 + 30;

  const centerOuterSize = 80 * buttonScale;
  const centerInnerSize = 62 * buttonScale;
  const centerIconSize = 27 * buttonScale;

  const centerButtonTop = -44 * buttonScale;

  const isActive = (
    navigation: {
      getState: () => {
        index: number;
        routes: { name: string }[];
      };
    },
    screenName: string,
  ) => {
    const state = navigation.getState();

    return state.routes[state.index]?.name === screenName;
  };

  const getItemStyle = (active: boolean) => ({
    backgroundColor: COLORS.white,
    padding: 0,
    margin: 0,
    height: "100%" as const,
  });

  const renderTabIcon = (
    focused: boolean,
    activeName: IconName,
    inactiveName: IconName,
  ) => (
    <TabIcon
      focused={focused}
      activeName={activeName}
      inactiveName={inactiveName}
      offsetY={iconOffset}
      iconSize={iconSize}
    />
  );

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 0,
          elevation: 12,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },

        tabBarItemStyle: {
          padding: 0,
          margin: 0,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {/* ANA SAYFA */}
      <Tab.Screen
        name="HomeTab"
        options={({ navigation }) => ({
          tabBarItemStyle: getItemStyle(
            isActive(navigation, "HomeTab"),
          ),

          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              "home",
              "home-outline",
            ),
        })}
      >
        {() => (
          <HomeNavigator
            onShortcutPress={onShortcutPress}
          />
        )}
      </Tab.Screen>

      {/* MESAJLAR */}
      <Tab.Screen
        name="MessageTab"
        component={MessageNavigator}
        options={({ navigation }) => ({
          lazy: false,

          tabBarItemStyle: getItemStyle(
            isActive(navigation, "MessageTab"),
          ),

          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              "chatbubble-ellipses",
              "chatbubble-ellipses-outline",
            ),

          tabBarBadgeStyle: {
            backgroundColor: COLORS.notification,
            color: COLORS.white,
            fontSize: 10,
            fontWeight: "800",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            textAlign: "center",
            top: 8,
          },
        })}
      />

      {/* SUPER APP */}
      <Tab.Screen
        name="SuperAppTab"
        component={EmptySuperAppScreen}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            onSuperAppPress();
          },
        }}
        options={{
          tabBarItemStyle: getItemStyle(false),

          tabBarIcon: () => (
            <View
              style={[
                styles.centerButtonOuter,
                {
                  top: centerButtonTop,
                  width: centerOuterSize,
                  height: centerOuterSize,
                  borderRadius: centerOuterSize / 2,
                },
              ]}
            >
              <View
                style={[
                  styles.centerButton,
                  {
                    width: centerInnerSize,
                    height: centerInnerSize,
                    borderRadius: centerInnerSize / 2,
                  },
                ]}
              >
                <Ionicons
                  name="grid"
                  size={centerIconSize}
                  color={COLORS.primary}
                />
              </View>
            </View>
          ),
        }}
      />

      {/* BİLDİRİMLER */}
      <Tab.Screen
        name="NotificationTab"
        component={NotificationNavigator}
        options={({ navigation }) => ({
          tabBarItemStyle: getItemStyle(
            isActive(navigation, "NotificationTab"),
          ),

          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              "notifications",
              "notifications-outline",
            ),
        })}
      />

      {/* PROFİL */}
      <Tab.Screen
        name="ProfileTab"
        options={({ navigation }) => ({
          tabBarItemStyle: getItemStyle(
            isActive(navigation, "ProfileTab"),
          ),

          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              "person",
              "person-outline",
            ),
        })}
      >
        {() => (
          <ProfileNavigator onLogout={onLogout} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },

  centerButtonOuter: {
    position: "absolute",
    backgroundColor: COLORS.centerOuter,
    alignItems: "center",
    justifyContent: "center",
  },

  centerButton: {
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#FFFFFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
});

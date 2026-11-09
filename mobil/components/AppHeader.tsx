
import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSelector } from "react-redux";
import type { RootState } from "../redux/Store";
import { useHeaderScroll } from "../context/HeaderScrollContext";

const COLORS = {
  primary: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
};

const EXPANDED_HEIGHT = 205;
const SVG_HEIGHT = 205;
const HEADER_ROW_HEIGHT = 60;

const SHORTCUT_HEIGHT = 100;
const SHORTCUT_OVERLAP = 90;
const SHORTCUT_BOTTOM_SPACE = 10;

interface AppHeaderProps {
  showShortcuts?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onShortcutPress?: (key: string) => void;
}

const shortcuts = [
  {
    key: "blogs",
    title: "Bloglar",
    icon: "book-open-outline",
  },
  {
    key: "news",
    title: "Haberler",
    icon: "newspaper-variant-outline",
  },
  {
    key: "announcement",
    title: "Duyurular",
    icon: "bullhorn-outline",
  },
  {
    key: "surveys",
    title: "Anketler",
    icon: "clipboard-list-outline",
  },
] as const;

export default function AppHeader({
  showShortcuts = true,
  onShortcutPress,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { collapsed, isHomeTab } = useHeaderScroll();
  const { width } = useWindowDimensions();

  const profile = useSelector(
    (state: RootState) => state.profile.profile,
  );

  const [activeShortcut, setActiveShortcut] =
    useState<string | null>(null);

  const animation = useRef(new Animated.Value(0)).current;
  const handRotation = useRef(new Animated.Value(0)).current;

  const isCollapsed = isHomeTab && collapsed;

  const collapsedHeight = insets.top + HEADER_ROW_HEIGHT;

  const shouldShowShortcuts = showShortcuts && isHomeTab;

  // HEADER AÇILMA / KAPANMA
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isCollapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [animation, isCollapsed]);

  const headerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [EXPANDED_HEIGHT, collapsedHeight],
  });

  // HEADER ARKA PLANI
  const headerBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", COLORS.primary],
  });

  // Kavis animasyon sırasında kaybolur.
  const svgOpacity = animation.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 0, 0],
  });

  // Kartlar erken saydamlaşır.
  const shortcutOpacity = animation.interpolate({
    inputRange: [0, 0.3, 0.65, 1],
    outputRange: [1, 0.65, 0, 0],
  });

  // Kartların dikey hareketi.
  const shortcutTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  // Kartların alt içerik için ayırdığı alan.
  const shortcutSpace = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      SHORTCUT_HEIGHT -
        SHORTCUT_OVERLAP +
        SHORTCUT_BOTTOM_SPACE,
      0,
    ],
  });

  // EL SALLAMA ANİMASYONU
  useEffect(() => {
    const wave = () => {
      handRotation.setValue(0);

      Animated.sequence([
        Animated.timing(handRotation, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(handRotation, {
          toValue: -1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(handRotation, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(handRotation, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    };

    wave();

    const interval = setInterval(wave, 10000);

    return () => {
      clearInterval(interval);
      handRotation.stopAnimation();
    };
  }, [handRotation]);

  const handRotate = handRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-22deg", "0deg", "22deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER VE KARTLARIN ORTAK ALANI */}
      <Animated.View
        style={[
          styles.headerArea,
          {
            height: headerHeight,
          },
        ]}
      >
        {/* KAVİSLİ HEADER */}
        <Animated.View
          style={[
            styles.headerBackground,
            {
              backgroundColor: headerBackgroundColor,
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.svgContainer,
              {
                opacity: svgOpacity,
              },
            ]}
          >
            <Svg
              width={width}
              height={SVG_HEIGHT}
              viewBox="0 0 390 190"
              preserveAspectRatio="none"
            >
              <Path
                d="M0 0 H390 V100 C365 135 342 147 305 151 C260 156 226 145 184 158 C145 171 110 173 75 172 C38 172 14 153 0 136 Z"
                fill={COLORS.primary}
              />
            </Svg>
          </Animated.View>

          {/* KARŞILAMA ALANI */}
          <SafeAreaView
            edges={["top"]}
            style={styles.safeArea}
          >
            <View style={styles.headerRow}>
              <View style={styles.welcomeRow}>
                <Text
                  style={styles.welcome}
                  numberOfLines={1}
                >
                  {profile
                    ? `Hoş geldin, ${profile.firstName} ${profile.lastName}`
                    : "Hoş geldin!"}
                </Text>

                <Animated.Text
                  style={[
                    styles.wavingHand,
                    {
                      transform: [
                        { rotate: handRotate },
                      ],
                    },
                  ]}
                >
                  👋
                </Animated.Text>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* MUTLAK KONUMLU SHORTCUT KARTLARI */}
        {shouldShowShortcuts && (
          <Animated.View
            pointerEvents={isCollapsed ? "none" : "auto"}
            style={[
              styles.shortcutOverlay,
              {
                opacity: shortcutOpacity,
                transform: [
                  { translateY: shortcutTranslateY },
                ],
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.shortcutsScroll}
              contentContainerStyle={styles.shortcutsContainer}
            >
              {shortcuts.map((item) => {
                const active = activeShortcut === item.key;

                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.8}
                    style={[
                      styles.shortcutCard,
                      active && styles.activeCard,
                    ]}
                    onPress={() => {
                      setActiveShortcut(item.key);
                      onShortcutPress?.(item.key);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={COLORS.primary}
                    />

                    <Text
                      style={[
                        styles.shortcutText,
                        active && styles.activeCardText,
                      ]}
                    >
                      {item.title}
                    </Text>

                    {active && (
                      <View style={styles.activeArrow} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>

      {/* ŞEFFAF YERLEŞİM ALANI */}
      {shouldShowShortcuts && (
        <Animated.View
          pointerEvents="none"
          style={{
            height: shortcutSpace,
            backgroundColor: "transparent",
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    zIndex: 10,
    overflow: "visible",
  },

  headerArea: {
    position: "relative",
    overflow: "visible",
    zIndex: 2,
  },

  headerBackground: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },

  svgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  safeArea: {
    backgroundColor: "transparent",
  },

  headerRow: {
    height: HEADER_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },

  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 7,
  },

  welcome: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },

  wavingHand: {
    fontSize: 25,
    includeFontPadding: false,
  },

  // KARTLAR HEADER'IN ÜZERİNDE BAĞIMSIZ KATMAN
  shortcutOverlay: {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    height: SHORTCUT_HEIGHT,
    backgroundColor: "transparent",
    zIndex: 20,
    overflow: "visible",
  },

  shortcutsScroll: {
    width: "100%",
    backgroundColor: "transparent",
  },

  shortcutsContainer: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 3,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "transparent",
  },

  shortcutCard: {
    width: 72,
    height: 80,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  activeCard: {
    backgroundColor: "#DBE4F5",
  },

  shortcutText: {
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "500",
  },

  activeCardText: {
    color: COLORS.primary,
  },

  activeArrow: {
    position: "absolute",
    bottom: -10,
    width: 17,
    height: 20,
    backgroundColor: "#DBE4F5",
    transform: [
      { rotate: "45deg" },
    ],
  },
});

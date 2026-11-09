import React, { useEffect, useRef, useState } from "react";
import { SvgXml } from "react-native-svg";

import {
  pulseSvg,
  testsuiteSvg,
} from "../assets/images/superapp/svgContents";
import {
  Alert,
  Animated,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurTargetView, BlurView } from "expo-blur";

interface Props {
  visible: boolean;
  onClose: () => void;
  blurTarget: React.RefObject<React.ComponentRef<typeof BlurTargetView> | null>;
}

const COLORS = {
  primary: "#1D2749",
  white: "#FFFFFF",
};

// URL'leri şirket uygulamalarının gerçek linkleriyle doldur.
// Logo dosyalarını assets/images/superapp/ klasörüne koy.
const applications = [
  {
    id: "wsa",
    title: "WSA",
    image: require("../assets/images/superapp/app-logo-1.png"),
    url: "",
  },
  {
    id: "efor",
    title: "efor",
    image: require("../assets/images/superapp/app-logo-2.png"),
    url: "",
  },
  {
    id: "kaizen",
    title: "KAİZEN",
    image: require("../assets/images/superapp/app-logo-3.png"),
    url: "",
  },
  {
    id: "kpi",
    title: "KPI",
    image: require("../assets/images/superapp/app-logo-4.png"),
    url: "",
  },
  {
    id: "hrweb",
    title: "HR Web",
    image: require("../assets/images/superapp/app-logo-5.png"),
    url: "",
  },
  {
    id: "okr",
    title: "OKR",
    image: require("../assets/images/superapp/app-logo-6.png"),
    url: "",
  },
  {
  id: "pulse",
  title: "PULSE",
  image: null,
  SvgIcon: pulseSvg,
  url: "",
  },
  {
    id: "test-suite",
    title: "TEST-SUİTE",
    image: null,
    SvgIcon:testsuiteSvg,
    url: "",
  },
  {
    id: "action-suite",
    title: "ACTİON-SUİTE",
    image: require("../assets/images/superapp/app-logo-9.png"),
    url: "",
  },
  {
    id: "polivalans",
    title: "POLiVALANS",
    image: require("../assets/images/superapp/app-logo-10.png"),
    url: "",
  },
  {
    id: "akademi",
    title: "AKADEMi",
    image: require("../assets/images/superapp/app-logo-11.png"),
    url: "",
  },
  {
    id: "softHR",
    title: "SOFT-HR",
    image: require("../assets/images/superapp/app-logo-13.png"),
    url: "",
  },
] as const;

const PAGE_SIZE = 9;
const pages = Array.from(
  { length: Math.ceil(applications.length / PAGE_SIZE) },
  (_, index) => applications.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
);

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

export default function SuperAppOverlay({
  visible,
  onClose,
  blurTarget,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const pagerRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [mounted, setMounted] = useState(visible);
  const [activePage, setActivePage] = useState(0);
  const { width, height } = useWindowDimensions();

  const shortestSide = Math.min(width, height);
  const responsiveScale = clamp(shortestSide / 390, 1, 1.65);
  const panelWidth = Math.min(width * 0.88, 690);
  const panelRadius = 28 * responsiveScale;
  const horizontalPadding = 14 * responsiveScale;
  const cellWidth = (panelWidth - horizontalPadding * 2) / 3;
  const iconBoxSize = Math.min(66 * responsiveScale, cellWidth - 12);
  const rowGap = 23 * responsiveScale;
  const labelHeight = 34 * responsiveScale;
  const itemHeight = iconBoxSize + 8 * responsiveScale + labelHeight;
  const gridHeight = itemHeight * 3 + rowGap * 2;
  const topPadding = 32 * responsiveScale;
  const bottomPadding = 22 * responsiveScale;
  const dotsHeight = 32 * responsiveScale;
  const panelHeight = topPadding + gridHeight + dotsHeight + bottomPadding;
  const maxPanelHeight = height * 0.72;
  // Küçük ekranlarda bile sayfa yüksekliği sabit kalır; dikey kaydırma kullanılmaz.
  const fitScale = Math.min(1, maxPanelHeight / panelHeight);
  const effectiveGridHeight = gridHeight * fitScale;
  const effectiveIconSize = iconBoxSize * fitScale;
  const effectiveRowGap = rowGap * fitScale;
  const effectiveItemHeight = itemHeight * fitScale;
  const effectiveTopPadding = topPadding * fitScale;
  const effectiveDotsHeight = dotsHeight * fitScale;
  const effectiveBottomPadding = bottomPadding * fitScale;
  const actualPanelHeight =
    effectiveTopPadding +
    effectiveGridHeight +
    effectiveDotsHeight +
    effectiveBottomPadding;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setActivePage(0);
      pagerRef.current?.scrollTo({ x: 0, animated: false });
      opacity.stopAnimation();
      scale.stopAnimation();
      opacity.setValue(0);
      scale.setValue(0.88);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 230,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, opacity, scale]);

  const openApplication = async (title: string, url: string) => {
    if (!url.trim()) {
      Alert.alert(
        "Bağlantı bekleniyor",
        `${title} için uygulama linki henüz tanımlanmadı.`,
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          "Bağlantı açılamadı",
          "Bu bağlantı cihazda desteklenmiyor.",
        );
        return;
      }
      await Linking.openURL(url);
      onClose();
    } catch {
      Alert.alert("Hata", "Uygulama bağlantısı açılamadı.");
    }
  };

  const onPageScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActivePage(
      clamp(
        Math.round(event.nativeEvent.contentOffset.x / panelWidth),
        0,
        pages.length - 1,
      ),
    );
  };
  console.log("PULSE SVG:", typeof pulseSvg, pulseSvg.slice(0, 150));

  if (!mounted) return null;

  const blurMethod =
    Platform.OS === "android" ? "dimezisBlurViewSdk31Plus" : "none";
    

  return (
    <View style={styles.overlay}>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={65}
        tint="light"
        blurTarget={blurTarget}
        blurMethod={blurMethod}
      />
      <View pointerEvents="none" style={styles.backgroundShade} />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="bi360 penceresini kapat"
      />

      <Animated.View
        style={[styles.folderWrapper, { opacity, transform: [{ scale }] }]}
      >
        <View style={styles.TextContainer}>
          <Text style={styles.Text}>Uygulamalar</Text>
        </View>

        <View
          style={[
            styles.panel,
            {
              width: panelWidth,
              height: actualPanelHeight,
              borderRadius: panelRadius,
            },
          ]}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={48}
            tint="dark"
            blurTarget={blurTarget}
            blurMethod={blurMethod}
          />
          <View pointerEvents="none" style={styles.navyGlassTint} />
          <View
            pointerEvents="none"
            style={[styles.glassBorder, { borderRadius: panelRadius }]}
          />

          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPageScrollEnd}
            style={{
              width: panelWidth,
              height: effectiveTopPadding + effectiveGridHeight,
            }}
            contentContainerStyle={{ alignItems: "flex-start" }}
            directionalLockEnabled
          >
            {pages.map((apps, pageIndex) => (
              <View
                key={pageIndex}
                style={{
                  width: panelWidth,
                  height: effectiveTopPadding + effectiveGridHeight,
                  paddingHorizontal: horizontalPadding,
                  paddingTop: effectiveTopPadding,
                }}
              >
                <View
                  style={[
                    styles.grid,
                    { height: effectiveGridHeight, rowGap: effectiveRowGap },
                  ]}
                >
                  {apps.map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      style={[
                        styles.application,
                        { height: effectiveItemHeight },
                      ]}
                      activeOpacity={0.75}
                      onPress={() => openApplication(app.title, app.url)}
                      accessibilityRole="button"
                      accessibilityLabel={`${app.title} uygulamasını aç`}
                    >
                     <View
  style={[
    styles.appIcon,
    {
      width: effectiveIconSize,
      height: effectiveIconSize,
      borderRadius: effectiveIconSize * 0.23,
      marginBottom: 8 * responsiveScale * fitScale,
      overflow: "hidden",
    },
  ]}
>
  {app.id === "pulse" ? (
    <SvgXml
      xml={pulseSvg}
      width="100%"
      height="100%"
    />
  ) : app.id === "test-suite" ? (
    <SvgXml
      xml={testsuiteSvg}
      width="100%"
      height="100%"
    />
  ) : (
    <Image
      source={app.image!}
      style={styles.appImage}
      resizeMode="cover"
    />
  )}
</View>

                      <Text
                        style={[
                          styles.appName,
                          {
                            fontSize: 11.5 * responsiveScale * fitScale,
                            lineHeight: 16 * responsiveScale * fitScale,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {app.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.pagination, { height: effectiveDotsHeight }]}>
            {pages.map((_, index) => (
              <Pressable
                key={index}
                accessibilityLabel={`${index + 1}. sayfaya git`}
                onPress={() => {
                  pagerRef.current?.scrollTo({
                    x: index * panelWidth,
                    animated: true,
                  });
                  setActivePage(index);
                }}
                style={styles.dotHitArea}
              >
                <View
                  style={[
                    styles.dot,
                    activePage === index
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(17,24,39,0.2)",
  },
  folderWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    overflow: "hidden",
    backgroundColor: "rgba(17, 17, 20, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(49,117,72,0.3)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 12,
  },
  navyGlassTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(17, 17, 20, 0.58)",
  },
  glassBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
  },
  application: {
    width: "33.333333%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 2,
  },
  appIcon: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  appImage: { width: "100%", height: "100%" },
  appName: {
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dotHitArea: { paddingHorizontal: 5, paddingVertical: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  dotActive: { backgroundColor: "#FFFFFF" },
  dotInactive: { backgroundColor: "rgba(255,255,255,0.35)" },
  TextContainer: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    alignSelf: "flex-start",
    paddingLeft: 20,
    paddingBottom: 20,
  },

  Text: {
    color: "white",
    fontSize: 36,
    textAlign: "left",
    fontWeight: "bold",
  },
});

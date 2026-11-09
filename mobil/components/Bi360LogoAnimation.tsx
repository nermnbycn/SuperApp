import React, { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

type Mode = "intro" | "success";

interface Props {
  mode: Mode;
  onFinish?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Bi360LogoAnimation({ mode, onFinish }: Props) {
  // Hook mutlaka bileşenin en üst seviyesinde, koşulsuz çalışmalı.
  const [fontsLoaded] = useFonts({
    TJFAnomaly: require("../assets/fonts/tjfanomalyregular-arlel.ttf"),
  });

  const isSuccess = mode === "success";

  const dotOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0.4)).current;
  const numbersOpacity = useRef(new Animated.Value(isSuccess ? 1 : 0)).current;
  const numbersScale = useRef(new Animated.Value(isSuccess ? 1 : 0.82)).current;
  const biOpacity = useRef(new Animated.Value(isSuccess ? 1 : 0)).current;
  const biX = useRef(new Animated.Value(isSuccess ? 0 : -55)).current;
  const biExitX = useRef(new Animated.Value(0)).current;
  const numbersExitX = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoY = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(
    new Animated.Value(isSuccess ? 0.85 : 0),
  ).current;

  const callbackRef = useRef(onFinish);
  useEffect(() => {
    callbackRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // Yazılar font yüklenmeden animasyona başlamasın.
    if (!fontsLoaded) return;

    if (mode === "success") {
      const successAnimation = Animated.sequence([
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(biExitX, {
            toValue: -100,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(numbersExitX, {
            toValue: 100,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]);

      successAnimation.start(({ finished }) => {
        if (finished) callbackRef.current?.();
      });

      return () => successAnimation.stop();
    }

    const duration = (normal: number) => normal;
    const targetY = -SCREEN_HEIGHT * 0.45;

    const introAnimation = Animated.sequence([
      // 1. Beyaz nokta belirir.
      Animated.parallel([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: duration(220),
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: duration(220),
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0.85,
          duration: duration(350),
          useNativeDriver: true,
        }),
      ]),
      // 2. Nokta kaybolur, 360° görünür.
      Animated.parallel([
        Animated.timing(dotOpacity, {
          toValue: 0,
          duration: duration(120),
          useNativeDriver: true,
        }),
        Animated.timing(numbersOpacity, {
          toValue: 1,
          duration: duration(420),
          useNativeDriver: true,
        }),
        Animated.spring(numbersScale, {
          toValue: 1,
          speed: 13,
          bounciness: 2,
          useNativeDriver: true,
        }),
      ]),
      // 3. bi soldan gelir.
      Animated.parallel([
        Animated.timing(biOpacity, {
          toValue: 1,
          duration: duration(330),
          useNativeDriver: true,
        }),
        Animated.timing(biX, {
          toValue: 0,
          duration: duration(390),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(220),
      // 4. Logo yukarı kayar.
      Animated.timing(logoY, {
        toValue: targetY,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    introAnimation.start(({ finished }) => {
      if (finished) callbackRef.current?.();
    });

    return () => introAnimation.stop();
  }, [
    mode,
    fontsLoaded,
    dotOpacity,
    dotScale,
    numbersOpacity,
    numbersScale,
    biOpacity,
    biX,
    biExitX,
    numbersExitX,
    logoOpacity,
    logoY,
    backgroundOpacity,
  ]);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.Text
        style={[
          styles.ghost360,
          fontsLoaded && styles.anomalyFont,
          { opacity: backgroundOpacity },
        ]}
      >
        360
      </Animated.Text>

      <Animated.View
        style={[styles.logoArea, { transform: [{ translateY: logoY }] }]}
      >
        <Animated.View style={[styles.logoRow, { opacity: logoOpacity }]}>
          <Animated.Text
            style={[
              styles.logoText,
              fontsLoaded && styles.anomalyFont,
              {
                opacity: biOpacity,
                transform: [{ translateX: biX }, { translateX: biExitX }],
              },
            ]}
          >
            bi
          </Animated.Text>

          <Animated.Text
            style={[
              styles.logoText,
              fontsLoaded && styles.anomalyFont,
              {
                opacity: numbersOpacity,
                transform: [
                  { scale: numbersScale },
                  { translateX: numbersExitX },
                ],
              },
            ]}
          >
            360
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ghost360: {
    //Arkadaki büyük bi360 yazısı
    position: "absolute",
    right: -70,
    top: "39%",
    fontSize: 158,
    fontWeight: "900",
    color: "#2B2B2B",
    transform: [{ rotate: "-90deg" }],
  },
  logoArea: {
    height: 110,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 54,
    letterSpacing: -2.5,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  anomalyFont: {
    fontFamily: "TJFAnomaly",
  },
});

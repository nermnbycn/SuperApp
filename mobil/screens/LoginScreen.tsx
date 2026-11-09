import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Svg, { Path } from "react-native-svg";

import { StatusBar } from "expo-status-bar";

import Bi360LogoAnimation from "../components/Bi360LogoAnimation";
import { useFonts } from "expo-font";

interface Props {
  playIntro: boolean;

  onIntroFinished: () => void;

  onLogin: (email: string, password: string) => Promise<boolean>;

  onAuthenticated: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HEADER_HEIGHT = 190;

const COLORS = {
  primary: "#1D2749",

  background: "#F7F8FA",

  white: "#FFFFFF",

  text: "#202638",

  muted: "#8E96A7",

  border: "#E7E9F0",

  black: "#111111",
};

export default function LoginScreen({
  playIntro,

  onIntroFinished,

  onLogin,

  onAuthenticated,
}: Props) {
  const [fontsLoaded] = useFonts({
    TJFAnomaly: require("../assets/fonts/tjfanomalyregular-arlel.ttf"),
  });

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [introComplete, setIntroComplete] = useState(!playIntro);

  const [success, setSuccess] = useState(false);

  // Açılış animasyonu yalnızca ilk girişte çalışır.

  const [useAnimatedLogo] = useState(playIntro);

  // Giriş kartı animasyonları

  const cardOpacity = useRef(new Animated.Value(playIntro ? 0 : 1)).current;

  const cardTranslateY = useRef(new Animated.Value(playIntro ? 45 : 0)).current;

  // Siyah açılış ekranından çıkış

  const blackOpacity = useRef(new Animated.Value(playIntro ? 1 : 0)).current;

  // Animasyonlu logo ile sabit logo arasındaki geçiş

  const animatedLogoOpacity = useRef(
    new Animated.Value(playIntro ? 1 : 0),
  ).current;

  const staticLogoOpacity = useRef(
    new Animated.Value(playIntro ? 0 : 1),
  ).current;

  const transitionStarted = useRef(false);

  const handleIntroFinished = () => {
    if (transitionStarted.current) return;

    transitionStarted.current = true;

    // Logo yukarı kaydıktan sonra siyah perde açılır.

    // Animasyonlu logo sabit logoya yumuşakça dönüşür.

    Animated.parallel([
      Animated.timing(blackOpacity, {
        toValue: 0,

        duration: 500,

        useNativeDriver: true,
      }),

      Animated.timing(animatedLogoOpacity, {
        toValue: 0,

        duration: 450,

        useNativeDriver: true,
      }),

      Animated.timing(staticLogoOpacity, {
        toValue: 1,

        duration: 450,

        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;

      setIntroComplete(true);

      onIntroFinished();
    });
  };

  // Giriş kartının aşağıdan belirmesi

  useEffect(() => {
    if (!introComplete) return;

    const animation = Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,

        duration: 500,

        useNativeDriver: true,
      }),

      Animated.timing(cardTranslateY, {
        toValue: 0,

        duration: 500,

        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [introComplete, cardOpacity, cardTranslateY]);

  // Login API işlemi

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      setError("E-posta ve şifrenizi girin.");

      return;
    }

    setLoading(true);

    setError("");

    try {
      const authenticated = await onLogin(email.trim(), password);

      if (authenticated) {
        setSuccess(true);
      } else {
        setError("E-posta veya şifre hatalı.");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Giriş yapılırken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Başarılı girişte mevcut animasyon korunur.

  if (success) {
    return (
      <View style={styles.successContainer}>
        <StatusBar style="light" />

        <Bi360LogoAnimation mode="success" onFinish={onAuthenticated} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />

      {/* KAVİSLİ ÜST ARKA PLAN */}

      <View style={styles.headerBackground} pointerEvents="none">
        <Svg
          width={SCREEN_WIDTH}
          height={205}
          viewBox="0 0 390 190"
          preserveAspectRatio="none"
        >
          <Path
            d="

              M0 0

              H390

              V100

              C365 135 342 147 305 151

              C260 156 226 145 184 158

              C145 171 110 173 75 172

              C38 172 14 153 0 136

              Z

            "
            fill={COLORS.primary}
          />
        </Svg>
      </View>

      {/* KAVİSLİ ALANIN ÜZERİNDEKİ SABİT LOGO */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.staticLogo,

          {
            opacity: staticLogoOpacity,
          },
        ]}
      >
        <Text
          style={[styles.logoText, fontsLoaded && { fontFamily: "TJFAnomaly" }]}
        >
          bi360
        </Text>
      </Animated.View>

      {/* GİRİŞ FORMU */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        pointerEvents={introComplete ? "auto" : "none"}
      >
        <Animated.View
          style={[
            styles.loginCard,

            {
              opacity: cardOpacity,

              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>Hoş Geldiniz</Text>

          <Text style={styles.subtitle}>bi360 hesabınızla giriş yapın</Text>

          {/* E-POSTA */}

          <Text style={styles.label}>E-posta</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={21} color={COLORS.muted} />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresiniz"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* ŞİFRE */}

          <Text style={styles.label}>Şifre</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color={COLORS.muted}
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifreniz"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={21}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          </View>

          {/* HATA */}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* ŞİFREMİ UNUTTUM - ileride endpoint bağlanabilir */}

          {/* GİRİŞ BUTONU */}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Giriş Yap</Text>

                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ALT BİLGİ */}

        <Animated.View style={[styles.footer, { opacity: cardOpacity }]}>
          <Text style={styles.footerText}>
            bi360 • Kurumsal Dijital Platform
          </Text>
        </Animated.View>
      </ScrollView>

      {/* AÇILIŞTAKİ SİYAH ARKA PLAN */}

      {useAnimatedLogo && (
        <Animated.View
          pointerEvents="none"
          style={[styles.blackOverlay, { opacity: blackOpacity }]}
        />
      )}

      {/* MEVCUT 360 ASSEMBLE ANİMASYONU */}

      {useAnimatedLogo && (
        <Animated.View
          pointerEvents="none"
          style={[styles.animationOverlay, { opacity: animatedLogoOpacity }]}
        >
          <Bi360LogoAnimation mode="intro" onFinish={handleIntroFinished} />
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  successContainer: {
    flex: 1,

    backgroundColor: COLORS.black,
  },

  // Ana sayfadaki orijinal SVG eğrisi

  headerBackground: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: 205,

    zIndex: 0,
  },

  // Logo, animasyonun tamamlandığı yüksekliğe yakın

  staticLogo: {
    position: "absolute",

    top: HEADER_HEIGHT * 0.3, //animasyon bittikten sonra

    //logonun bittiği yerde static logo oluşacak

    height: 110,
    left: 0,
    right: 0,

    alignItems: "center",

    justifyContent: "center",
  },

  logoText: {
    color: COLORS.white,

    fontSize: 54,
    textAlign: "center",

    letterSpacing: -1.2,

    includeFontPadding: false,
  },

  scrollView: {
    flex: 1,

    zIndex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    paddingTop: 240,

    paddingHorizontal: 20,

    paddingBottom: 28,
  },

  loginCard: {
    backgroundColor: COLORS.white,

    borderRadius: 24,

    padding: 24,

    borderWidth: 1,

    borderColor: COLORS.border,

    elevation: 4,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,

      height: 5,
    },

    shadowOpacity: 0.08,

    shadowRadius: 14,
  },

  title: {
    fontSize: 25,

    fontWeight: "800",

    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 14,

    color: COLORS.muted,

    marginTop: 7,

    marginBottom: 20,
  },

  label: {
    fontSize: 14,

    fontWeight: "600",

    color: COLORS.text,

    marginTop: 15,

    marginBottom: 8,
  },

  inputContainer: {
    height: 53,

    borderRadius: 13,

    backgroundColor: COLORS.background,

    borderWidth: 1,

    borderColor: COLORS.border,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    gap: 11,
  },

  input: {
    flex: 1,

    color: COLORS.text,

    fontSize: 14,
  },

  errorText: {
    color: "#DC2626",

    fontSize: 13,

    marginTop: 12,
  },

  loginButton: {
    height: 54,

    borderRadius: 13,

    backgroundColor: COLORS.primary,

    alignItems: "center",

    justifyContent: "center",

    flexDirection: "row",

    gap: 10,

    marginTop: 26,
  },

  loginButtonText: {
    color: COLORS.white,

    fontSize: 16,

    fontWeight: "700",
  },

  footer: {
    alignItems: "center",

    marginTop: 35,
  },

  footerText: {
    color: COLORS.muted,

    fontSize: 11,
  },

  // Animasyon başlangıcında ekranı siyaha boyar.

  blackOverlay: {
    ...StyleSheet.absoluteFill,

    backgroundColor: COLORS.black,

    zIndex: 4,

    elevation: 4,
  },

  // Logonun ortadan başlayıp yukarı kayması korunur.

  animationOverlay: {
    ...StyleSheet.absoluteFill,

    zIndex: 5,

    elevation: 5,
  },
});

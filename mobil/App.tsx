import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as SecureStore from "expo-secure-store";

import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurTargetView } from "expo-blur";
import { StatusBar } from "expo-status-bar";

import { store } from "./redux/Store";

import SuperAppOverlay from "./components/SuperAppOverlay";

import MainTabNavigator from "./navigation/MainTabNavigator";
import AuthNavigator from "./navigation/AuthNavigator";

import { navigationRef } from "./navigation/NavigationService";
import { HeaderScrollProvider } from "./context/HeaderScrollContext";
import { fetchMyProfile } from "./redux/slices/ProfileSlice";

export default function App() {
  // Kullanıcının oturum durumu
  const [authenticated, setAuthenticated] = useState(false);

  // Aktif alt menü
  const [activeTab, setActiveTab] = useState("HomeTab");

  // Super App paneli
  const [superAppOpen, setSuperAppOpen] = useState(false);

  // BlurTargetView ile uyumlu ref tipi
  const blurTargetRef = useRef<React.ComponentRef<
    typeof BlurTargetView
  > | null>(null);
  const handleLogout = async () => {
    const token = await SecureStore.getItemAsync("authToken");

    if (token) {
      const response = await fetch("http://10.90.111.26:5277/api/Auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Çıkış isteği başarısız.");
      }
    }

    await SecureStore.deleteItemAsync("authToken");

    setAuthenticated(false);
    setActiveTab("HomeTab");
    setSuperAppOpen(false);
  };

  // Demo kullanıcıyla giriş
  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("http://10.90.111.26:5277/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        console.log("Login HTTP status:", response.status);
        return false;
      }

      const data = await response.json();

      if (!data.token) {
        console.log("API token döndürmedi.");
        return false;
      }

      console.log("Giriş başarılı.");
      await SecureStore.setItemAsync("authToken", data.token);

      store.dispatch(fetchMyProfile());

      // Sonraki aşamada tokenı güvenli şekilde saklayacağız.
      return true;
    } catch (error) {
      console.error("API bağlantı hatası:", error);
      return false;
    }
  };

  // Başarılı giriş animasyonundan sonra
  const handleAuthenticated = () => {
    setActiveTab("HomeTab");
    setSuperAppOpen(false);
    setAuthenticated(true);
  };

  // Hızlı erişim kartları
  const handleShortcutPress = (key: string) => {
    if (!navigationRef.isReady()) return;

    switch (key) {
      case "blogs":
        navigationRef.navigate("HomeTab", {
          screen: "Blog",
        });
        break;

      case "news":
        navigationRef.navigate("HomeTab", {
          screen: "CompanyNew",
        });
        break;

      case "announcement":
        navigationRef.navigate("HomeTab", {
          screen: "Announcement",
        });
        break;

      case "surveys":
        navigationRef.navigate("HomeTab", {
          screen: "Survey",
        });
        break;

      default:
        break;
    }
  };

  // Super App panelini aç
  const handleSuperAppPress = () => {
    setSuperAppOpen(true);
  };

  // Super App panelini kapat
  const handleSuperAppClose = () => {
    setSuperAppOpen(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Provider store={store}>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state) => {
            if (!state || !authenticated) return;

            const route = state.routes[state.index];

            if (route) {
              setActiveTab(route.name);
            }
          }}
        >
          {authenticated ? (
            <HeaderScrollProvider>
              <View style={styles.container}>
                {/* BULANIKLAŞTIRILACAK UYGULAMA */}
                <BlurTargetView ref={blurTargetRef} style={styles.container}>
                  {/* MEVCUT KAVİSLİ HEADER */}
                  

                  {/* ANA SAYFA VE ALT MENÜ */}
                  <View style={styles.content}>
                    <MainTabNavigator
                      onSuperAppPress={handleSuperAppPress}
                      onLogout={handleLogout}
                       onShortcutPress={handleShortcutPress}
                    />
                  </View>
                </BlurTargetView>

                {/* SUPER APP OVERLAY */}
                <SuperAppOverlay
                  visible={superAppOpen}
                  onClose={handleSuperAppClose}
                  blurTarget={blurTargetRef}
                />
              </View>
            </HeaderScrollProvider>
          ) : (
            <AuthNavigator
              onLogin={handleLogin}
              onAuthenticated={handleAuthenticated}
              logOut={handleLogout}
            />
          )}
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
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

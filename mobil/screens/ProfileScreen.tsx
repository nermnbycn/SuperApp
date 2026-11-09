import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { fetchMyProfile } from "../redux/slices/ProfileSlice";
import { useHeaderScroll } from "../context/HeaderScrollContext";
import { RootState } from "../redux/Store";

const C = {
  navy: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
  pale: "#EBF0FA",
  text: "#26314B",
  muted: "#8791A5",
  border: "#E9EDF4",
  danger: "#BC3947",
};

type Profile = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  birthDate?: string | null;
  hireDate?: string | null;
  imageUrl?: string | null;
};

type Props = {
  onChangePassword?: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<void>;

  initialNotificationsEnabled?: boolean;

  onNotificationsChange?: (enabled: boolean) => Promise<void> | void;

  onLogout: () => Promise<void>;
};

function formatDate(value?: string | null) {
  if (!value) return "Belirtilmemiş";

  const datePart = value.slice(0, 10);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) return "Belirtilmemiş";

  return `${match[3]}.${match[2]}.${match[1]}`;
}

function InfoRow({
  icon,
  title,
  value,
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.rowBorder]}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={21} color={C.navy} />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{title}</Text>

        <Text selectable style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({
  onChangePassword,
  initialNotificationsEnabled = true,
  onNotificationsChange,
  onLogout,
}: Props) {
  const dispatch = useDispatch<any>();

  const { setCollapsed } = useHeaderScroll();

  const profile = useSelector((state: RootState) => state.profile.profile);

  const loading = useSelector((state: RootState) => state.profile.loading);

  const error = useSelector((state: RootState) => state.profile.error);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialNotificationsEnabled,
  );

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingPassword, setSavingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // HEADER
  useEffect(() => {
    setCollapsed(false);

    return () => setCollapsed(false);
  }, [setCollapsed]);

  // PROFİL BİLGİLERİNİ GETİR
  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);
  const API_URL = "http://10.90.111.26:5277";

  const imageUrl = profile?.imageUrl
    ? profile.imageUrl.startsWith("http")
      ? profile.imageUrl
      : `${API_URL}/${profile.imageUrl.replace(/^\/+/, "")}`
    : null;

  // BİLDİRİM AYARLARI
  useEffect(() => {
    setNotificationsEnabled(initialNotificationsEnabled);
  }, [initialNotificationsEnabled]);

  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    "Kullanıcı";

  const initials =
    [profile?.firstName?.[0], profile?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toLocaleUpperCase("tr-TR") || "?";

  // BİLDİRİMLER
  const changeNotifications = async (next: boolean) => {
    setNotificationsEnabled(next);

    try {
      await onNotificationsChange?.(next);
    } catch {
      setNotificationsEnabled(!next);

      Alert.alert("Hata", "Bildirim tercihi güncellenemedi.");
    }
  };

  // ŞİFRE MODALINI KAPAT
  const closePasswordModal = () => {
    if (savingPassword) return;

    setPasswordModalVisible(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ŞİFRE GÜNCELLE
  const submitPassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Eksik bilgi", "Lütfen tüm şifre alanlarını doldurun.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Geçersiz şifre", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Şifreler eşleşmiyor",
        "Yeni şifre ve tekrarını kontrol edin.",
      );
      return;
    }

    if (!onChangePassword) {
      Alert.alert(
        "Bağlantı gerekli",
        "Şifre güncelleme servisi henüz bağlanmadı.",
      );
      return;
    }

    try {
      setSavingPassword(true);

      await onChangePassword(oldPassword, newPassword);

      Alert.alert("Başarılı", "Şifreniz güncellendi.");

      setPasswordModalVisible(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      Alert.alert("Hata", e?.message || "Şifre güncellenemedi.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ÇIKIŞ İŞLEMİ
  const handleLogout = () => {
    if (loggingOut) return;

    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);

            try {
              await onLogout();
            } catch (e: any) {
              Alert.alert(
                "Çıkış Yapılamadı",
                e?.message || "Çıkış işlemi sırasında bir hata oluştu.",
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;

          setCollapsed(scrollY > 50);
        }}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* SAYFA BAŞLIĞI */}
          <Text style={styles.pageTitle}>Profilim</Text>

          <Text style={styles.pageSubtitle}>
            Kişisel bilgileriniz ve hesap ayarlarınız
          </Text>

          {/* PROFİL KARTI */}
          <View style={styles.heroCard}>
            <View style={styles.avatar}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>

            <Text style={styles.heroName}>{fullName}</Text>

            <Text style={styles.heroEmail}>
              {profile?.email || "E-posta belirtilmemiş"}
            </Text>
          </View>

          {/* YÜKLENİYOR */}
          {loading && !profile && (
            <View style={styles.feedbackRow}>
              <ActivityIndicator color={C.navy} />

              <Text style={styles.feedbackText}>
                Profil bilgileri yükleniyor...
              </Text>
            </View>
          )}

          {/* HATA */}
          {!!error && (
            <View style={styles.feedbackRow}>
              <Text style={styles.errorText}>
                Profil bilgileri alınamadı: {error}
              </Text>

              <Pressable onPress={() => dispatch(fetchMyProfile())}>
                <Text style={styles.retryText}>Tekrar dene</Text>
              </Pressable>
            </View>
          )}

          {/* KİŞİSEL BİLGİLER */}
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <View style={styles.card}>
            <InfoRow icon="person-outline" title="Ad Soyad" value={fullName} />

            <InfoRow
              icon="mail-outline"
              title="E-posta"
              value={profile?.email || "Belirtilmemiş"}
            />

            <InfoRow
              icon="gift-outline"
              title="Doğum Tarihi"
              value={formatDate(profile?.birthDate)}
            />

            <InfoRow
              icon="calendar-outline"
              title="İşe Giriş Tarihi"
              value={formatDate(profile?.hireDate)}
              last
            />
          </View>

          {/* HESAP VE AYARLAR */}
          <Text style={styles.sectionTitle}>Hesap ve Ayarlar</Text>

          <View style={styles.card}>
            {/* ŞİFRE GÜNCELLE */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                styles.rowBorder,
                pressed && styles.pressed,
              ]}
              onPress={() => setPasswordModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Şifremi güncelle"
            >
              <View style={styles.infoIconBox}>
                <Ionicons name="lock-closed-outline" size={21} color={C.navy} />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.actionTitle}>Şifre Güncelle</Text>

                <Text style={styles.actionHint}>
                  Hesap şifrenizi değiştirin
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </Pressable>

            {/* BİLDİRİMLER */}
            <View style={[styles.actionRow, styles.rowBorder]}>
              <View style={styles.infoIconBox}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color={C.navy}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.actionTitle}>Bildirimler</Text>

                <Text style={styles.actionHint}>
                  {notificationsEnabled
                    ? "Bildirimler açık"
                    : "Bildirimler kapalı"}
                </Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={changeNotifications}
                trackColor={{
                  false: "#D7DCE6",
                  true: "#A9B9DD",
                }}
                thumbColor={notificationsEnabled ? C.navy : "#F4F4F4"}
                accessibilityLabel="Bildirimleri aç veya kapat"
              />
            </View>

            {/* ÇIKIŞ YAP */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.pressed,
                loggingOut && styles.disabled,
              ]}
              onPress={handleLogout}
              disabled={loggingOut}
              accessibilityRole="button"
              accessibilityLabel="Çıkış Yap"
            >
              <View style={[styles.infoIconBox, styles.logoutIconBox]}>
                <Ionicons name="log-out-outline" size={21} color={C.danger} />
              </View>

              <View style={styles.infoContent}>
                <Text style={[styles.actionTitle, styles.logoutText]}>
                  Çıkış Yap
                </Text>

                <Text style={styles.actionHint}>
                  Hesabınızdan güvenli şekilde çıkın
                </Text>
              </View>

              {loggingOut ? (
                <ActivityIndicator size="small" color={C.danger} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={C.danger} />
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* ŞİFRE GÜNCELLEME MODALI */}
      <Modal
        transparent
        visible={passwordModalVisible}
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şifre Güncelle</Text>

              <Pressable onPress={closePasswordModal} hitSlop={12}>
                <Ionicons name="close" size={24} color={C.navy} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Mevcut Şifre</Text>

            <TextInput
              style={styles.input}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Mevcut şifreniz"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              textContentType="password"
            />

            <Text style={styles.fieldLabel}>Yeni Şifre</Text>

            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="En az 6 karakter"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              textContentType="newPassword"
            />

            <Text style={styles.fieldLabel}>Yeni Şifre Tekrar</Text>

            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Yeni şifrenizi tekrar yazın"
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              textContentType="newPassword"
            />

            {!onChangePassword && (
              <Text style={styles.modalNote}>
                Şifre değiştirme servisi bağlanana kadar bu form şifreyi
                kaydetmez.
              </Text>
            )}

            <Pressable
              style={[styles.saveButton, savingPassword && styles.disabled]}
              onPress={submitPassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
    paddingTop:5
    
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  container: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: C.navy,
  },

  pageSubtitle: {
    marginTop: 5,
    marginBottom: 23,
    color: C.muted,
    fontSize: 13,
  },

  heroCard: {
    backgroundColor: C.navy,
    borderRadius: 22,
    paddingVertical: 25,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },

  avatarText: {
    fontSize: 27,
    fontWeight: "800",
    color: C.navy,
  },

  heroName: {
    color: C.white,
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },

  heroEmail: {
    color: "#D9E2F2",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.navy,
    marginTop: 24,
    marginBottom: 12,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 17,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: C.border,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    minHeight: 68,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  infoIconBox: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 4,
  },

  infoValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 75,
    paddingVertical: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },

  actionHint: {
    fontSize: 11,
    color: C.muted,
    marginTop: 5,
  },

  pressed: {
    opacity: 0.6,
  },

  feedbackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    paddingTop: 13,
  },

  feedbackText: {
    color: C.muted,
    fontSize: 13,
  },

  errorText: {
    color: C.danger,
    fontSize: 12,
  },

  retryText: {
    color: C.navy,
    textDecorationLine: "underline",
    fontWeight: "700",
  },

  logoutIconBox: {
    backgroundColor: "#FCEDEF",
  },

  logoutText: {
    color: C.danger,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(12,19,39,0.6)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: C.navy,
  },

  fieldLabel: {
    fontWeight: "600",
    color: C.text,
    marginBottom: 7,
    fontSize: 13,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
    borderRadius: 11,
    paddingHorizontal: 13,
    marginBottom: 15,
    color: C.text,
    fontSize: 14,
  },

  modalNote: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 13,
    lineHeight: 18,
  },

  saveButton: {
    backgroundColor: C.navy,
    minHeight: 48,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  saveButtonText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 14,
  },

  disabled: {
    opacity: 0.65,
  },
});

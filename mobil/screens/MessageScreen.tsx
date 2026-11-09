import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../redux/Store";

import {
  fetchMessages,
  markMessageAsRead,
  reactToMessage,
} from "../redux/slices/MessageSlice";

import type { CelebrationMessage } from "../redux/slices/MessageSlice";

const API_URL = "http://10.90.111.26:5277";

const COLORS = {
  navy: "#1D2749",
  navyDark: "#13294B",
  background: "#F7F8FA",
  white: "#FFFFFF",
  muted: "#7E8DA7",
  border: "#E6EBF2",
  lightBlue: "#E8F0FC",
  red: "#DC2626",
  green: "#16803D",
};

const REACTIONS = ["❤️", "🥳", "🎉", "🙏", "😊", "👏"];

// FOTOĞRAF URL
function getImageUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;

  const path = url.trim();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

// İSİM BAŞ HARFLERİ
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
}

// TARİH FORMATLAMA
function formatDate(dateString: string): string {
  const utcDate = dateString.endsWith("Z") ? dateString : `${dateString}Z`;

  return new Date(utcDate).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// PROFİL FOTOĞRAFI
interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size: number;
}

function UserAvatar({ name, imageUrl, size }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const uri = getImageUrl(imageUrl);

  useEffect(() => {
    setImageError(false);
  }, [uri]);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {uri && !imageError ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
          onError={(event) => {
            console.log(
              "Profil fotoğrafı yüklenemedi:",
              uri,
              event.nativeEvent.error,
            );

            setImageError(true);
          }}
        />
      ) : (
        <Text
          style={[
            styles.avatarText,
            {
              fontSize: size >= 70 ? 25 : 15,
            },
          ]}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

export default function MessageScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  // GİRİŞ YAPAN KULLANICI
  const profile = useSelector((state: RootState) => state.profile.profile);

  const userId = profile?.id;

  // REDUX MESAJ VERİLERİ
  const { messages, unreadCount, loading, error } = useSelector(
    (state: RootState) => state.message,
  );

  // AÇIK OLAN MESAJ
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // YENİLEME DURUMU
  const [refreshing, setRefreshing] = useState(false);

  // MESAJLARI GETİR
  useEffect(() => {
    if (!userId) return;

    dispatch(fetchMessages(userId));
  }, [dispatch, userId]);

  // ALT NAVİGASYON BİLDİRİM SAYISI
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    });
  }, [navigation, unreadCount]);

  // TARİHE GÖRE SIRALAMA
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [messages]);

  // SEÇİLİ MESAJ
  const selectedMessage = messages.find((message) => message.id === selectedId);

  // LİSTEYİ YENİLE
  const onRefresh = async () => {
    if (!userId) return;

    setRefreshing(true);

    try {
      await dispatch(fetchMessages(userId)).unwrap();
    } catch (error) {
      console.log("Mesaj yenileme hatası:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // MESAJI AÇ
  const openMessage = async (message: CelebrationMessage) => {
    setSelectedId(message.id);

    if (!userId || message.isRead) return;

    try {
      await dispatch(
        markMessageAsRead({
          messageId: message.id,
          userId,
        }),
      ).unwrap();
    } catch (error) {
      console.log("Mesaj okundu işaretlenemedi:", error);
    }
  };

  // EMOJİ İLE YANITLA
  const sendReaction = async (emoji: string) => {
    if (!selectedId || !userId) return;

    try {
      await dispatch(
        reactToMessage({
          messageId: selectedId,
          userId,
          emoji,
        }),
      ).unwrap();
    } catch (error) {
      console.log("Emoji yanıtı gönderilemedi:", error);
    }
  };

  // MESAJ DETAY SAYFASI
  if (selectedMessage) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailHeader}>
            <TouchableOpacity
              onPress={() => setSelectedId(null)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
            </TouchableOpacity>

            <Text style={styles.detailHeaderTitle}>Kutlama Mesajı</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailAvatarContainer}>
              <UserAvatar
                name={selectedMessage.senderName}
                imageUrl={selectedMessage.senderImageUrl}
                size={76}
              />
            </View>

            <Text style={styles.detailSender}>
              {selectedMessage.senderName}
            </Text>

            <View style={styles.typeBadge}>
              <Ionicons
                name={
                  selectedMessage.type === "birthday"
                    ? "gift-outline"
                    : "ribbon-outline"
                }
                size={16}
                color={COLORS.navy}
              />

              <Text style={styles.typeBadgeText}>
                {selectedMessage.type === "birthday"
                  ? "Doğum Günü Kutlaması"
                  : "İş Yıl Dönümü Kutlaması"}
              </Text>
            </View>

            <Text style={styles.detailDate}>
              {formatDate(selectedMessage.createdAt)}
            </Text>

            <View style={styles.messageDivider} />

            <Text style={styles.detailMessage}>{selectedMessage.message}</Text>
          </View>

          <View style={styles.reactionCard}>
            <Text style={styles.reactionTitle}>Emoji ile teşekkür et</Text>

            <Text style={styles.reactionSubtitle}>
              Bu kutlamaya yalnızca bir emojiyle yanıt verebilirsin.
            </Text>

            <View style={styles.reactionRow}>
              {REACTIONS.map((emoji) => {
                const selected = selectedMessage.reactionEmoji === emoji;

                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      selected && styles.emojiSelected,
                    ]}
                    onPress={() => sendReaction(emoji)}
                    accessibilityRole="button"
                    accessibilityLabel={`${emoji} tepkisi`}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedMessage.reactionEmoji && (
              <View style={styles.reactionConfirmation}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.green}
                />

                <Text style={styles.reactionConfirmText}>
                  Tepkin: {selectedMessage.reactionEmoji}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // GELEN KUTUSU
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.navy]}
          />
        }
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Kutlama Mesajlarım</Text>

          <Text style={styles.pageSubtitle}>
            Sana gönderilen özel kutlamalar
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.navy} />

            <Text style={styles.infoText}>Mesajlar yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={COLORS.red}
            />

            <Text style={styles.infoText}>{error}</Text>

            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : sortedMessages.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="mail-open-outline" size={48} color={COLORS.muted} />

            <Text style={styles.emptyTitle}>Henüz kutlama mesajın yok</Text>
          </View>
        ) : (
          sortedMessages.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.messageCard, !item.isRead && styles.unreadCard]}
              activeOpacity={0.8}
              onPress={() => openMessage(item)}
            >
              <UserAvatar
                name={item.senderName}
                imageUrl={item.senderImageUrl}
                size={46}
              />

              <View style={styles.messageContent}>
                <View style={styles.messageTopRow}>
                  <Text
                    style={[
                      styles.senderName,
                      !item.isRead && styles.unreadName,
                    ]}
                    numberOfLines={1}
                  >
                    {item.senderName}
                  </Text>

                  <Text style={styles.messageDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                <View style={styles.messageTypeRow}>
                  <Ionicons
                    name={
                      item.type === "birthday"
                        ? "gift-outline"
                        : "ribbon-outline"
                    }
                    size={13}
                    color={COLORS.muted}
                  />

                  <Text style={styles.messageType}>
                    {item.type === "birthday" ? "Doğum Günü" : "İş Yıl Dönümü"}
                  </Text>
                </View>

                <Text style={styles.messagePreview} numberOfLines={3}>
                  {item.message}
                </Text>

                {item.reactionEmoji && (
                  <Text style={styles.reactionPreview}>
                    Yanıtın: {item.reactionEmoji}
                  </Text>
                )}
              </View>

              {!item.isRead ? (
                <View style={styles.unreadDot} />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={COLORS.muted}
                />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop:5
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    flexGrow: 1,
  },

  pageHeader: {
    marginBottom: 24,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.navy,
  },

  pageSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },

  infoText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  emptyTitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },

  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  unreadCard: {
    borderColor: "#CAD8EC",
    backgroundColor: "#FCFDFF",
  },

  avatar: {
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarText: {
    color: COLORS.navy,
    fontWeight: "800",
  },

  messageContent: {
    flex: 1,
    gap: 6,
  },

  messageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  senderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.navyDark,
  },

  unreadName: {
    fontWeight: "800",
  },

  messageDate: {
    fontSize: 10,
    color: COLORS.muted,
  },

  messageTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  messageType: {
    fontSize: 11,
    color: COLORS.muted,
  },

  messagePreview: {
    fontSize: 13,
    lineHeight: 19,
    color: "#535E73",
  },

  reactionPreview: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: "600",
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.red,
  },

  detailScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
    gap: 20,
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
  },

  backButton: {
    width: 35,
    justifyContent: "center",
  },

  detailHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.navy,
  },

  headerSpacer: {
    width: 35,
  },

  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  detailAvatarContainer: {
    marginBottom: 15,
  },

  detailSender: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navyDark,
    marginBottom: 12,
  },

  typeBadge: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },

  detailDate: {
    fontSize: 12,
    color: COLORS.muted,
  },

  messageDivider: {
    height: 1,
    width: "100%",
    backgroundColor: COLORS.border,
    marginVertical: 22,
  },

  detailMessage: {
    width: "100%",
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.navyDark,
    textAlign: "center",
    paddingBottom: 10,
  },

  reactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  reactionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
    textAlign: "center",
  },

  reactionSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 20,
  },

  reactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },

  emojiButton: {
    flex: 1,
    height: 45,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emojiSelected: {
    borderColor: COLORS.navy,
    borderWidth: 2,
    backgroundColor: COLORS.lightBlue,
  },

  emojiText: {
    fontSize: 23,
  },

  reactionConfirmation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  reactionConfirmText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.green,
  },
});

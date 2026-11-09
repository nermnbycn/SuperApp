import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/Store";
import {
  fetchAnnouncements,
  type Announcement,
} from "../redux/slices/AnnouncementSlice";
import { useHeaderScroll } from "../context/HeaderScrollContext";

const API_URL = "http://10.90.111.26:5277"; // AnnouncementSlice ile aynı adres olmalı.
const COLORS = {
  primary: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#202638",
  muted: "#8E96A7",
  border: "#E7E9F0",
  softBlue: "#EEF2F8",
};
const DEFAULT_IMAGE = require("../assets/images/image1Blog.png");
const HORIZONTAL_PADDING = 18;
const MAX_CARD_WIDTH = 900;

type AnnouncementNavigation = NativeStackNavigationProp<{
  AnnouncementDetail: { announcementId: number };
}>;

function imageSource(path?: string | null) {
  if (!path?.trim()) return DEFAULT_IMAGE;
  return {
    uri: /^https?:\/\//i.test(path)
      ? path
      : `${API_URL}/${path.replace(/^\/+/, "")}`,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

function plainText(html?: string | null) {
  return (html ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim();
}

export default function AnnouncementsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AnnouncementNavigation>();
  const { setCollapsed } = useHeaderScroll();
  const { width } = useWindowDimensions();
  const { announcements, loading, error } = useSelector(
    (state: RootState) => state.announcement,
  );
  const [failedImageIds, setFailedImageIds] = useState<number[]>([]);

  const cardWidth = Math.min(
    Math.max(width - HORIZONTAL_PADDING * 2, 1),
    MAX_CARD_WIDTH,
  );
  const imageHeight = Math.min(cardWidth * (9 / 16), 410);

  useFocusEffect(
    useCallback(() => {
      setCollapsed(false);
      return () => setCollapsed(false);
    }, [setCollapsed]),
  );

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const refreshAnnouncements = useCallback(() => {
    setFailedImageIds([]);
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleAnnouncementPress = (announcementId: number) => {
    navigation.navigate("AnnouncementDetail", { announcementId });
  };

  const renderAnnouncement = ({ item }: { item: Announcement }) => {
    const dateText = formatDate(item.createTime);
    const description = plainText(item.content);
    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        activeOpacity={0.85}
        onPress={() => handleAnnouncementPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title || "Duyuru"} detayını aç`}
      >
        <Image
          source={
            failedImageIds.includes(item.id)
              ? DEFAULT_IMAGE
              : imageSource(item.imageUrl)
          }
           
          style={[styles.cardImage, { height: 190 }]}
          resizeMode="cover"
         
          onError={() =>
            setFailedImageIds((ids) =>
              ids.includes(item.id) ? ids : [...ids, item.id],
            )
          }
        />
        <View style={styles.cardContent}>
          {!!dateText && (
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={COLORS.muted}
              />
              <Text style={styles.dateText}>{dateText}</Text>
            </View>
          )}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || "Başlıksız duyuru"}
          </Text>
          {!!description && (
            <Text style={styles.cardDescription} numberOfLines={3}>
              {description}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <View style={styles.infoRow}>
              <Ionicons name="eye-outline" size={16} color={COLORS.muted} />
              <Text style={styles.hitText}>{item.hit ?? 0}</Text>
            </View>
            <View style={styles.readMoreRow}>
              <Text style={styles.readMore}>Devamını Oku</Text>
              <Ionicons name="arrow-forward" size={17} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) =>
          setCollapsed(event.nativeEvent.contentOffset.y > 80)
        }
        refreshControl={
          <RefreshControl
            refreshing={loading && announcements.length > 0}
            onRefresh={refreshAnnouncements}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAnnouncement}
          numColumns={1}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={[styles.header, { width: cardWidth }]}>
              <Text style={styles.pageTitle}>Duyurular</Text>
              <Text style={styles.pageSubtitle}>
                Şirketimizden en güncel duyurular
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.emptyText}>Duyurular yükleniyor...</Text>
                </>
              ) : error ? (
                <>
                  <Ionicons
                    name="alert-circle-outline"
                    size={44}
                    color={COLORS.muted}
                  />
                  <Text style={styles.emptyText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refreshAnnouncements}
                  >
                    <Text style={styles.retryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Ionicons
                    name="megaphone-outline"
                    size={44}
                    color={COLORS.muted}
                  />
                  <Text style={styles.emptyText}>
                    Henüz duyuru paylaşılmamış.
                  </Text>
                </>
              )}
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
    alignItems: "center",
  },
  header: { paddingBottom: 18 },
  pageTitle: { fontSize: 24, fontWeight: "700", color: COLORS.primary },
  pageSubtitle: { marginTop: 5, fontSize: 13, color: COLORS.muted },
  card: {
    marginBottom: 18,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardImage: { width: "100%", backgroundColor: COLORS.softBlue },
  cardContent: { padding: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 12, color: COLORS.muted },
  cardTitle: {
    marginTop: 11,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
  },
  cardFooter: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hitText: { fontSize: 12, color: COLORS.muted },
  readMoreRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  readMore: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  emptyContainer: {
    paddingTop: 85,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: { color: COLORS.white, fontWeight: "600" },
});

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
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../redux/Store";
import { fetchGroupNews, type GroupNew } from "../redux/slices/GroupNewSlice";
import { useHeaderScroll } from "../context/HeaderScrollContext";

const COLORS = {
  primary: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#202638",
  muted: "#8E96A7",
  border: "#E7E9F0",
  softBlue: "#EEF2F8",
};

// GroupNewSlice ile aynı API adresi olmalı.
const API_URL = "http://10.90.111.26:5277"; // Gerçek telefon için sunucunun LAN adresini kullanın
const HORIZONTAL_PADDING = 18;
const MAX_CONTENT_WIDTH = 900;
const FALLBACK_IMAGE = require("../assets/images/image1Blog.png");
const IMAGE_VERSION = "2";

function getImageSource(imageUrl: string | null | undefined) {
  if (!imageUrl?.trim()) return FALLBACK_IMAGE;
  const url = imageUrl.trim();
  const fullUrl = /^https?:\/\//i.test(url)
    ? url
    : `${API_URL}/${url.replace(/^\/+/, "")}`;
  return {
    uri: `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}v=${IMAGE_VERSION}`,
    cache: "reload" as const,
  };
}

function toPlainText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim();
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GroupNewsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { setCollapsed } = useHeaderScroll();
  const { width } = useWindowDimensions();
  const { news, loading, error } = useSelector(
    (state: RootState) => state.groupNew,
  );

  const navigation =
    useNavigation<
      NativeStackNavigationProp<{ GroupNewsDetail: { newsId: number } }>
    >();

  const handleNewsPress = (newsId: number) => {
    navigation.navigate("GroupNewsDetail", { newsId });
  };
  const [failedImageIds, setFailedImageIds] = useState<number[]>([]);

  const cardWidth = Math.min(
    Math.max(width - HORIZONTAL_PADDING * 2, 1),
    MAX_CONTENT_WIDTH,
  );

  const refreshNews = useCallback(() => {
    dispatch(fetchGroupNews());
  }, [dispatch]);

  useEffect(() => {
    refreshNews();
  }, [refreshNews]);

  // Header durumunu ekrana her dönüşte sıfırla.
  useFocusEffect(
    useCallback(() => {
      setCollapsed(false);
      return () => setCollapsed(false);
    }, [setCollapsed]),
  );

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    setCollapsed(event.nativeEvent.contentOffset.y > 80);
  };

  const renderNews = ({ item }: { item: GroupNew }) => {
    const imageSource = failedImageIds.includes(item.id)
      ? FALLBACK_IMAGE
      : getImageSource(item.imageUrl);
    const dateLabel = formatDate(item.createTime);
    const excerpt = toPlainText(item.content);

    return (
      <TouchableOpacity
        style={[styles.newsCard, { width: cardWidth }]}
        activeOpacity={0.85}
        onPress={() => handleNewsPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title ?? "Haber"} detayını aç`}
      >
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.newsImage}
            resizeMode="cover"
            onError={() => {
              setFailedImageIds((ids) =>
                ids.includes(item.id) ? ids : [...ids, item.id],
              );
            }}
          />
        </View>

        <View style={styles.cardContent}>
          {!!dateLabel && (
            <View style={styles.metaRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={COLORS.muted}
              />
              <Text style={styles.metaText}>{dateLabel}</Text>
            </View>
          )}
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title || "Başlıksız haber"}
          </Text>
          {!!excerpt && (
            <Text style={styles.newsExcerpt} numberOfLines={3}>
              {excerpt}
            </Text>
          )}
          <View style={styles.cardBottom}>
            <Text style={styles.readMore}>Devamını Oku</Text>
            <Ionicons name="arrow-forward" size={17} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Başlık ve haber listesi tek ScrollView içinde birlikte kayar. */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshNews}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={[styles.headerInner, { maxWidth: MAX_CONTENT_WIDTH }]}>
            <Text style={styles.pageTitle}>Bizden Haberler</Text>
            <Text style={styles.pageSubtitle}>
              Şirketimizden en yeni haberler ve duyurular
            </Text>
          </View>
        </View>

        {loading && news.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.infoText}>Haberler yükleniyor...</Text>
          </View>
        ) : error && news.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="alert-circle-outline"
              size={44}
              color={COLORS.muted}
            />
            <Text style={styles.infoText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshNews}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={news}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNews}
            numColumns={1}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            // Yenileme dış ScrollView üzerinden yapılır.
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="newspaper-outline"
                  size={44}
                  color={COLORS.muted}
                />
                <Text style={styles.infoText}>Henüz haber paylaşılmamış.</Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pageScroll: { flex: 1 },
  pageScrollContent: { paddingBottom: 8, flexGrow: 1 },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerInner: { width: "100%", alignSelf: "center" },
  pageTitle: { fontSize: 25, fontWeight: "800", color: COLORS.primary },
  pageSubtitle: { marginTop: 5, fontSize: 13, color: COLORS.muted },
  list: { width: "100%" },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 28,
    alignItems: "center",
  },
  newsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.softBlue,
  },
  newsImage: { width: "100%", height: "100%" },
  cardContent: { padding: 18 },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 9,
  },
  metaText: { fontSize: 12, color: COLORS.muted },
  newsTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: COLORS.text,
  },
  newsExcerpt: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
  },
  cardBottom: {
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  readMore: { fontSize: 13, color: COLORS.primary, fontWeight: "700" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  infoText: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  retryText: { color: COLORS.white, fontWeight: "600" },
  emptyContainer: { paddingVertical: 70, gap: 12, alignItems: "center" },
});

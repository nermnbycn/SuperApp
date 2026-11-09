import React, { useCallback, useEffect } from "react";

import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
  useRoute,
  useFocusEffect,
  type RouteProp,
} from "@react-navigation/native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../redux/Store";

import { fetchBlogById } from "../redux/slices/BlogSlice";

import RenderHTML from "react-native-render-html";

import { useHeaderScroll } from "../context/HeaderScrollContext";

const API_URL = "http://10.90.111.26:5277";

const COLORS = {
  primary: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#202638",
  muted: "#8E96A7",
  border: "#E7E9F0",
};

type BlogStackParams = {
  BlogDetail: {
    blogId: number;
  };
};

type BlogDetailRouteProp = RouteProp<BlogStackParams, "BlogDetail">;

type BlogDetailNavigationProp = NativeStackNavigationProp<
  BlogStackParams,
  "BlogDetail"
>;

function getImageUrl(imagePath?: string | null): string | undefined {
  if (!imagePath) return undefined;

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return `${API_URL}/${imagePath.replace(/^\/+/, "")}`;
}

function prepareBlogHtml(html?: string | null): string {
  if (!html) return "";

  return html.replace(
    /(<img\b[^>]*\bsrc=["'])(\/?uploads\/[^"']+)(["'])/gi,
    (_, start: string, imagePath: string, end: string) => {
      return `${start}${getImageUrl(imagePath)}${end}`;
    },
  );
}

export default function BlogDetailScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const navigation = useNavigation<BlogDetailNavigationProp>();

  const route = useRoute<BlogDetailRouteProp>();

  const { blogId } = route.params;

  const { width } = useWindowDimensions();

  const { setCollapsed } = useHeaderScroll();

  const { selectedBlog, detailLoading, detailError } = useSelector(
    (state: RootState) => state.blog,
  );

  useFocusEffect(
    useCallback(() => {
      setCollapsed(false);

      return () => {
        setCollapsed(false);
      };
    }, [setCollapsed]),
  );

  useEffect(() => {
    dispatch(fetchBlogById(blogId));
  }, [dispatch, blogId]);

  const loadBlog = () => {
    dispatch(fetchBlogById(blogId));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const contentWidth = Math.max(width - 72, 1);

  if (detailLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.infoText}>Blog yükleniyor...</Text>
      </View>
    );
  }

  if (detailError || !selectedBlog) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={42} color={COLORS.muted} />

        <Text style={styles.infoText}>{detailError || "Blog bulunamadı."}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadBlog}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Eski blog detayının görünmesini önle
  if (selectedBlog.id !== blogId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const coverUrl = getImageUrl(selectedBlog.imageUrl);

  const htmlContent = prepareBlogHtml(selectedBlog.content);

  const formattedDate = selectedBlog.createdAt
    ? new Date(selectedBlog.createdAt).toLocaleDateString("tr-TR")
    : "";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(event) => {
        const scrollY = event.nativeEvent.contentOffset.y;

        setCollapsed(scrollY > 50);
      }}
    >
      {/* GERİ DÖN */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.primary} />

        <Text style={styles.backText}>Bloglara Dön</Text>
      </TouchableOpacity>

      {/* BLOG KARTI */}
      <View style={styles.card}>
        {/* KAPAK GÖRSELİ */}
        {coverUrl && (
          <Image
            source={{ uri: coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.body}>
          {/* BAŞLIK */}
          <Text style={styles.title}>{selectedBlog.title}</Text>

          {/* TARİH */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.muted} />

            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>

          <View style={styles.divider} />

          {/* HTML BLOG İÇERİĞİ */}
          <RenderHTML
            contentWidth={contentWidth}
            source={{
              html: selectedBlog.content ?? "",
              baseUrl: `${API_URL}/`,
            }}
            baseStyle={{
              fontSize: 15,
              lineHeight: 24,
              color: COLORS.text,
            }}
            tagsStyles={{
              p: {
                marginTop: 0,
                marginBottom: 12,
              },
              img: {
                marginVertical: 8,
              },
              a: {
                color: COLORS.primary,
              },
            }}
            renderersProps={{
              img: {
                enableExperimentalPercentWidth: true,
              },
            }}
            defaultTextProps={{
              selectable: true,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 45,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 24,
    gap: 12,
  },

  infoText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
    height:44
  },

  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    overflow: "hidden",
    elevation: 2,
  },

  coverImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#E9F0F9",
  },

  body: {
    padding: 18,
  },

  title: {
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 15,
  },

  metaText: {
    fontSize: 12,
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 5,
  },

  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

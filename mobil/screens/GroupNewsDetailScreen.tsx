import React, { useCallback, useEffect } from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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

import RenderHTML from "react-native-render-html";

import type { AppDispatch, RootState } from "../redux/Store";

import { fetchGroupNewById } from "../redux/slices/GroupNewSlice";

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

type NewsStackParams = {
  GroupNewsDetail: {
    newsId: number;
  };
};

type NewsDetailRoute = RouteProp<NewsStackParams, "GroupNewsDetail">;

type NewsDetailNavigation = NativeStackNavigationProp<
  NewsStackParams,
  "GroupNewsDetail"
>;

function getImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

export default function GroupNewsDetailScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const navigation = useNavigation<NewsDetailNavigation>();

  const route = useRoute<NewsDetailRoute>();

  const { newsId } = route.params;

  const { width } = useWindowDimensions();

  const { setCollapsed } = useHeaderScroll();

  const { selectedGroupNew, detailLoading, detailError } = useSelector(
    (state: RootState) => state.groupNew,
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
    dispatch(fetchGroupNewById(newsId));
  }, [dispatch, newsId]);

  const reloadNews = () => {
    dispatch(fetchGroupNewById(newsId));
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (detailLoading || (selectedGroupNew && selectedGroupNew.id !== newsId)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.infoText}>Haber yükleniyor...</Text>
      </View>
    );
  }

  if (detailError || !selectedGroupNew) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={42} color={COLORS.muted} />

        <Text style={styles.infoText}>
          {detailError || "Haber bulunamadı."}
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={reloadNews}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backText}>Haberlere Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const news = selectedGroupNew;

  const imageUrl = getImageUrl(news.imageUrl);

  const content = news.content || "";

  const dateValue = news.createTime;

  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString("tr-TR")
    : "";

  const contentWidth = Math.max(width - 72, 1);

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
        onPress={goBack}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.primary} />

        <Text style={styles.backText}>Haberlere Dön</Text>
      </TouchableOpacity>

      {/* HABER KARTI */}
      <View style={styles.card}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.body}>
          {/* BAŞLIK */}
          <Text style={styles.title}>{news.title}</Text>

          {/* TARİH */}
          {formattedDate ? (
            <View style={styles.metaRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={COLORS.muted}
              />

              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* HTML HABER İÇERİĞİ */}
          <RenderHTML
            contentWidth={contentWidth}
            source={{
              html: content,
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
            defaultTextProps={{
              selectable: true,
            }}
            renderersProps={{
              img: {
                enableExperimentalPercentWidth: true,
              },
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
    height: 230,
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
  },

  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

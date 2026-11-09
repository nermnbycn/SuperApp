import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import RenderHTML from "react-native-render-html";
import type { AppDispatch, RootState } from "../redux/Store";
import { fetchAnnouncementById } from "../redux/slices/AnnouncementSlice";
import { useHeaderScroll } from "../context/HeaderScrollContext";

const API_URL = "http://10.90.111.26:5277"; // AnnouncementSlice ile aynı sunucu adresi.
const COLORS = {
  primary: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#202638",
  muted: "#8E96A7",
  border: "#E7E9F0",
};
const DEFAULT_IMAGE = require("../assets/images/image1Blog.png");

type Params = { AnnouncementDetail: { announcementId: number } };
type DetailRoute = RouteProp<Params, "AnnouncementDetail">;
type DetailNavigation = NativeStackNavigationProp<Params, "AnnouncementDetail">;

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

export default function AnnouncementDetailScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<DetailNavigation>();
  const route = useRoute<DetailRoute>();
  const { announcementId } = route.params;
  const { width } = useWindowDimensions();
  const { setCollapsed } = useHeaderScroll();

  const { selectedAnnouncement, detailLoading, detailError } = useSelector(
    (state: RootState) => state.announcement,
  );

  useFocusEffect(
    useCallback(() => {
      setCollapsed(false);
      return () => setCollapsed(false);
    }, [setCollapsed]),
  );

  useEffect(() => {
    dispatch(fetchAnnouncementById(announcementId));
  }, [dispatch, announcementId]);

  const reload = () => dispatch(fetchAnnouncementById(announcementId));

  if (
    detailLoading ||
    (selectedAnnouncement && selectedAnnouncement.id !== announcementId)
  ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.info}>Duyuru yükleniyor...</Text>
      </View>
    );
  }

  if (detailError || !selectedAnnouncement) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={42} color={COLORS.muted} />
        <Text style={styles.info}>{detailError || "Duyuru bulunamadı."}</Text>
        <TouchableOpacity style={styles.retry} onPress={reload}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Duyurulara Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const announcement = selectedAnnouncement;
  const dateText = formatDate(announcement.createTime);
  const contentWidth = Math.max(Math.min(width - 72, 864), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(event) => setCollapsed(event.nativeEvent.contentOffset.y > 80)}
    >
      <View style={styles.inner}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backText}>Duyurulara Dön</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Image
            source={imageSource(announcement.imageUrl)}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.body}>
            <Text style={styles.title}>
              {announcement.title || "Başlıksız duyuru"}
            </Text>
            {!!dateText && (
              <View style={styles.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={COLORS.muted}
                />
                <Text style={styles.metaText}>{dateText}</Text>
              </View>
            )}
            <View style={styles.divider} />
            {!!announcement.content?.trim() ? (
              <RenderHTML
                contentWidth={contentWidth}
                source={{ html: announcement.content, baseUrl: `${API_URL}/` }}
                baseStyle={{ fontSize: 15, lineHeight: 24, color: COLORS.text }}
                tagsStyles={{
                  p: { marginTop: 0, marginBottom: 12 },
                  img: { marginVertical: 8 },
                  a: { color: COLORS.primary },
                }}
                renderersProps={{
                  img: { enableExperimentalPercentWidth: true },
                }}
              />
            ) : (
              <Text style={styles.info}>Duyuru açıklaması bulunmuyor.</Text>
            )}
            <View style={styles.viewsRow}>
              <Ionicons name="eye-outline" size={16} color={COLORS.muted} />
              <Text style={styles.metaText}>{announcement.hit ?? 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 45 },
  inner: { width: "100%", maxWidth: 900, alignSelf: "center" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    gap: 12,
    padding: 24,
  },
  info: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
    height:44
  },
  backText: { color: COLORS.primary, fontSize: 18, fontWeight: "600" },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    elevation: 2,
  },
  coverImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#EEF2F8",
  },
  body: { padding: 18 },
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
  metaText: { fontSize: 12, color: COLORS.muted },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 18 },
  viewsRow: {
    marginTop: 18,
    paddingTop: 13,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  retry: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryText: { color: COLORS.white, fontWeight: "600" },
});

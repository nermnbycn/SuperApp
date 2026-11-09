import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RenderHTML from "react-native-render-html";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderScroll } from "../context/HeaderScrollContext";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/Store";
import { fetchBlogs, type Blog } from "../redux/slices/BlogSlice";
import CreateBlogModal from "../components/CreateBlogModal";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
const COLORS = {
  primary: "#1D2749",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#202638",
  muted: "#8E96A7",
  border: "#E7E9F0",
};
const API_URL = "http://10.90.111.26:5277";
const HORIZONTAL_PADDING = 18;
const CARD_GAP = 12;
export default function BlogsScreen() {
  const navigation = useNavigation<
    NativeStackNavigationProp<{
      BlogDetail: { blogId: number };
    }>
  >();

  const { setCollapsed } = useHeaderScroll();

  // Sayfa her odaklandığında ortak header genişler.
  useFocusEffect(
    useCallback(() => {
      setCollapsed(false);

      return () => {
        setCollapsed(false);
      };
    }, [setCollapsed]),
  );

  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector(
    (state: RootState) => state.blog,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const numColumns = width >= 1100 ? 4 : width >= 768 ? 3 : 2;
  const cardWidth = (width - 36 - (numColumns - 1) * 12) / numColumns;
  // Sayfa açıldığında blogları getir
  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);
  // Listeyi yenile
  const refreshBlogs = useCallback(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);
  // Yeni blog modalını aç
  const handleOpenModal = () => {
    setModalVisible(true);
  };
  // Modalı kapat
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  // Blog oluşturulduktan sonra listeyi yenile
  const handleBlogCreated = () => {
    refreshBlogs();
    setModalVisible(false);
  };
  const handleBlogPress = (blog: Blog) => {
    navigation.navigate("BlogDetail", {
      blogId: blog.id,
    });
  };

  const renderBlog = ({ item }: { item: Blog }) => {
    return (
      <TouchableOpacity
        style={[styles.blogCard, { width: cardWidth }]}
        activeOpacity={0.8}
        onPress={() => handleBlogPress(item)}
      >
        {/* BLOG GÖRSELİ */}
        {/* BLOG GÖRSELİ */}
        <View style={styles.imageContainer}>
          <Image
            source={
              item.imageUrl
                ? {
                    uri: item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `${API_URL}/${item.imageUrl.replace(/^\/+/, "")}`,
                  }
                : require("../assets/images/image1Blog.png")
            }
            style={styles.blogImage}
            resizeMode="cover"
            onLoad={() => {
              console.log("GÖRSEL YÜKLENDİ:", item.id);
            }}
            onError={(event) => {
              console.error("GÖRSEL HATASI:", {
                blogId: item.id,
                imageUrl: item.imageUrl,
                fullUrl: item.imageUrl?.startsWith("http")
                  ? item.imageUrl
                  : `${API_URL}/${item.imageUrl?.replace(/^\/+/, "")}`,
                error: event.nativeEvent.error,
              });
            }}
          />
        </View>
        {/* BLOG BİLGİLERİ */}
        <View style={styles.cardContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>

         
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setCollapsed(scrollY > 50);
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshBlogs}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* SAYFA BAŞLIĞI VE ARTI BUTONU */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Bloglar</Text>
            <Text style={styles.pageSubtitle}>
              Şirketimizden yazılar ve paylaşımlar
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={handleOpenModal}
            accessibilityRole="button"
            accessibilityLabel="Yeni blog ekle"
          >
            <Ionicons name="add" size={27} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        {/* BLOG LİSTESİ */}
        {loading && blogs.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.infoText}>Bloglar yükleniyor...</Text>
          </View>
        ) : error && blogs.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={COLORS.muted}
            />
            <Text style={styles.infoText}>Bloglar yüklenemedi.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshBlogs}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            key={`blogs-${numColumns}`}
            data={blogs}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderBlog}
            numColumns={numColumns}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={42}
                  color={COLORS.muted}
                />
                <Text style={styles.infoText}>Henüz blog paylaşılmamış.</Text>
              </View>
            }
          />
        )}
      </ScrollView>
      {/* BLOG OLUŞTURMA MODALI */}
      <CreateBlogModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onCreated={handleBlogCreated}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 30,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: 12,
  },
  blogCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  imageContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#E9F0F9",
  },
  blogImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
    minHeight: 84,
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 19,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 75,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

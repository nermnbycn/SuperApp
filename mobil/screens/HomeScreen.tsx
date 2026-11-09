
import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import TodayMenuSection from "../components/TodayMenuSection";
import UserCelebrationSection from "../components/UserCelebrationSection";
import CreateBlogModal from "../components/CreateBlogModal";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/Store";
import { fetchBlogs } from "../redux/slices/BlogSlice";
import { useHeaderScroll } from "../context/HeaderScrollContext";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { setCollapsed } = useHeaderScroll();

  const [blogModalVisible, setBlogModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setCollapsed(scrollY > 20);
        }}
      >
        {/* YEMEK MENÜSÜ */}
        <TodayMenuSection />

        {/* DOĞUM GÜNLERİ VE İŞ YIL DÖNÜMLERİ */}
        <UserCelebrationSection />
      </ScrollView>

      {/* BLOG EKLEME MODALI */}
      <CreateBlogModal
        visible={blogModalVisible}
        onClose={() => setBlogModalVisible(false)}
        onCreated={() => {
          dispatch(fetchBlogs());
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
});

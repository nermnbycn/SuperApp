import React, { useState } from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";

interface Blog {
  id: number;
  title: string;
  imageUrl: string | null;
}

interface BlogItemProps {
  blog: Blog;
  width: number;
  onPress: () => void;
}

// Android emülatörü için API adresi
const API_URL = "http://10.90.111.26:5277";

const DEFAULT_IMAGE = require("../assets/images/image1Blog.png");

// Backend'den gelen görsel adresini tam URL'ye dönüştür
const getBlogImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) {
    return null;
  }

  // API zaten tam adres göndermişse
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // Örnek: /uploads/blog/resim.jpg
  return `${API_URL}/${imageUrl.replace(/^\/+/, "")}`;
};

export default function BlogItemComponent({
  blog,
  width,
  onPress,
}: BlogItemProps) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = getBlogImageUrl(blog.imageUrl);

  const imageSource =
    imageUrl && !imageError ? { uri: imageUrl } : DEFAULT_IMAGE;

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.title} numberOfLines={2}>
        {blog.title}
      </Text>

      <Image
        key={imageUrl ?? "default"}
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
        onError={(event) => {
          console.log(
            "Blog görseli yüklenemedi:",
            imageUrl,
            event.nativeEvent.error,
          );

          setImageError(true);
        }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1D2749",
    borderRadius: 16,
    padding: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
});

import React, { useEffect, useRef, useState } from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../redux/Store";

import { fetchBlogCategories } from "../redux/slices/BlogSlice";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  token?: string | null;
}

const API_URL = "http://10.90.111.26:5277";

const COLORS = {
  primary: "#1D2749",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#1E293B",
  muted: "#64748B",
  border: "#818CF8",
  lightBorder: "#E2E8F0",
};

export default function CreateBlogModal({
  visible,
  onClose,
  onCreated,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { categories } = useSelector((state: RootState) => state.blog);

  const richTextRef = useRef<RichEditor>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  // KATEGORİLERİ GETİR
  useEffect(() => {
    if (visible) {
      dispatch(fetchBlogCategories());
    }
  }, [visible, dispatch]);

  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );

  // BLOG KAPAK FOTOĞRAFI SEÇ
  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Fotoğraf seçme hatası:", error);

      Alert.alert("Hata", "Kapak fotoğrafı seçilemedi.");
    }
  };

  // HTML EDİTÖRÜNE GÖRSEL YÜKLE
  const selectEditorImage = async () => {
    if (uploadingImage || loading) return;

    try {
      // GALERİYİ AÇ
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];

      // JWT TOKEN
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        Alert.alert("Oturum bulunamadı", "Lütfen yeniden giriş yapın.");
        return;
      }

      setUploadingImage(true);

      // ÖNCEKİ ÇALIŞAN KAPAK FOTOĞRAFI YÖNTEMİ
      const imageFile = new File(selectedImage.uri);

      const formData = new FormData();

      formData.append("image", imageFile);

      // GÖRSELİ BACKEND'E GÖNDER
      const response = await expoFetch(`${API_URL}/api/Blog/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Görsel yükleme hatası:", response.status, errorText);

        throw new Error(errorText || "Görsel yüklenemedi.");
      }

      // BACKEND'DEN GÖRSEL ADRESİNİ AL
      const data: {
        url: string;
        path: string;
      } = await response.json();

      if (!data.url) {
        throw new Error("Sunucudan görsel adresi alınamadı.");
      }

      // GÖRSELİ HTML EDİTÖRÜNE EKLE
      richTextRef.current?.insertImage(data.url);

      console.log("Görsel başarıyla eklendi:", data.url);
    } catch (error) {
      console.error("Editöre görsel ekleme hatası:", error);

      Alert.alert(
        "Görsel yüklenemedi",
        error instanceof Error
          ? error.message
          : "Görsel yüklenirken hata oluştu.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // FORMU TEMİZLE
  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategoryId(null);
    setImage(null);
    setCategoryOpen(false);

    richTextRef.current?.setContentHTML("");
  };

  // MODALI KAPAT
  const handleClose = () => {
    if (loading || uploadingImage) {
      return;
    }

    onClose();
  };

  // BLOGU KAYDET
  const handleSave = async (): Promise<void> => {
    if (loading || uploadingImage) return;

    // HTML EDİTÖRÜNÜN GÜNCEL İÇERİĞİ
    const html = (await richTextRef.current?.getContentHtml()) ?? content;

    const plainText = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, "")
      .trim();

    const hasContent = plainText.length > 0 || /<img\b/i.test(html);

    if (!title.trim() || !hasContent || categoryId === null || !image) {
      Alert.alert("Uyarı", "Lütfen bütün alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      // JWT TOKEN
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        Alert.alert(
          "Oturum bulunamadı",
          "Blog eklemek için yeniden giriş yapmalısınız.",
        );

        return;
      }

      // BLOG VERİLERİ
      const formData = new FormData();

      formData.append("Title", title.trim());

      // HTML OLARAK KAYDET
      formData.append("Content", html.trim());

      formData.append("CategoryId", String(categoryId));

      // KAPAK FOTOĞRAFI:
      // ESKİ ÇALIŞAN YÖNTEM
      const imageFile = new File(image.uri);

      formData.append("Image", imageFile);

      // BLOG OLUŞTUR
      const response = await expoFetch(`${API_URL}/api/Blog`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();

        console.error("Blog oluşturma hatası:", response.status, errorBody);

        if (response.status === 401) {
          throw new Error("Oturumunuzun süresi dolmuş. Yeniden giriş yapın.");
        }

        if (response.status === 403) {
          throw new Error("Blog oluşturma yetkiniz bulunmuyor.");
        }

        throw new Error(errorBody || "Blog oluşturulamadı.");
      }

      // FORMU TEMİZLE
      resetForm();

      // LİSTEYİ YENİLE VE MODALI KAPAT
      onCreated();
      onClose();

      Alert.alert("Başarılı", "Blog başarıyla oluşturuldu.");
    } catch (error) {
      console.error("Blog kayıt hatası:", error);

      Alert.alert(
        "Hata",
        error instanceof Error
          ? error.message
          : "Blog eklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* MODAL BAŞLIĞI */}
        <View style={styles.header}>
          <Text style={styles.heading}>Blog Yaz</Text>

          <TouchableOpacity
            onPress={handleClose}
            disabled={loading || uploadingImage}
          >
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* KAPAK FOTOĞRAFI */}
          <Text style={styles.label}>Blog Fotoğrafı *</Text>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={selectImage}
            disabled={loading || uploadingImage}
          >
            <Text style={styles.selectButton}>Dosya Seç</Text>

            <Text style={styles.fileName} numberOfLines={1}>
              {image?.fileName ?? "Dosya seçiniz"}
            </Text>
          </TouchableOpacity>

          {image && (
            <Image
              source={{ uri: image.uri }}
              style={styles.preview}
              resizeMode="cover"
            />
          )}

          {/* KATEGORİ */}
          <Text style={styles.label}>Kategori *</Text>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => {
              setCategoryOpen(!categoryOpen);
            }}
          >
            <Text style={styles.fieldText}>
              {selectedCategory?.name || "Seçiniz"}
            </Text>

            <Text>⌄</Text>
          </TouchableOpacity>

          {categoryOpen && (
            <View style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => {
                    setCategoryId(category.id);
                    setCategoryOpen(false);
                  }}
                >
                  <Text style={styles.fieldText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* BAŞLIK */}
          <Text style={styles.label}>Başlık *</Text>

          <TextInput
            style={styles.input}
            placeholder="Blog başlığını giriniz"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          {/* HTML EDİTÖRÜ */}
          <Text style={styles.label}>İçerik *</Text>

          <View style={styles.editorContainer}>
            <RichToolbar
              getEditor={() => richTextRef.current!}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.alignLeft,
                actions.alignCenter,
                actions.alignRight,
                actions.insertOrderedList,
                actions.insertBulletsList,
                actions.insertImage,
                actions.undo,
                actions.redo,
              ]}
              onPressAddImage={selectEditorImage}
              iconTint={COLORS.primary}
              selectedIconTint="#4338CA"
              disabled={loading || uploadingImage}
              style={styles.richToolbar}
            />

            <View style={styles.editorDivider} />

            <RichEditor
              ref={richTextRef}
              placeholder="Blog içeriğini yazınız..."
              onChange={setContent}
              initialHeight={220}
              style={styles.richEditor}
              editorStyle={{
                backgroundColor: COLORS.white,
                color: COLORS.text,
                placeholderColor: "#94A3B8",
                contentCSSText: `
                  body {
                    font-size: 15px;
                    line-height: 1.6;
                    padding: 4px;
                    overflow-wrap: break-word;
                  }

                  img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                  }

                  a {
                    color: #1D2749;
                  }
                `,
              }}
            />
          </View>

          {/* GÖRSEL YÜKLEME DURUMU */}
          {uploadingImage && (
            <View style={styles.uploadStatus}>
              <ActivityIndicator size="small" color={COLORS.primary} />

              <Text style={styles.uploadText}>Görsel yükleniyor...</Text>
            </View>
          )}

          <Text style={styles.helperText}>
            Metinleri biçimlendirebilir ve görsel simgesine basarak içerik
            içerisine fotoğraf ekleyebilirsiniz.
          </Text>

          {/* BLOGU KAYDET */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (loading || uploadingImage) && {
                opacity: 0.6,
              },
            ]}
            onPress={handleSave}
            disabled={loading || uploadingImage}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Blogu Kaydet</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 45,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderColor: COLORS.lightBorder,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },

  close: {
    fontSize: 24,
    color: COLORS.muted,
  },

  form: {
    padding: 20,
    paddingBottom: 50,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 18,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  selectButton: {
    backgroundColor: COLORS.text,
    color: COLORS.white,
    padding: 10,
    borderRadius: 8,
    overflow: "hidden",
  },

  fileName: {
    color: COLORS.muted,
    flex: 1,
  },

  preview: {
    height: 170,
    width: "100%",
    borderRadius: 12,
    marginTop: 12,
  },

  fieldText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
  },

  categoryList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    marginTop: 5,
  },

  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },

  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
  },

  editorContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
  },

  richToolbar: {
    backgroundColor: COLORS.white,
    minHeight: 48,
  },

  editorDivider: {
    height: 1,
    backgroundColor: COLORS.lightBorder,
  },

  richEditor: {
    minHeight: 220,
    backgroundColor: COLORS.white,
  },

  uploadStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EEF2F8",
  },

  uploadText: {
    fontSize: 13,
    color: COLORS.primary,
  },

  helperText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
  },

  saveButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

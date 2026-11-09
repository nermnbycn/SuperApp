import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

import type { RootState, AppDispatch } from "../redux/Store";
import type { User } from "../redux/slices/UserSlice";

import {
  fetchBirthdayUsers,
  fetchAnniversaryUsers,
} from "../redux/slices/UserSlice";

import UserCelebrationCard from "./UserCelebrationCard";

type Period = "today" | "week";

const COLORS = {
  primary: "#1D2749",
  secondary: "#303D65",
  background: "#F7F8FA",
  white: "#FFFFFF",
  muted: "#8E96A7",
  border: "#E7E9F0",
  selectedBackground: "#E9F0F9",
};

const API_URL = "http://10.90.111.26:5277";

export default function UserCelebrationSection() {
  const dispatch = useDispatch<AppDispatch>();

  const { birthdayUsers, anniversaryUsers, loading, error } = useSelector(
    (state: RootState) => state.user,
  );

  const [birthdayPeriod, setBirthdayPeriod] = useState<Period>("today");

  const [anniversaryPeriod, setAnniversaryPeriod] = useState<Period>("today");

  const [weeklyBirthdays, setWeeklyBirthdays] = useState<User[]>([]);

  const [weeklyAnniversaries, setWeeklyAnniversaries] = useState<User[]>([]);

  const [weekLoading, setWeekLoading] = useState(false);

  const [weekError, setWeekError] = useState<string | null>(null);

  // BUGÜNKÜ DOĞUM GÜNÜ VE İŞ YIL DÖNÜMLERİ
  useEffect(() => {
    dispatch(fetchBirthdayUsers());
    dispatch(fetchAnniversaryUsers());
  }, [dispatch]);

  // HAFTALIK DOĞUM GÜNÜ VE İŞ YIL DÖNÜMLERİ
  useEffect(() => {
    if (birthdayPeriod !== "week" && anniversaryPeriod !== "week") {
      return;
    }

    let active = true;

    const loadWeeklyData = async () => {
      setWeekLoading(true);
      setWeekError(null);

      try {
        const requests: Promise<Response>[] = [];

        if (birthdayPeriod === "week") {
          requests.push(fetch(`${API_URL}/api/User/birthdays/week`));
        }

        if (anniversaryPeriod === "week") {
          requests.push(fetch(`${API_URL}/api/User/anniversaries/week`));
        }

        const responses = await Promise.all(requests);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Haftalık kutlama verileri getirilemedi.");
        }

        const results = await Promise.all(
          responses.map((response) => response.json()),
        );

        if (!active) return;

        let index = 0;

        if (birthdayPeriod === "week") {
          setWeeklyBirthdays(results[index++] as User[]);
        }

        if (anniversaryPeriod === "week") {
          setWeeklyAnniversaries(results[index] as User[]);
        }
      } catch {
        if (active) {
          setWeekError("Haftalık liste şu anda kullanılamıyor.");
        }
      } finally {
        if (active) {
          setWeekLoading(false);
        }
      }
    };

    loadWeeklyData();

    return () => {
      active = false;
    };
  }, [birthdayPeriod, anniversaryPeriod]);

  // KUTLAMA MESAJI
  const handleSendMessage = async (
    userId: string,
    message: string,
  ): Promise<void> => {
    console.log("Alıcı ID:", userId);
    console.log("Mesaj:", message);

    Alert.alert("Test Modu", "Mesaj konsola yazdırıldı. Henüz gönderilmedi.");
  };

  // BUGÜN / BU HAFTA BUTONLARI
  const renderPeriodSelector = (
    selected: Period,
    onChange: (period: Period) => void,
  ) => (
    <View style={styles.periodContainer}>
      <TouchableOpacity
        style={[
          styles.periodButton,
          selected === "today" && styles.periodActive,
        ]}
        onPress={() => onChange("today")}
      >
        <Text
          style={[
            styles.periodText,
            selected === "today" && styles.periodActiveText,
          ]}
        >
          Bugün
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.periodButton,
          selected === "week" && styles.periodActive,
        ]}
        onPress={() => onChange("week")}
      >
        <Text
          style={[
            styles.periodText,
            selected === "week" && styles.periodActiveText,
          ]}
        >
          Bu Hafta
        </Text>
      </TouchableOpacity>
    </View>
  );

  // KART LİSTESİ
  const renderCelebrationList = (
    users: User[],
    type: "birthday" | "anniversary",
    period: Period,
  ) => (
    <FlatList
      horizontal
      data={users}
      keyExtractor={(item, index) =>
        item.id
          ? `${type}-${period}-${item.id}-${index}`
          : `${type}-${period}-${index}`
      }
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {period === "today"
            ? type === "birthday"
              ? "Bugün doğum günü olan çalışan bulunmuyor."
              : "Bugün iş yıl dönümü olan çalışan bulunmuyor."
            : type === "birthday"
              ? "Bu hafta doğum günü olan çalışan bulunmuyor."
              : "Bu hafta iş yıl dönümü olan çalışan bulunmuyor."}
        </Text>
      }
      renderItem={({ item }) => (
        <UserCelebrationCard
          user={item}
          type={type}
          isWeekly={period === "week"}
          onSendMessage={handleSendMessage}
        />
      )}
    />
  );

  const birthdayData =
    birthdayPeriod === "today" ? birthdayUsers : weeklyBirthdays;

  const anniversaryData =
    anniversaryPeriod === "today" ? anniversaryUsers : weeklyAnniversaries;

  const birthdayBusy = birthdayPeriod === "today" ? loading : weekLoading;

  const anniversaryBusy = anniversaryPeriod === "today" ? loading : weekLoading;

  const birthdayError = birthdayPeriod === "today" ? error : weekError;

  const anniversaryError = anniversaryPeriod === "today" ? error : weekError;

  return (
    <View style={styles.container}>
      {/* DOĞUM GÜNLERİ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.heading}>Doğum Günleri</Text>

          {renderPeriodSelector(birthdayPeriod, setBirthdayPeriod)}
        </View>

        {birthdayBusy ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : birthdayError ? (
          <Text style={styles.error}>{birthdayError}</Text>
        ) : (
          renderCelebrationList(birthdayData, "birthday", birthdayPeriod)
        )}
      </View>

      {/* İŞ YIL DÖNÜMLERİ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.heading}>İş Yıl Dönümleri</Text>

          {renderPeriodSelector(anniversaryPeriod, setAnniversaryPeriod)}
        </View>

        {anniversaryBusy ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : anniversaryError ? (
          <Text style={styles.error}>{anniversaryError}</Text>
        ) : (
          renderCelebrationList(
            anniversaryData,
            "anniversary",
            anniversaryPeriod,
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 30,
  },

  section: {
    gap: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  heading: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.primary,
    flexShrink: 1,
  },

  periodContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.selectedBackground,
    borderRadius: 14,
    padding: 3,
  },

  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  periodActive: {
    backgroundColor: COLORS.primary,
  },

  periodText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
  },

  periodActiveText: {
    color: COLORS.white,
  },

  listContent: {
    paddingRight: 16,
    paddingBottom: 8,
  },

  empty: {
    color: COLORS.muted,
    fontSize: 13,
    paddingVertical: 18,
  },

  error: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
  },
});

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { RootState, AppDispatch } from "../redux/Store";
import {
  fetchRemainingWeekMenus,
  type FoodMenu,
} from "../redux/slices/MenuSlice";

const COLORS = {
  primary: "#1D2749",
  secondary: "#303D65",
  text: "#202638",
  muted: "#8E96A7",
  border: "#E7E9F0",
  white: "#FFFFFF",
  softBlue: "#EEF2F8",
  background: "#F7F8FA",
  nextMonth: "#E3E6EC",
  nextMonthBorder: "#D3D8E2",
  nextMonthText: "#7D8595",
};

const parseDate = (value: string): Date => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDayName = (value: string) =>
  parseDate(value).toLocaleDateString("tr-TR", { weekday: "long" });

const getDayNumber = (value: string) =>
  parseDate(value).toLocaleDateString("tr-TR", { day: "numeric" });

const getMonth = (value: string) =>
  parseDate(value).toLocaleDateString("tr-TR", { month: "short" });

const getFullDate = (value: string) =>
  parseDate(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

type FoodIcon = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Dört yemek alanının tamamı boşsa o günün menüsü henüz yüklenmemiştir.
// null, undefined ve yalnızca boşluk içeren metinler de boş kabul edilir.
const isMenuAvailable = (menu: FoodMenu): boolean =>
  [menu.food1, menu.food2, menu.food3, menu.food4].some(
    (food) => typeof food === "string" && food.trim().length > 0,
  );

type FoodItem = {
  name: string;
  calorie: number;
  icon: FoodIcon;
};

export default function TodayMenuSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { menus, loading, error } = useSelector(
    (state: RootState) => state.menu,
  );
  const { width, height } = useWindowDimensions();
  // Telefon ve tablette 5 kartı aynı satırda tutacak orantılı ölçüler.
  const shortestSide = Math.min(width, height);
  const dayCardHeight = Math.min(100, Math.max(66, shortestSide * 0.19));
  const dayNumberFontSize = Math.min(25, Math.max(18, shortestSide * 0.055));
  const dayMonthFontSize = Math.min(13, Math.max(10, shortestSide * 0.03));

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Backend sonraki 5 iş gününü getirecek şekilde ayarlandığı için
  // hafta sonlarında da sonraki haftanın menülerini sorguluyoruz.
  useEffect(() => {
    dispatch(fetchRemainingWeekMenus());
  }, [dispatch]);

  // Güvenlik amaçlı frontend'de de hafta sonlarını filtreliyoruz.
  // Kayıtların tarih sırasıyla ve en fazla 5 gün gösterilmesini sağlıyoruz.
  const visibleMenus = useMemo(() => {
  return [...menus]
    .sort((a, b) => a.menuDate.localeCompare(b.menuDate))
    .slice(0, 5);
}, [menus]);

  useEffect(() => {
    setSelectedDate((previous) => {
      if (
        previous &&
        visibleMenus.some(
          (menu) => menu.menuDate === previous && isMenuAvailable(menu),
        )
      ) {
        return previous;
      }
      return visibleMenus.find(isMenuAvailable)?.menuDate ?? null;
    });
  }, [visibleMenus]);

  const selectedMenu: FoodMenu | undefined = visibleMenus.find(
    (menu) => menu.menuDate === selectedDate && isMenuAvailable(menu),
  );

  const foods: FoodItem[] = selectedMenu
    ? [
        {
          name: selectedMenu.food1,
          calorie: selectedMenu.calorie1,
          icon: "pot-steam-outline",
        },
        {
          name: selectedMenu.food2,
          calorie: selectedMenu.calorie2,
          icon: "food-outline",
        },
        {
          name: selectedMenu.food3,
          calorie: selectedMenu.calorie3,
          icon: "silverware-fork-knife",
        },
        {
          name: selectedMenu.food4,
          calorie: selectedMenu.calorie4,
          icon: "food-apple-outline",
        },
      ]
    : [];

  const totalCalories = foods.reduce(
    (total, food) => total + (food.calorie ?? 0),
    0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Haftalık Yemek Menüsü</Text>

      {loading && visibleMenus.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : error && visibleMenus.length === 0 ? (
        <Text style={styles.message}>{error}</Text>
      ) : visibleMenus.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="calendar-remove-outline"
            size={32}
            color={COLORS.muted}
          />
          <Text style={styles.message}>
            Önümüzdeki iş günleri için yemek menüsü bulunamadı.
          </Text>
        </View>
      ) : (
        <>
          {/* GÜN SEÇİM KARTLARI */}
          <View style={styles.daysContainer}>
            {visibleMenus.map((menu) => {
              const isUnavailable = !isMenuAvailable(menu);
              const selected = menu.menuDate === selectedDate && !isUnavailable;

              return (
                <TouchableOpacity
                  key={menu.menuDate}
                  activeOpacity={isUnavailable ? 1 : 0.8}
                  disabled={isUnavailable}
                  onPress={() => {
                    if (!isUnavailable) setSelectedDate(menu.menuDate);
                  }}
                  style={[
                    styles.dayCard,
                    { height: dayCardHeight },
                    selected && styles.activeDayCard,
                    isUnavailable && styles.nextMonthDayCard,
                  ]}
                  accessibilityLabel={`${getDayName(menu.menuDate)} ${getFullDate(menu.menuDate)}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: isUnavailable }}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { fontSize: dayNumberFontSize },
                      selected && styles.activeDayText,
                      isUnavailable && styles.nextMonthDayText,
                    ]}
                  >
                    {getDayNumber(menu.menuDate)}
                  </Text>
                  <Text
                    style={[
                      styles.dayMonth,
                      { fontSize: dayMonthFontSize },
                      selected && styles.activeDayText,
                      isUnavailable && styles.nextMonthDayText,
                    ]}
                  >
                    {getMonth(menu.menuDate)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* API daha az kayıt döndürürse yerleşim yine 5 eşit slot kalır. */}
            {Array.from({ length: Math.max(0, 5 - visibleMenus.length) }).map(
              (_, index) => (
                <View
                  key={`empty-day-${index}`}
                  style={[
                    styles.dayCard,
                    styles.emptyDaySlot,
                    { height: dayCardHeight },
                  ]}
                />
              ),
            )}
          </View>
          {/* YEMEK MENÜSÜ KARTI */}
          {selectedMenu && (
            <View style={styles.menuCard}>
              <View style={styles.menuHeader}>
                <View style={styles.calendarIconContainer}>
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={27}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.menuDateText}>
                  {getFullDate(selectedMenu.menuDate)}
                </Text>
              </View>

              {/* YEMEKLER */}
              <View style={styles.foodsContainer}>
                {foods.map((food, index) => (
                  <View
                    key={`food-${index}`}
                    style={[
                      styles.foodRow,
                      index === foods.length - 1 && styles.lastFoodRow,
                    ]}
                  >
                    <View style={styles.foodIconContainer}>
                      <MaterialCommunityIcons
                        name={food.icon}
                        size={23}
                        color={COLORS.secondary}
                      />
                    </View>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <View style={styles.foodCalorieBadge}>
                      <Text style={styles.calorieText}>
                        {food.calorie} kcal
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* TOPLAM KALORİ */}
              <View style={styles.totalContainer}>
                <View style={styles.totalLeft}>
                  <View style={styles.totalIconContainer}>
                    <MaterialCommunityIcons
                      name="chart-bar"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.totalLabel}>Toplam Kalori</Text>
                </View>
                <Text style={styles.totalValue}>{totalCalories} kcal</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 22,
    letterSpacing: -0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    gap: 10,
  },
  message: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
  daysContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 6,
    paddingBottom: 8,
    alignItems: "center",
  },
  dayCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    elevation: 1,
  },
  activeDayCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  nextMonthDayCard: {
    backgroundColor: COLORS.nextMonth,
    borderColor: COLORS.nextMonthBorder,
  },
  emptyDaySlot: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
  },
  dayNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.primary,
  },
  dayMonth: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 3,
  },
  activeDayText: {
    color: COLORS.white,
  },
  nextMonthDayText: {
    color: COLORS.nextMonthText,
  },
  menuCard: {
    marginTop: 22,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 10,
  },
  calendarIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  menuDateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },
  foodsContainer: {
    marginHorizontal: 2,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 9,
  },
  lastFoodRow: {
    borderBottomWidth: 0,
  },
  foodIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  foodName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
  },
  foodCalorieBadge: {
    borderRadius: 10,
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  totalContainer: {
    marginTop: 20,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.softBlue,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  totalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 9,
  },
  totalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DEE6F2",
    justifyContent: "center",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },
});

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface FoodMenu {
  id: number;
  menuDate: string;
  food1: string;
  food2: string;
  food3: string;
  food4: string;
  calorie1: number;
  calorie2: number;
  calorie3: number;
  calorie4: number;
}

interface MenuState {
  menus: FoodMenu[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
};

const API_URL = "http://10.90.111.26:5277";

export const fetchRemainingWeekMenus = createAsyncThunk<
  FoodMenu[],
  void,
  { rejectValue: string }
>("menu/fetchRemainingWeekMenus", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/Menu/remaining-week`);
    console.log(response);

    if (!response.ok) {
      return rejectWithValue("Yemek menüleri getirilemedi.");
    }

    return (await response.json()) as FoodMenu[];
  } catch {
    console.error("MENU API HATASI:", Error);

    return rejectWithValue(
      Error instanceof Error ? Error.message : "API bağlantısı kurulamadı.",
    );
  }
});

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRemainingWeekMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRemainingWeekMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchRemainingWeekMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Bir hata oluştu.";
      });
  },
});

export default menuSlice.reducer;

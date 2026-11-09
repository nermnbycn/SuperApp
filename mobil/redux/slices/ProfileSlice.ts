import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

// Android emülatörü için API adresi
const API_URL = "http://10.90.111.26:5277";

// Backend ProfileDTO ile uyumlu
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  birthDate: string | null;
  hireDate: string | null;
  imageUrl: string | null;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Giriş yapan kullanıcının profilini getir
export const fetchMyProfile = createAsyncThunk<
  Profile,
  void,
  { rejectValue: string }
>("profile/fetchMyProfile", async (_, { rejectWithValue }) => {
  try {
    // Login sırasında saklanan JWT
    const token = await SecureStore.getItemAsync("authToken");

    if (!token) {
      return rejectWithValue("Oturum bulunamadı. Lütfen yeniden giriş yapın.");
    }

    const response = await fetch(`${API_URL}/api/Profile/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401) {
      return rejectWithValue("Oturum süresi dolmuş veya geçersiz.");
    }

    if (!response.ok) {
      return rejectWithValue(
        `Profil bilgileri alınamadı (${response.status}).`,
      );
    }

    const data: Profile = await response.json();

    return data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Profil bilgileri getirilirken hata oluştu.",
    );
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,

  reducers: {
    // Çıkış sırasında profil verilerini temizlemek için
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })

      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Profil bilgileri getirilemedi.";
      });
  },
});

export const { clearProfile } = profileSlice.actions;

export default profileSlice.reducer;

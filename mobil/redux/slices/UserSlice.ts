import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string | null;
  hireDate?: string | null;
  imageUrl?: string | null;
  daysUntilBirthday?: number;
  daysUntilAnniversary?: number;
}

interface UserState {
  birthdayUsers: User[];
  anniversaryUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  birthdayUsers: [],
  anniversaryUsers: [],
  loading: false,
  error: null,
};

// Gerçek backend adresinle değiştir
const API_URL = "http://10.90.111.26:5277";

// Bugün doğum günü olan kullanıcılar
export const fetchBirthdayUsers = createAsyncThunk(
  "user/fetchBirthdayUsers",
  async () => {
    const response = await fetch(`${API_URL}/api/User/birthdays/today`);

    if (!response.ok) {
      throw new Error("Doğum günleri getirilemedi.");
    }

    return (await response.json()) as User[];
  },
);

// Bugün iş yıl dönümü olan kullanıcılar
export const fetchAnniversaryUsers = createAsyncThunk(
  "user/fetchAnniversaryUsers",
  async () => {
    const response = await fetch(`${API_URL}/api/User/anniversaries/today`);

    if (!response.ok) {
      throw new Error("İş yıl dönümleri getirilemedi.");
    }

    return (await response.json()) as User[];
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBirthdayUsers.pending, (state) => {
        state.loading = true;
        state.error = "kullanıcılar getirilmedi";
      })
      .addCase(fetchBirthdayUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.birthdayUsers = action.payload;
      })
      .addCase(fetchBirthdayUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Bir hata oluştu.";
      })
      .addCase(fetchAnniversaryUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnniversaryUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.anniversaryUsers = action.payload;
      })
      .addCase(fetchAnniversaryUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Bir hata oluştu.";
      });
  },
});

export default userSlice.reducer;

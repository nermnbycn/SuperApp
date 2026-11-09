import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// API adresi
// Android Emulator için 10.0.2.2 kullanıyoruz.
const API_URL = "http://10.90.111.26:5277";

// Haber modeli
export interface GroupNew {
  id: number;
  createTime: string | null;
  createdBy: string | null;
  updateTime: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deleteTime: string | null;
  deletedBy: string | null;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  hit: number;
}

// Redux state modeli
interface GroupNewState {
  news: GroupNew[];
  loading: boolean;
  error: string | null;
  selectedGroupNew: GroupNew | null;
  detailLoading: boolean;
  detailError: string | null;
}

// Başlangıç değerleri
const initialState: GroupNewState = {
  news: [],
  loading: false,
  error: null,
  selectedGroupNew: null,
  detailLoading: false,
  detailError: null,
};

// API'den haberleri getir
export const fetchGroupNews = createAsyncThunk<
  GroupNew[],
  void,
  { rejectValue: string }
>("groupNew/fetchGroupNews", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/GroupNew`);

    if (!response.ok) {
      return rejectWithValue(`Haberler alınamadı. HTTP: ${response.status}`);
    }

    const data: GroupNew[] = await response.json();

    return data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Haberler yüklenirken bir hata oluştu.",
    );
  }
});

export const fetchGroupNewById = createAsyncThunk<
  GroupNew,
  number,
  { rejectValue: string }
>("groupNews/fetchGroupNewById", async (newsId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/GroupNew/${newsId}`);

    if (!response.ok) {
      return rejectWithValue(
        response.status === 404 ? "Haber bulunamadı." : "Haber getirilemedi.",
      );
    }

    return (await response.json()) as GroupNew;
  } catch {
    return rejectWithValue("Sunucuya bağlanılamadı.");
  }
});

// Slice
const groupNewSlice = createSlice({
  name: "groupNew",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // Haberler yükleniyor
      .addCase(fetchGroupNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Haberler başarıyla yüklendi
      .addCase(fetchGroupNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
        state.error = null;
      })

      // Haberler yüklenemedi
      .addCase(fetchGroupNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Haberler yüklenirken bir hata oluştu.";
      })
      .addCase(fetchGroupNewById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedGroupNew = null;
      })
      .addCase(fetchGroupNewById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedGroupNew = action.payload;
      })
      .addCase(fetchGroupNewById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload ?? "Haber getirilemedi.";
      });
  },
});

export default groupNewSlice.reducer;

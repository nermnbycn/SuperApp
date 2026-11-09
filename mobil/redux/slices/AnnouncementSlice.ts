import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Android Emulator API adresi
const API_URL = "http://10.90.111.26:5277";

// Duyuru modeli
export interface Announcement {
  id: number;
  createTime: string | null;
  createdBy: string | null;
  updateTime: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deleteTime: string | null;
  deletedBy: string | null;
  title: string;
  content: string | null;
  imageUrl: string | null;
  hit: number;
}

// Redux state modeli
interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  selectedAnnouncement: Announcement | null;
  detailLoading: boolean;
  detailError: string | null;
}

// Başlangıç değerleri
const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  error: null,
  selectedAnnouncement: null,
  detailLoading: false,
  detailError: null,
};

// API'den tüm duyuruları getir
export const fetchAnnouncements = createAsyncThunk<
  Announcement[],
  void,
  { rejectValue: string }
>("announcement/fetchAnnouncements", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/Announcement`);

    if (!response.ok) {
      return rejectWithValue(`Duyurular alınamadı. HTTP: ${response.status}`);
    }

    const data: Announcement[] = await response.json();

    return data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Duyurular yüklenirken bir hata oluştu.",
    );
  }
});
export const fetchAnnouncementById = createAsyncThunk<
  Announcement,
  number,
  { rejectValue: string }
>(
  "announcement/fetchAnnouncementById",
  async (announcementId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/Announcement/${announcementId}`,
      );

      if (!response.ok) {
        return rejectWithValue(
          response.status === 404
            ? "Duyuru bulunamadı."
            : "Duyuru getirilemedi.",
        );
      }

      return (await response.json()) as Announcement;
    } catch {
      return rejectWithValue("Bağlantı hatası.");
    }
  },
);

// Slice
const announcementSlice = createSlice({
  name: "announcement",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
        state.error = null;
      })

      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Duyurular yüklenirken bir hata oluştu.";
      })
      .addCase(fetchAnnouncementById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedAnnouncement = null;
      })
      .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedAnnouncement = action.payload;
      })
      .addCase(fetchAnnouncementById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload ?? "Duyuru getirilemedi.";
      });
  },
});

export default announcementSlice.reducer;

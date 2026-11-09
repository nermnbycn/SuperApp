import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  categoryId: number | null;
  authorId: number | null;
  createdAt: string;
  viewCount: number;
}
export interface BlogCategory {
  id: number;
  name: string;
}

interface BlogState {
  blogs: Blog[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  selectedBlog: Blog | null;
  detailLoading: boolean;
  detailError: string | null;
}

const initialState: BlogState = {
  blogs: [],
  categories: [],
  loading: false,
  error: null,
  selectedBlog: null,
  detailLoading: false,
  detailError: null,
};

// Android emülatörü için; backend portunu kontrol et
const API_URL = "http://10.90.111.26:5277";

export const fetchBlogCategories = createAsyncThunk<
  BlogCategory[],
  void,
  { rejectValue: string }
>("blog/fetchBlogCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/Blog/categories`);

    if (!response.ok) {
      return rejectWithValue("Blog kategorileri getirilemedi.");
    }

    return (await response.json()) as BlogCategory[];
  } catch {
    return rejectWithValue("API bağlantısı kurulamadı.");
  }
});

export const fetchBlogs = createAsyncThunk<
  Blog[],
  void,
  { rejectValue: string }
>("blog/fetchBlogs", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/Blog`);

    if (!response.ok) {
      return rejectWithValue("Bloglar getirilemedi.");
    }

    return (await response.json()) as Blog[];
  } catch {
    return rejectWithValue("API bağlantısı kurulamadı.");
  }
});
export const fetchBlogById = createAsyncThunk<
  Blog,
  number,
  { rejectValue: string }
>("blog/fetchBlogById", async (blogId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/Blog/${blogId}`);

    if (!response.ok) {
      return rejectWithValue("Blog getirilemedi.");
    }

    const data: Blog = await response.json();

    return data;
  } catch {
    return rejectWithValue("Bağlantı hatası.");
  }
});

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Bir hata oluştu.";
      })
      .addCase(fetchBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Bir hata oluştu.";
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedBlog = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload ?? "Blog getirilemedi.";
      });
  },
});

export default blogSlice.reducer;

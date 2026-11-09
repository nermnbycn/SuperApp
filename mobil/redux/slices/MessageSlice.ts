import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.90.111.26:5277/api/Message";

export interface CelebrationMessage {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderImageUrl: string | null;
  message: string;
  type: "birthday" | "anniversary";
  createdAt: string;
  isRead: boolean;
  reactionEmoji: string | null;
}

interface MessageState {
  messages: CelebrationMessage[];
  unreadCount: number;
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  unreadCount: 0,
  loading: false,
  sending: false,
  error: null,
};

export interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  message: string;
  type: "birthday" | "anniversary";
}

interface MessageActionRequest {
  messageId: string;
  userId: string;
}

interface ReactionRequest extends MessageActionRequest {
  emoji: string;
}

async function checkResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || `HTTP ${response.status}`);
  }
}

// KULLANICIYA GELEN MESAJLARI GETİR
export const fetchMessages = createAsyncThunk<
  CelebrationMessage[],
  string,
  { rejectValue: string }
>("message/fetchMessages", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${API_URL}?userId=${encodeURIComponent(userId)}`,
    );

    await checkResponse(response);

    return (await response.json()) as CelebrationMessage[];
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Mesajlar alınamadı.",
    );
  }
});

// OKUNMAMIŞ MESAJ SAYISINI GETİR
export const fetchUnreadCount = createAsyncThunk<
  number,
  string,
  { rejectValue: string }
>("message/fetchUnreadCount", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${API_URL}/unread-count?userId=${encodeURIComponent(userId)}`,
    );

    await checkResponse(response);

    const data = (await response.json()) as {
      unreadCount: number;
    };

    return data.unreadCount;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Okunmamış mesaj sayısı alınamadı.",
    );
  }
});

// KUTLAMA MESAJI GÖNDER
export const sendMessage = createAsyncThunk<
  CelebrationMessage,
  SendMessageRequest,
  { rejectValue: string }
>("message/sendMessage", async (data, { rejectWithValue }) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    await checkResponse(response);

    return (await response.json()) as CelebrationMessage;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Mesaj gönderilemedi.",
    );
  }
});
export const checkHasCelebrated = createAsyncThunk<
  boolean,
  { receiverId: string; type: "birthday" | "anniversary" },
  { rejectValue: string }
>(
  "message/checkHasCelebrated",
  async ({ receiverId, type }, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        return rejectWithValue("Oturum bulunamadı.");
      }

      const response = await fetch(
        `${API_URL}/celebrated?receiverId=${encodeURIComponent(receiverId)}&type=${encodeURIComponent(type)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Kutlama durumu alınamadı.");
      }

      const data: { hasCelebrated: boolean } = await response.json();

      return data.hasCelebrated;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Kutlama durumu kontrol edilemedi.",
      );
    }
  },
);
// MESAJI OKUNDU OLARAK İŞARETLE
export const markMessageAsRead = createAsyncThunk<
  string,
  MessageActionRequest,
  { rejectValue: string }
>("message/markAsRead", async (data, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/${data.messageId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.userId,
      }),
    });

    await checkResponse(response);

    return data.messageId;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Mesaj okundu olarak işaretlenemedi.",
    );
  }
});

// MESAJI EMOJİ İLE YANITLA
export const reactToMessage = createAsyncThunk<
  { messageId: string; emoji: string },
  ReactionRequest,
  { rejectValue: string }
>("message/reactToMessage", async (data, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/${data.messageId}/reaction`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.userId,
        emoji: data.emoji,
      }),
    });

    await checkResponse(response);

    return {
      messageId: data.messageId,
      emoji: data.emoji,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Emoji yanıtı gönderilemedi.",
    );
  }
});

const messageSlice = createSlice({
  name: "message",
  initialState,

  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.unreadCount = 0;
      state.loading = false;
      state.sending = false;
      state.error = null;
    },

    clearMessageError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // MESAJLARI GETİR
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;

        state.unreadCount = action.payload.filter(
          (message) => !message.isRead,
        ).length;
      })

      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Mesajlar alınamadı.";
      })

      // OKUNMAMIŞ SAYISI
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload || "Okunmamış mesaj sayısı alınamadı.";
      })

      // MESAJ GÖNDER
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })

      .addCase(sendMessage.fulfilled, (state) => {
        state.sending = false;
      })

      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload || "Mesaj gönderilemedi.";
      })

      // OKUNDU İŞARETLE
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const message = state.messages.find(
          (item) => item.id === action.payload,
        );

        if (message && !message.isRead) {
          message.isRead = true;

          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.error = action.payload || "Mesaj okundu olarak işaretlenemedi.";
      })

      // EMOJİ YANITI
      .addCase(reactToMessage.fulfilled, (state, action) => {
        const message = state.messages.find(
          (item) => item.id === action.payload.messageId,
        );

        if (message) {
          if (!message.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }

          message.reactionEmoji = action.payload.emoji;
          message.isRead = true;
        }
      })

      .addCase(reactToMessage.rejected, (state, action) => {
        state.error = action.payload || "Emoji yanıtı gönderilemedi.";
      });
  },
});

export const { clearMessages, clearMessageError } = messageSlice.actions;

export default messageSlice.reducer;

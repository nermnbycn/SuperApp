import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/UserSlice";
import menuReducer from "./slices/MenuSlice";
import blogReducer from "./slices/BlogSlice";
import profileReducer from "./slices/ProfileSlice";
import groupNewReducer from "./slices/GroupNewSlice";
import announcementReducer from "./slices/AnnouncementSlice";
import messageReducer from "./slices/MessageSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    menu: menuReducer,
    blog: blogReducer,
    profile: profileReducer,
    groupNew: groupNewReducer,
    announcement: announcementReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

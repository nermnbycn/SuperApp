import type { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  Home: undefined;
  Blog: undefined;
  CompanyNew: undefined;
  Announcement: undefined;
  Survey: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MessageTab: undefined;
  SuperAppTab: undefined;
  AnnouncementTab: undefined;
  ProfileTab: undefined;
};

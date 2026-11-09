import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootTabParamList } from "./NavigationType";

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

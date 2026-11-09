import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isTablet: width >= 768,
    isLargeTablet: width >= 1100,
    contentMaxWidth: 1200,
  };
}

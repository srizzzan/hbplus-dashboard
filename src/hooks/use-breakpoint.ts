import { useWindowDimensions } from "react-native";

import { breakpoints } from "@/theme";

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  return {
    isWide: width >= breakpoints.wide,
  };
}

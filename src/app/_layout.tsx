import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import CloudBackdrop, {
  AppAppearanceContext,
  CloudBackdropVisibilityContext,
} from "../components/CloudBackdrop";
import "../../global.css";

export default function App() {
  const [showCloudBackdrop, setShowCloudBackdrop] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const baseTheme = darkMode ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: "transparent",
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <AppAppearanceContext.Provider value={{ darkMode, setDarkMode }}>
        <View style={[styles.root, darkMode ? styles.nightRoot : styles.dayRoot]}>
          <StatusBar style={darkMode ? "light" : "dark"} />
          <CloudBackdropVisibilityContext.Provider value={setShowCloudBackdrop}>
            {showCloudBackdrop ? <CloudBackdrop /> : null}
            <View style={styles.navigator}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
            </View>
          </CloudBackdropVisibilityContext.Provider>
        </View>
      </AppAppearanceContext.Provider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dayRoot: { backgroundColor: "#73D3EA" },
  nightRoot: { backgroundColor: "#101936" },
  navigator: { flex: 1, zIndex: 1 },
});

import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../../global.css";

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#9CAF88" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
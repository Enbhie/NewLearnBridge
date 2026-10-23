import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { useInternetConnectivity } from "../utils/internetConnectivity";

export function useInternetRequirement() {
  return useInternetConnectivity();
}

type Props = {
  visible: boolean;
  onCheckInternet: () => Promise<boolean>;
};

export default function InternetRequiredModal({
  visible,
  onCheckInternet,
}: Props) {
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (visible) setErrorMessage("");
  }, [visible]);

  const checkConnection = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setErrorMessage("");
    try {
      await onCheckInternet();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Could not check the connection: ${error.message}`
          : "Could not check the connection. Please try again."
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => undefined}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.icon}>📶</Text>
          <Text style={styles.title}>Internet connection required</Text>
          <Text style={styles.message}>
            Connect this device to the internet to continue, then check again.
          </Text>
          {errorMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {errorMessage}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isChecking}
            onPress={() => void checkConnection()}
            style={({ pressed }) => [
              styles.button,
              isChecking && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {isChecking ? "CHECKING..." : "CHECK CONNECTION"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23, 59, 83, 0.58)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    borderColor: "#F4C451",
    borderRadius: 22,
    borderWidth: 2,
    padding: 22,
  },
  icon: { fontSize: 44, marginBottom: 8 },
  title: { color: "#173B53", fontSize: 21, fontWeight: "900", textAlign: "center" },
  message: { color: "#36566A", fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: "center" },
  error: { color: "#9C3E32", fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: "center" },
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#258EA3",
    borderRadius: 13,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  disabledButton: { opacity: 0.65 },
  pressed: { opacity: 0.72 },
});


import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { WebView } from "react-native-webview";

const MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/QtkmKSOeT/";

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <div id="status">Loading AI model...</div>

  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.7.4/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script>

  <script>
    const MODEL_URL = "${MODEL_URL}";
    let model = null;

    function sendMessage(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }

    async function start() {
      try {
        model = await tmImage.load(
          MODEL_URL + "model.json",
          MODEL_URL + "metadata.json"
        );

        document.getElementById("status").innerText = "AI model ready";

        sendMessage({ type: "ready" });
      } catch (error) {
        sendMessage({
          type: "error",
          message: error.message || String(error)
        });
      }
    }

    window.receiveImage = async function(dataUrl) {
      if (!model) return;

      try {
        const img = new Image();

        img.onload = async function() {
          try {
            const predictions = await model.predict(img);
            predictions.sort((a, b) => b.probability - a.probability);

            const best = predictions[0];

            sendMessage({
              type: "prediction",
              label: best.className,
              confidence: best.probability
            });
          } catch (error) {
            sendMessage({
              type: "error",
              message: error.message || String(error)
            });
          }
        };

        img.onerror = function() {
          sendMessage({
            type: "error",
            message: "Could not load the captured image."
          });
        };

        img.src = dataUrl;
      } catch (error) {
        sendMessage({
          type: "error",
          message: error.message || String(error)
        });
      }
    };

    start();
  </script>
</body>
</html>
`;

export default function ShapeRecognitionScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const webViewRef = useRef<WebView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState("");
  const [status, setStatus] = useState("Loading AI model...");

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "ready") {
        setModelReady(true);
        setStatus("Ready! Point at a shape and scan.");
      }

      if (data.type === "prediction") {
        setResult(data.label);
        setConfidence(
          (data.confidence * 100).toFixed(1) + "%"
        );
        setStatus("Shape recognized!");
        setScanning(false);
      }

      if (data.type === "error") {
        setStatus("AI error: " + data.message);
        setScanning(false);
      }
    } catch {
      setStatus("Could not read the AI response.");
      setScanning(false);
    }
  };

  const scanShape = async () => {
    if (!cameraRef.current || !cameraReady || !modelReady || scanning) {
      return;
    }

    try {
      setScanning(true);
      setResult("");
      setConfidence("");
      setStatus("Taking picture...");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error("Could not capture the image.");
      }

      setStatus("Analyzing shape...");

      const imageData = "data:image/jpeg;base64," + photo.base64;

      webViewRef.current?.injectJavaScript(
        "window.receiveImage('" + imageData + "'); true;"
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Camera error."
      );
      setScanning(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Checking camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Shape Recognition</Text>
        <Text style={styles.message}>
          LearnBridge needs camera access to recognize shapes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>ALLOW CAMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>GO BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Shape Recognition</Text>
      <Text style={styles.subtitle}>
        Point your camera at a circle, triangle, or square!
      </Text>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.result}>
          {result || "Your shape will appear here"}
        </Text>
        {!!confidence && (
          <Text style={styles.confidence}>
            Confidence: {confidence}
          </Text>
        )}
        <Text style={styles.message}>{status}</Text>
        {(!modelReady || !cameraReady) && (
          <ActivityIndicator color="#6C4CCF" />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (!modelReady || !cameraReady || scanning) && styles.disabledButton,
        ]}
        onPress={scanShape}
        disabled={!modelReady || !cameraReady || scanning}
      >
        <Text style={styles.buttonText}>
          {scanning ? "SCANNING..." : "SCAN SHAPE"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>GO BACK</Text>
      </TouchableOpacity>

      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: MODEL_URL }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        style={styles.hiddenWebView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5B3FA6",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  camera: {
    flex: 1,
  },
  resultBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    alignItems: "center",
  },
  result: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5B3FA6",
    textAlign: "center",
  },
  confidence: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#6C4CCF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  backButton: {
    backgroundColor: "#6C4CCF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});
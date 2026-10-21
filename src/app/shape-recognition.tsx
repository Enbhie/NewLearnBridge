import { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { WebView } from "react-native-webview";
import { AnimatedPressable as TouchableOpacity } from "../components/AnimatedPressable";
import { offlineMissions } from "../data/offlineMissions";
import { markMissionComplete } from "../data/missionProgress";

type ShapeName = "circle" | "square" | "triangle" | "rectangle";

type ShapePrediction = {
  label: string;
  confidence: number;
  runnerUpConfidence: number;
};

type PredictionMessage = (prediction: ShapePrediction | Error) => void;

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/QtkmKSOeT/";
const MIN_CONFIDENCE = 0.65;
const MIN_CONFIDENCE_GAP = 0.12;
const CONFIRMATION_FRAMES = 3;
const REQUIRED_FRAME_VOTES = 2;

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
            const canvas = document.createElement("canvas");
            canvas.width = 224;
            canvas.height = 224;
            const context = canvas.getContext("2d");
            const cropSize = Math.min(img.naturalWidth, img.naturalHeight) * 0.8;
            const cropX = (img.naturalWidth - cropSize) / 2;
            const cropY = (img.naturalHeight - cropSize) / 2;
            context.drawImage(
              img,
              cropX, cropY, cropSize, cropSize,
              0, 0, canvas.width, canvas.height
            );

            const predictions = await model.predict(canvas);
            predictions.sort((a, b) => b.probability - a.probability);
            const best = predictions[0];
            const runnerUp = predictions[1];

            sendMessage({
              type: "prediction",
              label: best ? best.className : "",
              confidence: best ? best.probability : 0,
              runnerUpConfidence: runnerUp ? runnerUp.probability : 0
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

function normalizeShape(label: string): ShapeName | null {
  const normalized = label.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (["circle", "circular", "round"].includes(normalized)) return "circle";
  if (["square", "squared"].includes(normalized)) return "square";
  if (["triangle", "triangular"].includes(normalized)) return "triangle";
  if (["rectangle", "rectangular"].includes(normalized)) return "rectangle";
  return null;
}

function shapeLabel(shape: ShapeName): string {
  return shape.charAt(0).toUpperCase() + shape.slice(1);
}

export default function ShapeRecognitionScreen() {
  const router = useRouter();
  const { missionId: routeMissionId } = useLocalSearchParams<{ missionId?: string }>();
  const missionId = Array.isArray(routeMissionId) ? routeMissionId[0] : routeMissionId;
  const mission = offlineMissions.find(
    (item) => item.id === missionId && item.submission === "shape-scan"
  );
  const requiredShapes: ShapeName[] = mission
    ? mission.id === "K-1"
      ? ["circle", "circle", "circle"]
      : (mission.targetShapes ?? []).filter(
          (shape): shape is ShapeName =>
            shape === "circle" ||
            shape === "square" ||
            shape === "triangle" ||
            shape === "rectangle"
        )
    : [];

  const cameraRef = useRef<CameraView>(null);
  const webViewRef = useRef<WebView>(null);
  const predictionResolverRef = useRef<PredictionMessage | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [collectedShapes, setCollectedShapes] = useState<ShapeName[]>([]);
  const [lastShape, setLastShape] = useState<ShapeName | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [status, setStatus] = useState("Loading AI model...");
  const [errorMessage, setErrorMessage] = useState("");

  const nextTarget = requiredShapes[collectedShapes.length];
  const allShapesCollected =
    requiredShapes.length > 0 && collectedShapes.length === requiredShapes.length;

  const requestPrediction = (dataUrl: string): Promise<ShapePrediction> =>
    new Promise((resolve, reject) => {
      if (!webViewRef.current) {
        reject(new Error("The shape scanner is not ready. Please try again."));
        return;
      }

      const timeout = setTimeout(() => {
        predictionResolverRef.current = null;
        reject(new Error("The shape scanner took too long. Please try again."));
      }, 15000);

      predictionResolverRef.current = (prediction) => {
        clearTimeout(timeout);
        predictionResolverRef.current = null;
        if (prediction instanceof Error) {
          reject(prediction);
        } else {
          resolve(prediction);
        }
      };

      webViewRef.current.injectJavaScript(
        `window.receiveImage(${JSON.stringify(dataUrl)}); true;`
      );
    });

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      if (!message || typeof message !== "object") {
        throw new Error("The scanner returned an invalid response.");
      }
      const data = message as Record<string, unknown>;

      if (data.type === "ready") {
        setModelReady(true);
        setErrorMessage("");
        setStatus("Ready. Center one shape inside the guide.");
        return;
      }

      if (data.type === "prediction") {
        if (
          typeof data.label !== "string" ||
          typeof data.confidence !== "number" ||
          typeof data.runnerUpConfidence !== "number"
        ) {
          throw new Error("The scanner returned an incomplete prediction.");
        }
        predictionResolverRef.current?.({
          label: data.label,
          confidence: data.confidence,
          runnerUpConfidence: data.runnerUpConfidence,
        });
        return;
      }

      if (data.type === "error") {
        const messageText =
          typeof data.message === "string" ? data.message : "The shape scanner could not analyze this image.";
        const error = new Error(messageText);
        if (predictionResolverRef.current) {
          predictionResolverRef.current(error);
        } else {
          setErrorMessage(messageText);
          setStatus("The shape scanner had a problem.");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read the scanner response.";
      if (predictionResolverRef.current) {
        predictionResolverRef.current(new Error(message));
      } else {
        setErrorMessage(message);
        setStatus("The shape scanner had a problem.");
      }
    }
  };

  const saveMissionResult = async (hasCollectedAllShapes = allShapesCollected) => {
    if (!mission || !hasCollectedAllShapes || savingResult) return;
    try {
      setSavingResult(true);
      setErrorMessage("");
      await markMissionComplete(mission.id);
      setCompleted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `All shapes were found, but the result could not be saved: ${error.message}`
          : "All shapes were found, but the result could not be saved. Please try again."
      );
    } finally {
      setSavingResult(false);
    }
  };

  const scanShape = async () => {
    if (!cameraRef.current || !cameraReady || !modelReady || scanning || allShapesCollected) {
      return;
    }

    try {
      setScanning(true);
      setErrorMessage("");
      setLastShape(null);
      setConfidence(null);
      const framePredictions: ShapePrediction[] = [];

      for (let index = 0; index < CONFIRMATION_FRAMES; index += 1) {
        setStatus(`Checking image ${index + 1} of ${CONFIRMATION_FRAMES}...`);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        if (!photo?.base64) {
          throw new Error("Could not capture a clear image. Please try again.");
        }
        const prediction = await requestPrediction(`data:image/jpeg;base64,${photo.base64}`);
        framePredictions.push(prediction);
        if (index < CONFIRMATION_FRAMES - 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      const confirmed = framePredictions
        .map((prediction) => ({
          shape: normalizeShape(prediction.label),
          confidence: prediction.confidence,
          gap: prediction.confidence - prediction.runnerUpConfidence,
        }))
        .filter(
          (prediction): prediction is typeof prediction & { shape: ShapeName } =>
            prediction.shape !== null &&
            prediction.confidence >= MIN_CONFIDENCE &&
            prediction.gap >= MIN_CONFIDENCE_GAP
        );
      const tally = new Map<ShapeName, number>();
      for (const prediction of confirmed) {
        tally.set(prediction.shape, (tally.get(prediction.shape) ?? 0) + 1);
      }
      const consensus = [...tally.entries()].find(
        ([, votes]) => votes >= REQUIRED_FRAME_VOTES
      );

      if (!consensus) {
        setStatus("The shape was unclear. Center it in the guide and scan again.");
        setErrorMessage("Hold the camera steady and show one shape at a time.");
        return;
      }

      const [detectedShape] = consensus;
      const matchingPredictions = confirmed.filter(
        (prediction) => prediction.shape === detectedShape
      );
      const averageConfidence =
        matchingPredictions.reduce((total, prediction) => total + prediction.confidence, 0) /
        matchingPredictions.length;
      setLastShape(detectedShape);
      setConfidence(averageConfidence);

      if (!nextTarget) {
        setStatus(`${shapeLabel(detectedShape)} recognized.`);
        return;
      }

      if (detectedShape !== nextTarget) {
        setStatus(`That is a ${shapeLabel(detectedShape)}. Find a ${shapeLabel(nextTarget)} next.`);
        setErrorMessage("This shape was not added to your mission yet.");
        return;
      }

      const updatedShapes = [...collectedShapes, detectedShape];
      setCollectedShapes(updatedShapes);
      setErrorMessage("");
      if (updatedShapes.length === requiredShapes.length) {
        setStatus("Every target shape is confirmed! Saving your results...");
        await saveMissionResult(true);
      } else {
        const upcomingTarget = requiredShapes[updatedShapes.length];
        setStatus(
          `Great job! ${shapeLabel(detectedShape)} collected. Now find a ${shapeLabel(upcomingTarget)}.`
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not scan the shape. Please try again.";
      setErrorMessage(message);
      setStatus("Scan not counted. Please try again.");
    } finally {
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
        <Text style={styles.title}>Shape Hunt Scanner</Text>
        <Text style={styles.message}>
          LearnBridge needs camera access to recognize the shapes in your mission.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => void requestPermission()}>
          <Text style={styles.buttonText}>ALLOW CAMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.title}>Mission Complete!</Text>
          <Text style={styles.message}>
            You found every shape. Great scanning!
          </Text>
          <View style={styles.shapeList}>
            {requiredShapes.map((shape, index) => (
              <Text style={styles.shapeChip} key={`${shape}-${index}`}>
                ✓ {shapeLabel(shape)}
              </Text>
            ))}
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{mission?.title ?? "Shape Scanner"}</Text>
      <Text style={styles.subtitle}>
        {nextTarget
          ? mission?.id === "K-1"
            ? `Scan 3 different round objects. ${collectedShapes.length + 1} of 3: center a circle in the guide.`
            : `Find and scan a ${shapeLabel(nextTarget)}. Center one shape in the guide.`
          : "Center one shape inside the guide and scan it."}
      </Text>

      {requiredShapes.length > 0 ? (
        <View style={styles.shapeList}>
          {requiredShapes.map((shape, index) => (
            <Text
              key={`${shape}-${index}`}
              style={[
                styles.shapeChip,
                index < collectedShapes.length && styles.shapeChipDone,
                index === collectedShapes.length && styles.shapeChipCurrent,
              ]}
            >
              {index < collectedShapes.length ? "✓ " : ""}
              {shapeLabel(shape)}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />
        <View pointerEvents="none" style={styles.scanGuide}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>Put one shape inside</Text>
        </View>
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.result}>
          {lastShape ? shapeLabel(lastShape) : "Shape not confirmed yet"}
        </Text>
        {confidence !== null ? (
          <Text style={styles.confidence}>
            Confidence: {(confidence * 100).toFixed(0)}%
          </Text>
        ) : null}
        <Text style={styles.message}>{status}</Text>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        {(!modelReady || !cameraReady) && (
          <ActivityIndicator color="#258EA3" style={styles.loading} />
        )}
      </View>

      {allShapesCollected ? (
        <TouchableOpacity
          style={[styles.button, savingResult && styles.disabledButton]}
          onPress={() => void saveMissionResult()}
          disabled={savingResult}
        >
          <Text style={styles.buttonText}>
            {savingResult ? "SAVING RESULTS..." : "SAVE RESULTS"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            (!modelReady || !cameraReady || scanning) && styles.disabledButton,
          ]}
          onPress={() => void scanShape()}
          disabled={!modelReady || !cameraReady || scanning}
        >
          <Text style={styles.buttonText}>
            {scanning
              ? "CHECKING..."
              : nextTarget
                ? `SCAN ${shapeLabel(nextTarget).toUpperCase()}`
                : "SCAN SHAPE"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={scanning || savingResult}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: MODEL_URL }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onError={(event) => {
          setModelReady(false);
          setErrorMessage(
            event.nativeEvent.description || "Could not load the shape scanner."
          );
          setStatus("Scanner connection failed. Check your internet and try again.");
        }}
        onHttpError={(event) => {
          setModelReady(false);
          setErrorMessage(`The shape scanner could not load (HTTP ${event.nativeEvent.statusCode}).`);
          setStatus("Scanner connection failed. Check your internet and try again.");
        }}
        style={styles.hiddenWebView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    color: "#173B53",
    marginTop: 8,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: "#36566A",
    textAlign: "center",
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 1,
    minHeight: 180,
    width: "100%",
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#173B53",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scanGuide: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  guideFrame: {
    width: "72%",
    aspectRatio: 1,
    borderColor: "#FFFFFF",
    borderWidth: 3,
    borderStyle: "dashed",
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  guideText: {
    position: "absolute",
    bottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    overflow: "hidden",
    color: "#FFFFFF",
    backgroundColor: "rgba(23,59,83,0.75)",
    fontWeight: "800",
  },
  shapeList: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 7,
    marginBottom: 10,
  },
  shapeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
    color: "#36566A",
    backgroundColor: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  shapeChipDone: {
    color: "#28543A",
    backgroundColor: "#D5F5EB",
  },
  shapeChipCurrent: {
    color: "#173B53",
    backgroundColor: "#FFE9A0",
  },
  resultBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  result: {
    fontSize: 20,
    fontWeight: "900",
    color: "#173B53",
    textAlign: "center",
  },
  confidence: {
    fontSize: 14,
    color: "#36566A",
    marginTop: 4,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#36566A",
    textAlign: "center",
    marginTop: 6,
  },
  errorMessage: {
    color: "#9C3E32",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  loading: {
    marginTop: 8,
  },
  button: {
    width: "100%",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#258EA3",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  backButton: {
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C62828",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },
  successCard: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});

import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { get, ref, update } from "firebase/database";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, realtimeDatabase } from "../firebase";

type ReviewRecord = {
  missionId: string;
  missionTitle: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
};

export default function MissionReviewScreen() {
  const { uid, submissionId, missionTitle } = useLocalSearchParams<{
    uid?: string;
    submissionId?: string;
    missionTitle?: string;
  }>();
  const [email, setEmail] = useState("");
  const [emailLinkUrl, setEmailLinkUrl] = useState("");
  const [isEmailLink, setIsEmailLink] = useState(false);
  const [hasAuthenticatedEmailLink, setHasAuthenticatedEmailLink] = useState(false);
  const [review, setReview] = useState<ReviewRecord | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const currentUrl = window.location.href;
    setEmailLinkUrl(currentUrl);
    setIsEmailLink(Boolean(auth && isSignInWithEmailLink(auth, currentUrl)));
  }, []);

  const signInAndLoadReview = async () => {
    if (!auth || !realtimeDatabase) {
      setErrorMessage("Firebase is not configured for parent review.");
      return;
    }
    if (!isEmailLink || !emailLinkUrl) {
      setErrorMessage("Open the latest review link from your email to continue.");
      return;
    }
    if (!uid || !submissionId) {
      setErrorMessage("This review link is missing its submission details. Ask your child to resend it.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Enter the parent email address that received this link.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const signedInUser =
        hasAuthenticatedEmailLink && auth.currentUser?.uid === uid
          ? auth.currentUser
          : (await signInWithEmailLink(auth, email.trim(), emailLinkUrl)).user;
      if (signedInUser.uid !== uid) {
        throw new Error("This email account does not own the linked mission submission.");
      }
      setHasAuthenticatedEmailLink(true);

      const submissionRef = ref(
        realtimeDatabase,
        `submissions/${uid}/${submissionId}`
      );
      const snapshot = await get(submissionRef);
      if (!snapshot.exists()) {
        throw new Error("The mission submission could not be found.");
      }

      const data = snapshot.val() as Partial<ReviewRecord>;
      if (
        typeof data.missionId !== "string" ||
        (data.missionTitle !== undefined &&
          (typeof data.missionTitle !== "string" ||
            data.missionTitle.length === 0 ||
            data.missionTitle.length > 120)) ||
        typeof data.imageUrl !== "string" ||
        !/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(data.imageUrl) ||
        (data.status !== "pending" &&
          data.status !== "approved" &&
          data.status !== "rejected")
      ) {
        throw new Error("The mission submission has incomplete or invalid review details.");
      }
      setReview({
        missionId: data.missionId,
        missionTitle: data.missionTitle ?? `Mission ${data.missionId}`,
        imageUrl: data.imageUrl,
        status: data.status,
      });
      setIsReviewModalVisible(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not open the mission review."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const decideMission = async (status: "approved" | "rejected") => {
    if (!auth?.currentUser || !realtimeDatabase || !uid || !submissionId || !review) {
      setErrorMessage("Sign in again before updating this mission review.");
      return;
    }
    if (auth.currentUser.uid !== uid) {
      setErrorMessage("This signed-in account does not own the mission submission.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      await update(
        ref(realtimeDatabase, `submissions/${uid}/${submissionId}`),
        { status }
      );
      setReview({ ...review, status });
      setIsReviewModalVisible(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Could not update the mission review: ${error.message}`
          : "Could not update the mission review. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>LEARNBRIDGE · PARENT REVIEW</Text>
        <Text style={styles.title}>A little progress worth celebrating</Text>
        <Text style={styles.description}>
          Sign in with the parent email that received this one-time link to securely view the
          mission photo.
        </Text>
        {typeof missionTitle === "string" && missionTitle.trim() ? (
          <Text style={styles.missionLabel}>
            This review link is for: {missionTitle}
          </Text>
        ) : null}

        {review ? (
          <View style={styles.card}>
            <Text style={styles.missionLabel}>
              {review.missionTitle} · {review.missionId}
            </Text>
            <Text style={styles.status}>
              {review.status === "approved"
                ? "Confirmed — the learner can collect their badge."
                : review.status === "rejected"
                  ? "A new photo has been requested. The learner can resubmit this mission."
                  : "Ready for your review."}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsReviewModalVisible(true)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>VIEW MISSION PHOTO</Text>
            </Pressable>
            {review.status === "pending" ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  disabled={isLoading}
                  onPress={() => void decideMission("approved")}
                  style={[styles.primaryButton, styles.reviewDecisionButton, isLoading && styles.disabledButton]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>CONFIRM AND AWARD BADGE</Text>
                  )}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reject this photo and request another"
                  disabled={isLoading}
                  onPress={() => void decideMission("rejected")}
                  style={[styles.rejectButton, styles.reviewDecisionButton, isLoading && styles.disabledButton]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>REJECT AND REQUEST ANOTHER PHOTO</Text>
                  )}
                </Pressable>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify your email</Text>
            <TextInput
              accessibilityLabel="Parent email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Parent email address"
              placeholderTextColor="#718096"
              style={styles.input}
              value={email}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={() => void signInAndLoadReview()}
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>CONTINUE SECURELY</Text>
              )}
            </Pressable>
          </View>
        )}

        {errorMessage ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}
        <Text style={styles.privacyNote}>
          The photo is loaded only after your email link is verified. Cloudinary image links are
          publicly accessible to anyone who already has the exact image URL.
        </Text>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsReviewModalVisible(false)}
        transparent
        visible={isReviewModalVisible && review !== null}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Review the mission</Text>
              <Text style={styles.missionLabel}>
                {review?.missionTitle} · {review?.missionId}
              </Text>
              {review ? (
                <Image
                  accessibilityLabel={`Photo for mission ${review.missionId}`}
                  resizeMode="contain"
                  source={{ uri: review.imageUrl }}
                  style={styles.photo}
                />
              ) : null}
              <Text style={styles.modalMessage}>
                Check the photo with your child. Confirm to award the badge, or request another
                photo if the work needs to be shown more clearly.
              </Text>
              {errorMessage ? (
                <Text accessibilityLiveRegion="polite" style={styles.error}>
                  {errorMessage}
                </Text>
              ) : null}
              {review?.status === "pending" ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isLoading}
                    onPress={() => void decideMission("approved")}
                    style={[styles.primaryButton, isLoading && styles.disabledButton]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>CONFIRM AND AWARD BADGE</Text>
                    )}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Reject this photo and request another"
                    disabled={isLoading}
                    onPress={() => void decideMission("rejected")}
                    style={[styles.rejectButton, isLoading && styles.disabledButton]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>REQUEST ANOTHER PHOTO</Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <Text style={styles.status}>This mission has already been reviewed.</Text>
              )}
              <Pressable
                accessibilityRole="button"
                disabled={isLoading}
                onPress={() => setIsReviewModalVisible(false)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>CLOSE</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#EAF7F6",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  eyebrow: {
    color: "#258EA3",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: "center",
  },
  title: {
    color: "#17324D",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: "#526579",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D4E8E8",
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: "#17324D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cardTitle: {
    color: "#17324D",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  reviewDecisionButton: {
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F4F8FB",
    borderColor: "#CFDDE8",
    borderRadius: 12,
    borderWidth: 1,
    color: "#17324D",
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#258EA3",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  rejectButton: {
    alignItems: "center",
    backgroundColor: "#B94A48",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 44,
  },
  secondaryButtonText: {
    color: "#526579",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  missionLabel: {
    color: "#258EA3",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  status: {
    color: "#526579",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  error: {
    color: "#B42318",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    textAlign: "center",
  },
  privacyNote: {
    color: "#687B8C",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
    textAlign: "center",
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(18, 36, 52, 0.68)",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    maxWidth: 560,
    maxHeight: "100%",
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    color: "#17324D",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  photo: {
    alignSelf: "center",
    backgroundColor: "#F4F8FB",
    borderRadius: 14,
    height: 300,
    marginBottom: 14,
    width: "100%",
  },
  modalMessage: {
    color: "#526579",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
});

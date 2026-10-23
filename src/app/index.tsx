import AsyncStorage from "@react-native-async-storage/async-storage";
import { isRunningInExpoGo } from "expo";
import * as Network from "expo-network";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import {
    EmailAuthProvider,
    createUserWithEmailAndPassword,
    deleteUser,
    onAuthStateChanged,
    reauthenticateWithCredential,
    reload,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import GradeOneLessonsScreen, { gradeOneLessonCount } from "../components/GradeOneLessonsScreen";
import {
    Animated,
    ActivityIndicator,
    Alert,
    AppState,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountSettingsScreen, {
    type AccountPreferences,
    type LearnerProfile,
} from "../components/AccountSettingsScreen";
import {
    AppAppearanceContext,
    CloudBackdropVisibilityContext,
} from "../components/CloudBackdrop";
import { AnimatedPressable as Pressable } from "../components/AnimatedPressable";
import CharacterSelectScreen from "../components/CharacterSelectScreen";
import InternetRequiredModal, {
  useInternetRequirement,
} from "../components/InternetRequiredModal";
import LessonCompleteScreen from "../components/LessonCompleteScreen";
import KindergartenLessonsScreen, {
  kindergartenLessonCount,
} from "../components/KindergartenLessonsScreen";
import GradeTwoLessonsScreen, {
  gradeTwoLessonCount,
} from "../components/GradeTwoLessonsScreen";
import LessonScreen from "../components/LessonScreen";
import QuizScreen from "../components/QuizScreen";
import ResultsScreen from "../components/ResultsScreen";
import { getCompletedMissions, markMissionComplete } from "../data/missionProgress";
import {
  deleteMissionSubmissionsForUser,
  getMissionSubmissions,
  saveMissionPhotoSubmission,
  syncMissionSubmissions,
  type OfflineMissionSubmission,
} from "../data/offlineMissionSubmissionQueue";
import {
  listenToMissionReview,
  submitMissionPhotoForReview,
  type MissionReview,
} from "../data/missionSubmissions";
import {
  getMissionsForGrade,
  gradeLabels,
  type Grade,
  type OfflineMission,
} from "../data/offlineMissions";
import {
  categoryMeta,
  lessonContent,
  type CategoryId,
} from "../data/learningContent";
import { auth, firebaseConfigured, firestore } from "../firebase";
import {
  setBackgroundMusic,
  type BackgroundMusicTrack,
} from "../utils/backgroundMusic";

let notificationsModulePromise:
  | Promise<typeof import("expo-notifications") | null>
  | null = null;

function getNotificationsModule() {
  if (Platform.OS === "web" || isRunningInExpoGo()) return Promise.resolve(null);
  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications")
      .then((Notifications) => {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        return Notifications;
      })
      .catch((error: unknown) => {
        notificationsModulePromise = null;
        throw error;
      });
  }
  return notificationsModulePromise;
}

type Screen =
  | "home"
  | "login"
  | "forgot-password"
  | "signup"
  | "verify-email"
  | "grade-selection"
  | "menu"
  | "profile"
  | "settings"
  | "missions"
  | "kinder-lessons"
  | "grade2-lessons"
  | "grade1-lessons"
  | "tutorial"
  | "character-select"
  | "lesson"
  | "quiz"
  | "lesson-complete"
  | "results";

function getCategoryMusicTrack(category: CategoryId): BackgroundMusicTrack {
  if (category === "math") return "math-lesson";
  if (category === "reading") return "reading-lesson";
  return "science-lesson";
}

function getBackgroundMusicTrack(
  screen: Screen,
  category: CategoryId,
  curriculumCategory: CategoryId | null
): BackgroundMusicTrack | null {
  if (screen === "home") return "home";
  if (["login", "signup", "forgot-password", "verify-email"].includes(screen)) {
    return "login";
  }
  if (["kinder-lessons", "grade1-lessons", "grade2-lessons"].includes(screen) && curriculumCategory) {
    return getCategoryMusicTrack(curriculumCategory);
  }
  if (["lesson", "quiz", "results", "lesson-complete"].includes(screen)) {
    return getCategoryMusicTrack(category);
  }
  if (
    [
      "menu",
      "missions",
      "kinder-lessons",
      "grade1-lessons",
      "grade2-lessons",
      "character-select",
      "settings",
    ].includes(screen)
  ) {
    return "lesson-board";
  }
  return null;
}

type Mission = {
  id: string;
  title: string;
  skill: string;
  description: string;
};

function requiresParentEmailReview(mission: OfflineMission): boolean {
  return mission.submission === "photo";
  return mission.grade === "2" || ["K-3", "K-4", "K-5"].includes(mission.id);
}

const missions: Mission[] = [
  {
    id: "M1",
    title: "Mission 1: Jeepney Counting",
    skill: "Number Sense + Addition & Subtraction",
    description:
      "Imagine a jeepney has 10 passengers. At the next stop, 3 passengers get off and 2 get on. How many passengers are on the jeepney now?",
  },
  {
    id: "M2",
    title: "Mission 2: Merienda Sharing",
    skill: "Fractions",
    description:
      "Your family has 1 bibingka and cuts it into 4 equal pieces. You eat 1 piece. What fraction of the bibingka did you eat?",
  },
  {
    id: "M3",
    title: "Mission 3: Merienda Addition",
    skill: "Addition + Number Sense",
    description:
      "Your family prepares 6 pandesal in the morning and buys 8 more from the bakery. How many pandesal do you have altogether?",
  },
  {
    id: "M4",
    title: "Mission 4: Tindahan Subtraction",
    skill: "Subtraction",
    description:
      "You have ₱50 and buy a snack for ₱18 at a sari-sari store. How much money do you have left?",
  },
];

const KID_ICONS = ["🦉", "🦁", "🐰", "🐼", "🦊", "🐯"];
const PROFILE_STORAGE_PREFIX = "learnbridge.profile.";
const SETTINGS_STORAGE_PREFIX = "learnbridge.settings.";
const SCREEN_TIME_STORAGE_PREFIX = "learnbridge.screenTime.";
const LESSON_PROGRESS_STORAGE_PREFIX = "learnbridge.lessonProgress.";
const EYE_BREAK_INTERVAL_SECONDS = 15 * 60;
const EYE_BREAK_DURATION_SECONDS = 5 * 60;
const DEFAULT_PREFERENCES: AccountPreferences = {
  difficulty: "standard",
  notificationsEnabled: false,
  offlineMode: false,
  privacyMode: false,
  darkMode: false,
  screenTimeLimitMinutes: 0,
};

type DailyScreenTimeSnapshot = {
  date: string;
  usedSeconds: number;
  focusSeconds: number;
  breakSeconds: number;
};

type DailyScreenTimePersistence = {
  storageKey: string;
  writeQueue: Promise<void>;
  persist: (() => Promise<void>) | null;
};

type StoredLearnerProfiles = {
  version: 2;
  profiles: LearnerProfile[];
  activeProfileId: string | null;
};

function getLocalDateStamp(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

type SignUpField = "name" | "birthdate" | "email" | "password" | "confirmPassword";

function getAgeFromBirthdate(birthdate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age -= 1;
  }
  return age;
}

function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "That email already has a LearnBridge account.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed": "Check your internet connection and try again.",
    "auth/requires-recent-login": "Verify the parent account password and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
  };

  if (code && messages[code]) return messages[code];
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function requireFirebaseAuth() {
  if (!auth) {
    throw new Error(
      "Firebase is not configured in this APK. Add the EXPO_PUBLIC_FIREBASE variables to the matching EAS environment, then build a new APK."
    );
  }
  return auth;
}

function getLessonProgressStorageKey(userId: string, profileId: string): string {
  return `${LESSON_PROGRESS_STORAGE_PREFIX}${userId}.${profileId}`;
}

function isLearnerProfile(value: unknown): value is LearnerProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as {
    id?: unknown;
    childName?: unknown;
    childBirthdate?: unknown;
    selectedIcon?: unknown;
    grade?: unknown;
  };
  return (
    typeof profile.id === "string" &&
    typeof profile.childName === "string" &&
    typeof profile.childBirthdate === "string" &&
    typeof profile.selectedIcon === "string" &&
    (profile.grade === undefined ||
      (typeof profile.grade === "string" &&
        Object.prototype.hasOwnProperty.call(gradeLabels, profile.grade)))
  );
}

function parseStoredLearnerProfiles(value: unknown, userId: string): StoredLearnerProfiles {
  if (!value || typeof value !== "object") {
    throw new Error("Saved child profiles have an invalid format.");
  }

  const stored = value as Record<string, unknown>;
  let profiles: LearnerProfile[];
  if (Array.isArray(stored.profiles)) {
    if (!stored.profiles.every(isLearnerProfile)) {
      throw new Error("Saved child profiles have an invalid format.");
    }
    profiles = stored.profiles;
  } else if (typeof stored.childName === "string") {
    profiles = [{
      id: `legacy-${userId}`,
      childName: stored.childName,
      childBirthdate: typeof stored.childBirthdate === "string" ? stored.childBirthdate : "",
      selectedIcon: typeof stored.selectedIcon === "string" ? stored.selectedIcon : KID_ICONS[0],
    }];
  } else {
    profiles = [];
  }

  const activeProfileId =
    typeof stored.activeProfileId === "string" &&
    profiles.some((profile) => profile.id === stored.activeProfileId)
      ? stored.activeProfileId
      : profiles[0]?.id ?? null;

  return { version: 2, profiles, activeProfileId };
}

// --- HELPER COMPONENTS (OUTSIDE APP) ---

function ActionButton({
  children,
  onPress,
  variant = "primary",
}: {
  children: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}) {
  const { darkMode } = useContext(AppAppearanceContext);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === "secondary" && styles.secondaryButton,
        darkMode && (variant === "secondary" ? styles.actionButtonSecondaryDark : styles.actionButtonPrimaryDark),
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          variant === "secondary" && styles.secondaryButtonText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function FriendlyMascotBanner({ message }: { message: string }) {
  return (
    <View style={styles.authMascotBanner}>
      <View style={styles.authMascotArt}>
        <Text style={styles.authMascotOwl}>🦉</Text>
        <Text style={styles.authMascotStar}>⭐</Text>
      </View>
      <View style={styles.authMascotCopy}>
        <Text style={styles.authMascotTitle}>Learning adventure</Text>
        <Text style={styles.authMascotMessage}>{message}</Text>
      </View>
    </View>
  );
}

function NavButton({
  label,
  active,
  darkMode,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
  darkMode: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        darkMode && styles.navButtonDark,
        active && (darkMode ? styles.navButtonActiveDark : styles.navButtonActive),
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.navButtonText,
          darkMode && styles.navButtonTextDark,
          active && (darkMode ? styles.navButtonTextActiveDark : styles.navButtonTextActive),
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BottomNavigation({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const router = useRouter();
  const { darkMode } = useContext(AppAppearanceContext);

  return (
    <View style={[styles.bottomNavigation, darkMode && styles.bottomNavigationDark]}>
      <NavButton label="▣" active={screen === "missions"} darkMode={darkMode} onPress={() => setScreen("missions")} />
      <NavButton label="♧" active={screen === "menu"} darkMode={darkMode} onPress={() => setScreen("menu")} />
      <Pressable
        accessibilityLabel="Open camera shape scanner"
        accessibilityRole="button"
        onPress={() => router.push("/shape-recognition")}
        style={({ pressed }) => [
          styles.addButton,
          darkMode && styles.addButtonDark,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </Pressable>
      <NavButton
        label="⚙"
        accessibilityLabel="LearnBridge tutorial"
        active={screen === "tutorial"}
        darkMode={darkMode}
        onPress={() => setScreen("tutorial")}
      />
      <NavButton
        label="♙"
        accessibilityLabel="Profile"
        active={screen === "profile"}
        darkMode={darkMode}
        onPress={() => setScreen("profile")}
      />
    </View>
  );
}

// --- SCREEN COMPONENTS (OUTSIDE APP) ---


function HomeScreen({
  onPlay,
  setScreen,
}: {
  onPlay: () => void;
  setScreen: (s: Screen) => void;
}) {
  return (
    <SafeAreaView style={styles.homePage}>
      <View
        style={[styles.homeCard, styles.homeCardDay]}
      >
        <Image
          source={require("../../assets/images/main-logo.png")}
          style={styles.homeLogo}
          resizeMode="contain"
          accessibilityLabel="LearnBridge owl logo"
        />

        <Text style={styles.homeTitle}>LearnBridge</Text>
        <Text style={styles.homeSubtitle}>
          Little learners. Big discoveries.
        </Text>

        <View style={styles.homeActions}>
          <ActionButton onPress={onPlay}>LET'S PLAY!</ActionButton>

          <ActionButton onPress={() => setScreen("login")} variant="secondary">
            GROWN-UPS: SIGN IN
          </ActionButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  setScreen,
  onSubmit,
}: {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  setScreen: (s: Screen) => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOffline, checkInternet } = useInternetRequirement();

  const handleLogin = async () => {
    if (isOffline) return;
    const nextEmailError = !email.trim()
      ? "Enter your email address."
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? ""
        : "Enter a valid email address.";
    const nextPasswordError = password ? "" : "Enter your password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");

    if (nextEmailError || nextPasswordError) {
      return;
    }

    try {
      if (!(await checkInternet())) return;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `Could not check your internet connection: ${error.message}`
          : "Could not check your internet connection. Please try again."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.loginContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.loginInner}>
          <View style={styles.loginHeader}>
            <FriendlyMascotBanner message="Your next discovery is waiting." />
            <Text style={styles.pageTitle}>Welcome Back</Text>
            <Text style={styles.pageSubtitle}>Sign in to continue to LearnBridge</Text>
          </View>

          <View style={styles.formContainer}>
            {formError ? <Text style={styles.formMessage}>{formError}</Text> : null}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Parent / Guardian Email</Text>
              <TextInput
                style={[styles.textInput, emailError && styles.errorInput]}
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                value={email ?? ""}
                onChangeText={(val) => {
                  setEmail(val);
                  if (emailError) setEmailError("");
                  if (formError) setFormError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[styles.textInput, passwordError && styles.errorInput]}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                value={password ?? ""}
                onChangeText={(val) => {
                  setPassword(val);
                  if (passwordError) setPasswordError("");
                  if (formError) setFormError("");
                }}
                secureTextEntry
              />
              {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setScreen("forgot-password")}
              style={styles.forgotPasswordRow}
            >
              <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
            </Pressable>

            <Pressable
              style={styles.submitButton}
              onPress={() => void handleLogin()}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => setScreen("signup")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              style={[styles.backButton, { marginTop: 12 }]}
              onPress={() => setScreen("home")}
            >
              <Text style={styles.submitButtonText}>Back</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <InternetRequiredModal
        visible={isOffline}
        onCheckInternet={checkInternet}
      />
    </KeyboardAvoidingView>
  );
}

function ForgotPasswordScreen({
  email,
  setEmail,
  setScreen,
  onSubmit,
}: {
  email: string;
  setEmail: (value: string) => void;
  setScreen: (screen: Screen) => void;
  onSubmit: (email: string) => Promise<void>;
}) {
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      setFormError("");
      setStatusMessage("");
      return;
    }

    setEmailError("");
    setFormError("");
    setStatusMessage("");
    setIsSending(true);
    try {
      await onSubmit(normalizedEmail);
      setStatusMessage(
        "If an account exists for this email, a password reset link has been sent. Open the link to verify your email and choose a new password."
      );
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/user-disabled") {
        setStatusMessage(
          "If an account exists for this email, a password reset link has been sent. Open the link to verify your email and choose a new password."
        );
      } else {
        setFormError(getAuthErrorMessage(error));
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.loginContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.loginInner}>
          <View style={styles.loginHeader}>
            <FriendlyMascotBanner message="Find a new math pal and let's play." />
            <Text style={styles.pageTitle}>Reset Password</Text>
            <Text style={styles.pageSubtitle}>
              We'll email a secure link to verify your email and let you choose a new password.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {formError ? <Text style={styles.formMessage}>{formError}</Text> : null}
            {statusMessage ? <Text style={styles.successMessage}>{statusMessage}</Text> : null}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Email</Text>
              <TextInput
                style={[styles.textInput, emailError && styles.errorInput]}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email ?? ""}
                onChangeText={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            <Pressable
              style={[styles.submitButton, isSending && styles.disabledButton]}
              onPress={() => void handleSend()}
              disabled={isSending}
            >
              <Text style={styles.submitButtonText}>
                {isSending ? "Sending..." : "Send Reset Link"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setScreen("login")}
              style={styles.backToSignIn}
            >
              <Text style={styles.submitButtonText}>Back</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SignUpScreen({
  childName,
  setChildName,
  childBirthdate,
  setChildBirthdate,
  parentEmail,
  setParentEmail,
  signUpPassword,
  setSignUpPassword,
  selectedIcon,
  setSelectedIcon,
  setScreen,
  onRegister,
}: {
  childName: string;
  setChildName: (v: string) => void;
  childBirthdate: string;
  setChildBirthdate: (v: string) => void;
  parentEmail: string;
  setParentEmail: (v: string) => void;
  signUpPassword: string;
  setSignUpPassword: (v: string) => void;
  selectedIcon: string;
  setSelectedIcon: (v: string) => void;
  setScreen: (s: Screen) => void;
  onRegister: (
    profile: LearnerProfile,
    email: string,
    password: string
  ) => Promise<void>;
}) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [initialYear = "", initialMonth = "", initialDay = ""] = childBirthdate.split("-");
  const [birthdateMonth, setBirthdateMonth] = useState(initialMonth);
  const [birthdateDay, setBirthdateDay] = useState(initialDay);
  const [birthdateYear, setBirthdateYear] = useState(initialYear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const { isOffline, checkInternet } = useInternetRequirement();
  const [fieldErrors, setFieldErrors] = useState<Record<SignUpField, string>>({
    name: "",
    birthdate: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const clearFieldError = (field: SignUpField) => {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateBirthdatePart = (part: "month" | "day" | "year", value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    const nextParts = {
      month: part === "month" ? digits : birthdateMonth,
      day: part === "day" ? digits : birthdateDay,
      year: part === "year" ? digits : birthdateYear,
    };

    setBirthdateMonth(nextParts.month);
    setBirthdateDay(nextParts.day);
    setBirthdateYear(nextParts.year);
    setChildBirthdate(
      nextParts.month.length === 2 && nextParts.day.length === 2 && nextParts.year.length === 4
        ? `${nextParts.year}-${nextParts.month}-${nextParts.day}`
        : ""
    );
    if (fieldErrors.birthdate) clearFieldError("birthdate");
  };

  const handleRegister = async () => {
    if (isOffline) return;
    const childAge = getAgeFromBirthdate(childBirthdate.trim());
    const errors: Record<SignUpField, string> = {
      name: childName.trim() ? "" : "Enter the child's name.",
      birthdate: childAge !== null && childAge >= 2 && childAge <= 10
        ? ""
        : "Enter a valid birthdate for a child aged 2 to 10.",
      email: "",
      password: "",
      confirmPassword: "",
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail.trim())) {
      errors.email = "Enter a valid email address, such as name@example.com.";
    }

    const passwordRequirements = [
      signUpPassword.length < 6 && "Use at least 6 characters.",
      !/[A-Z]/.test(signUpPassword) && "Add at least 1 uppercase letter.",
      !/[0-9]/.test(signUpPassword) && "Add at least 1 number.",
    ].filter(Boolean);
    errors.password = passwordRequirements.join(" ");

    if (!confirmPassword) {
      errors.confirmPassword = "Re-enter your password to confirm it.";
    } else if (signUpPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match. Enter the same password.";
    }

    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setFormMessage("");
      return;
    }

    setFormMessage("");
    try {
      if (!(await checkInternet())) return;
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? `Could not check your internet connection: ${error.message}`
          : "Could not check your internet connection. Please try again."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister(
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          childName: childName.trim(),
          childBirthdate: childBirthdate.trim(),
          selectedIcon,
        },
        parentEmail.trim(),
        signUpPassword
      );
    } catch (error) {
      if (firebaseConfigured) {
        const code = (error as { code?: string })?.code;
        const field: SignUpField | null =
          code === "auth/email-already-in-use" ||
          code === "auth/invalid-email" ||
          code === "auth/user-disabled"
            ? "email"
            : code === "auth/weak-password"
              ? "password"
              : null;
        const message = getAuthErrorMessage(error);
        if (field) {
          setFieldErrors((current) => ({ ...current, [field]: message }));
          setFormMessage("");
        } else {
          setFormMessage(message);
        }
      } else {
        setFormMessage(
          "Firebase is not configured in this APK. Add the EXPO_PUBLIC_FIREBASE variables to the matching EAS environment, then build a new APK."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.loginContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.loginInner}>
          <View style={styles.loginHeader}>
            <FriendlyMascotBanner message="Make room for a whole lot of discovery." />
            <Text style={styles.pageTitle}>Create Account</Text>
            <Text style={styles.pageSubtitle}>Join LearnBridge for fun K-3 math!</Text>
          </View>

          <View style={styles.formContainer}>
            {!firebaseConfigured && (
              <Text style={styles.formMessage}>
                Firebase is not connected in this build. Add the Firebase EXPO_PUBLIC variables to the EAS build environment and create a new APK.
              </Text>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Your Cute Icon!</Text>
              <View style={styles.iconPickerRow}>
                {KID_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.selectedIconOption,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconOptionText}>{icon}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Child's Name</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.name && styles.errorInput]}
                placeholder="e.g., Bea"
                placeholderTextColor="#9CA3AF"
                value={childName ?? ""}
                onChangeText={(val) => {
                  setChildName(val);
                  if (fieldErrors.name) clearFieldError("name");
                }}
              />
              {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Child's Birthdate</Text>
              <View style={styles.birthdateRow}>
                <View style={styles.birthdatePart}>
                  <Text style={styles.birthdatePartLabel}>Month</Text>
                  <TextInput
                    accessibilityLabel="Birthdate month"
                    style={[styles.textInput, styles.birthdateInput, fieldErrors.birthdate && styles.errorInput]}
                    placeholder="MM"
                    placeholderTextColor="#9CA3AF"
                    value={birthdateMonth ?? ""}
                    onChangeText={(value) => updateBirthdatePart("month", value)}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={styles.birthdatePart}>
                  <Text style={styles.birthdatePartLabel}>Day</Text>
                  <TextInput
                    accessibilityLabel="Birthdate day"
                    style={[styles.textInput, styles.birthdateInput, fieldErrors.birthdate && styles.errorInput]}
                    placeholder="DD"
                    placeholderTextColor="#9CA3AF"
                    value={birthdateDay ?? ""}
                    onChangeText={(value) => updateBirthdatePart("day", value)}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={styles.birthdatePart}>
                  <Text style={styles.birthdatePartLabel}>Year</Text>
                  <TextInput
                    accessibilityLabel="Birthdate year"
                    style={[styles.textInput, styles.birthdateInput, fieldErrors.birthdate && styles.errorInput]}
                    placeholder="YYYY"
                    placeholderTextColor="#9CA3AF"
                    value={birthdateYear ?? ""}
                    onChangeText={(value) => updateBirthdatePart("year", value)}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
              {fieldErrors.birthdate ? <Text style={styles.fieldError}>{fieldErrors.birthdate}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Parent / Guardian Email</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.email && styles.errorInput]}
                placeholder="name@gmail.com"
                placeholderTextColor="#9CA3AF"
                value={parentEmail ?? ""}
                onChangeText={(val) => {
                  setParentEmail(val);
                  if (fieldErrors.email) clearFieldError("email");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.password && styles.errorInput]}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={signUpPassword ?? ""}
                onChangeText={(val) => {
                  setSignUpPassword(val);
                  if (fieldErrors.password) clearFieldError("password");
                }}
                secureTextEntry
              />
              <Text style={styles.inputHint}>
                At least 6 characters, including 1 uppercase letter and 1 number.
              </Text>
              {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.confirmPassword && styles.errorInput]}
                placeholder="Re-enter password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword ?? ""}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (fieldErrors.confirmPassword) clearFieldError("confirmPassword");
                }}
                secureTextEntry
              />
              {fieldErrors.confirmPassword ? (
                <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
              ) : null}
            </View>

            <Pressable
              style={styles.submitButton}
              onPress={() => void handleRegister()}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Creating Account..." : "Register & Play"}
              </Text>
            </Pressable>
            {formMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
                {formMessage}
              </Text>
            ) : null}

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => setScreen("login")}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              style={[styles.backButton, { marginTop: 12 }]}
              onPress={() => setScreen("home")}
            >
              <Text style={styles.submitButtonText}>Back</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <InternetRequiredModal
        visible={isOffline}
        onCheckInternet={checkInternet}
      />
    </KeyboardAvoidingView>
  );
}

function EyeRestBreakScreen({ secondsRemaining }: { secondsRemaining: number }) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <SafeAreaView style={styles.eyeBreakPage}>
      <View style={styles.eyeBreakPanel}>
        <Text style={styles.eyeBreakIcon}>👀</Text>
        <Text style={styles.eyeBreakTitle}>Time to rest your eyes</Text>
        <Text style={styles.eyeBreakMessage}>
          Look away from the screen and focus on something far away. Blink slowly and relax.
        </Text>
        <Text style={styles.eyeBreakTimer}>
          {minutes}:{String(seconds).padStart(2, "0")}
        </Text>
        <Text style={styles.eyeBreakCaption}>Break time remaining</Text>
      </View>
    </SafeAreaView>
  );
}

function EmailVerificationScreen({
  email,
  onResend,
  onCheckVerification,
  onEditRegistration,
}: {
  email: string;
  onResend: () => Promise<void>;
  onCheckVerification: () => Promise<void>;
  onEditRegistration: () => Promise<void>;
}) {
  const [isWorking, setIsWorking] = useState(false);
  const [editError, setEditError] = useState("");

  const runAction = async (action: () => Promise<void>) => {
    setIsWorking(true);
    try {
      await action();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.verificationContainer}>
        <Text style={styles.pageTitle}>Verify your email</Text>
        <Text style={styles.pageSubtitle}>
          Open the verification link sent to {email || "your email address"}, then return here.
        </Text>
        <Pressable
          style={styles.submitButton}
          onPress={() => void runAction(onCheckVerification)}
          disabled={isWorking}
        >
          <Text style={styles.submitButtonText}>I've verified my email</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, styles.resendButton]}
          onPress={() => void runAction(onResend)}
          disabled={isWorking}
        >
          <Text style={styles.submitButtonText}>Resend verification email</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={[styles.submitButton, styles.editRegistrationButton]}
          onPress={() => {
            setEditError("");
            void runAction(onEditRegistration).catch((error: unknown) => {
              setEditError(
                error instanceof Error ? error.message : "Could not return to registration."
              );
            });
          }}
          disabled={isWorking}
        >
          <Text style={styles.submitButtonText}>Change registration details</Text>
        </Pressable>
        {editError ? <Text style={styles.fieldError}>{editError}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

function ProfileScreen({
  selectedIcon,
  childName,
  childBirthdate,
  firebaseUser,
  privacyMode,
  onOpenSettings,
  onSignOut,
  screen,
  setScreen,
}: {
  selectedIcon: string;
  childName: string;
  childBirthdate: string;
  firebaseUser: User | null;
  privacyMode: boolean;
  onOpenSettings: () => void;
  onSignOut: () => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
}) {
  const { darkMode } = useContext(AppAppearanceContext);
  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, darkMode && styles.darkText]}>Profile</Text>

        <View style={[styles.profileBanner, darkMode && styles.darkPanel]}>
          <Text style={styles.avatar}>{selectedIcon}</Text>
          <View>
            <Text style={[styles.profileName, darkMode && styles.darkText]}>
              {privacyMode ? "Learner" : childName || "User_Name"}
            </Text>
            <Text style={[styles.profileHint, darkMode && styles.darkMutedText]}>
              {privacyMode
                ? "Personal details hidden"
                : `Age: ${getAgeFromBirthdate(childBirthdate) ?? "Not set"} | Keep learning!`}
            </Text>
          </View>
        </View>

        <View style={[styles.profileStatusCard, darkMode && styles.darkPanel]}>
          <Text style={[styles.profileStatusTitle, darkMode && styles.darkText]}>Profile status</Text>
          <View style={styles.profileStatusRow}>
            <Text style={[styles.profileStatusLabel, darkMode && styles.darkText]}>Account</Text>
            <Text style={[styles.profileStatusValue, darkMode && styles.darkMutedText]}>
              {firebaseUser ? "Signed in" : "Guest"}
            </Text>
          </View>
          <View style={styles.profileStatusRow}>
            <Text style={[styles.profileStatusLabel, darkMode && styles.darkText]}>Email</Text>
            <Text
              style={[
                styles.profileStatusValue,
                darkMode && styles.darkMutedText,
                !firebaseUser?.emailVerified && styles.profileStatusPending,
              ]}
            >
              {firebaseUser?.emailVerified ? "Verified" : "Not verified"}
            </Text>
          </View>
          <View style={styles.profileStatusRow}>
            <Text style={[styles.profileStatusLabel, darkMode && styles.darkText]}>Learner profile</Text>
            <Text style={[styles.profileStatusValue, darkMode && styles.darkMutedText]}>
              {childName.trim() && childBirthdate ? "Complete" : "Incomplete"}
            </Text>
          </View>
        </View>
        <ActionButton onPress={onOpenSettings} variant="secondary">
          ACCOUNT SETTINGS
        </ActionButton>
        <ActionButton onPress={onSignOut} variant="secondary">
          SIGN OUT
        </ActionButton>
      </ScrollView>
      <BottomNavigation screen={screen} setScreen={setScreen} />
    </SafeAreaView>
  );
}

function MenuScreen({
  childName,
  selectedIcon,
  privacyMode,
  completedLessonIds,
  lessonProgressReady,
  offlineMode,
  grade,
  selectedCategory,
  onSelectCategory,
  screen,
  setScreen,
}: {
  childName: string;
  selectedIcon: string;
  privacyMode: boolean;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  offlineMode: boolean;
  grade: Grade | null;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
}) {
  const { darkMode } = useContext(AppAppearanceContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const gradeLessons = grade === "1"
    ? []
    : (Object.entries(lessonContent) as [CategoryId, (typeof lessonContent)[CategoryId]][])
        .filter(([, content]) => content.grade === grade);
  const lessonProgress = grade === "K"
    ? Math.min(
        100,
        (completedLessonIds.filter((id) => id.startsWith("kindergarten:")).length /
          kindergartenLessonCount) * 100
      )
          : grade === "1"
      ? Math.min(
          100,
          (completedLessonIds.filter((id) => id.startsWith("grade:1:online:")).length /
            gradeOneLessonCount) * 100
        )
    : grade === "2"
      ? Math.min(
          100,
          (completedLessonIds.filter((id) => id.startsWith("grade:2:online:")).length /
            gradeTwoLessonCount) * 100
        )
    : gradeLessons.length
      ? (gradeLessons.filter(([categoryId]) =>
          completedLessonIds.includes(`grade:${grade}:${categoryId}`)
        ).length /
          gradeLessons.length) * 100
      : 0;

  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.menuHero, darkMode && styles.darkPanel]}>
          <View style={[styles.menuMascotStage, darkMode && styles.darkAccent]}>
            <Text style={styles.menuSparkle}>✨</Text>
            <Text style={styles.menuMascot}>{selectedIcon || "🦉"}</Text>
            <Text style={styles.menuBook}>📘</Text>
          </View>
          <View style={styles.menuGreetingCopy}>
            <Text style={[styles.menuGreeting, darkMode && styles.darkText]}>
              {privacyMode ? "Hello, learner!" : `Hi, ${childName || "friend"}!`}
            </Text>
            <Text style={[styles.menuGreetingSub, darkMode && styles.darkMutedText]}>Ready for a little adventure?</Text>
          </View>
        </View>

        <View style={[styles.progressCard, darkMode && styles.darkPanel]}>
          <Text style={[styles.cardTitle, darkMode && styles.darkText]}>PROGRESS BAR</Text>
          <View style={[styles.progressTrack, darkMode && styles.darkTrack]}>
            <View style={[styles.progressValue, { width: `${lessonProgress}%` }]} />
          </View>
          <View style={[styles.streakBadge, darkMode && styles.darkAccent]}>
            <Text style={[styles.streakBadgeText, darkMode && styles.darkText]}>🔥 1 DAY STREAK</Text>
          </View>
        </View>

        {!offlineMode && (
          <View style={[styles.lessonsCard, darkMode && styles.darkPanel]}>
            <View style={styles.lessonBoardHeader}>
              <View style={[styles.lessonBoardIcon, darkMode && styles.darkAccent]}>
                <Text style={styles.lessonBoardIconText}>📚</Text>
              </View>
              <View style={styles.lessonBoardCopy}>
                <Text style={[styles.lessonBoardTitle, darkMode && styles.darkText]}>Lesson Board</Text>
                <Text style={[styles.cardBody, darkMode && styles.darkMutedText]}>
                  {grade ? gradeLabels[grade] : "Choose a subject"} · {grade === "1" ? "Reading, Language, Math, Community, and Good Manners" : "Math, Reading Comprehension, and Science"}
                </Text>
              </View>
            </View>
            {gradeLessons.length > 0 ? (
              <View style={[styles.gradeLessonGrid, isLandscape && styles.gradeLessonGridLandscape]}>
                {gradeLessons.map(([categoryId, content], index) => {
                  const lessonId = `grade:${grade}:${categoryId}`;
                  const isComplete = completedLessonIds.includes(lessonId);
                  const previousIncomplete = gradeLessons
                    .slice(0, index)
                    .find(([previousId]) =>
                      !completedLessonIds.includes(`grade:${grade}:${previousId}`)
                    );
                  const isLocked = !lessonProgressReady || Boolean(previousIncomplete);
                  return (
                  <View
                    style={[
                      styles.gradeLessonCard,
                      darkMode && styles.darkCard,
                      isLocked && styles.lockedGradeLessonCard,
                      isLandscape && styles.gradeLessonCardLandscape,
                    ]}
                    key={categoryId}
                  >
                    <Text style={[styles.lessonPreviewHeading, isLocked && styles.lockedGradeLessonText]}>
                      {isComplete ? "✓ COMPLETED" : isLocked ? "🔒 LOCKED" : `STEP ${index + 1} · READY`}
                    </Text>
                    <Text style={styles.lessonPreviewHeading}>
                      {categoryMeta[categoryId].emoji} {categoryMeta[categoryId].label}
                    </Text>
                    <Text style={[styles.lessonPreviewTitle, darkMode && styles.darkText]}>{content.title}</Text>
                    <Text style={[styles.cardBody, darkMode && styles.darkMutedText]}>{categoryMeta[categoryId].summary}</Text>
                    <View style={[styles.lessonContentPreview, darkMode && styles.darkCard]}>
                      <Text style={[styles.lessonPreviewHeading, darkMode && styles.darkMutedText]}>{content.grade === "K" ? "Kindergarten" : `Grade ${content.grade}`} · {content.theme}</Text>
                      <Text style={[styles.cardBody, darkMode && styles.darkMutedText]}>{content.storyLine}</Text>
                      <Text style={[styles.lessonPreviewHint, darkMode && styles.darkMutedText]}>Learn: {content.rememberText}</Text>
                    </View>
                    {isLocked ? (
                      <View style={styles.lockedLesson}>
                        <Text style={styles.lockedLessonText}>
                          {lessonProgressReady
                            ? `Complete ${previousIncomplete?.[1].title} first to unlock this lesson.`
                            : "Loading your saved lesson progress…"}
                        </Text>
                      </View>
                    ) : (
                      <ActionButton
                        onPress={() => {
                          onSelectCategory(categoryId);
                          setScreen("character-select");
                        }}
                        variant="primary"
                      >
                        {isComplete ? `↻ Review ${content.title}` : `▶ Start ${content.title}`}
                      </ActionButton>
                    )}
                  </View>
                  );
                })}
              </View>
            ) : grade === "K" ? (
              <ActionButton onPress={() => setScreen("kinder-lessons")} variant="secondary">
                OPEN KINDERGARTEN ONLINE LESSONS
              </ActionButton>
                          ) : grade === "1" ? (
              <ActionButton onPress={() => setScreen("grade1-lessons")} variant="secondary">
                OPEN GRADE 1 ONLINE LESSONS
              </ActionButton>
            ) : grade === "2" ? (
              <ActionButton onPress={() => setScreen("grade2-lessons")} variant="secondary">
                OPEN GRADE 2 ONLINE LESSONS
              </ActionButton>
            ) : (
              <Text style={[styles.cardBody, darkMode && styles.darkMutedText]}>
                No online lessons for {grade ? gradeLabels[grade] : "this grade"} yet. Try an offline mission.
              </Text>
            )}
          </View>
        )}

        {offlineMode ? (
          <View style={[styles.offlineModePanel, darkMode && styles.darkPanel]}>
            <View style={styles.missionCardHeading}>
              <View style={[styles.offlineMissionIcon, darkMode && styles.darkAccent]}>
                <Text style={styles.offlineMissionEmoji}>🧭</Text>
              </View>
              <View style={styles.offlineCopy}>
                <Text style={[styles.cardHeading, darkMode && styles.darkText]}>
                  Your Offline Adventure
                </Text>
                <Text style={[styles.cardBody, darkMode && styles.darkMutedText]}>
                  Online lessons are tucked away. Your local missions are ready whenever you are.
                </Text>
              </View>
            </View>
            {grade === "K" ? (
              <ActionButton onPress={() => setScreen("kinder-lessons")} variant="secondary">
                OPEN KINDERGARTEN ONLINE LESSONS
              </ActionButton>
            ) : grade === "1" ? (
              <ActionButton onPress={() => setScreen("grade1-lessons")} variant="secondary">
                OPEN GRADE 1 ONLINE LESSONS
              </ActionButton>
            ) : null}
            <ActionButton onPress={() => setScreen("missions")}>
              OPEN OFFLINE MISSIONS
            </ActionButton>
          </View>
        ) : (
          <>
            <View style={[styles.offlineCard, darkMode && styles.darkPanel]}>
              <View style={styles.missionCardHeading}>
                <View style={[styles.offlineMissionIcon, darkMode && styles.darkAccent]}>
                  <Text style={styles.offlineMissionEmoji}>🧭</Text>
                </View>
                <View style={styles.offlineCopy}>
                  <Text style={[styles.cardHeading, darkMode && styles.darkText]}>
                    Offline Missions
                  </Text>
                  <Text style={[styles.cardBody, darkMode && styles.darkMutedText]}>
                    Practice through real-life Filipino adventures, even without a connection.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setScreen("missions")}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.openMissionsButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.openButton}>Explore missions →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
      <BottomNavigation screen={screen} setScreen={setScreen} />
    </SafeAreaView>
  );
}

  function MissionsScreen({
    screen,
    setScreen,
    grade,
  }: {
    screen: Screen;
    setScreen: (s: Screen) => void;
    grade: Grade;
  })
  {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  const [pending, setPending] = useState<OfflineMission | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoContentType, setPhotoContentType] = useState("image/jpeg");
  const [photoError, setPhotoError] = useState("");
  const [missionError, setMissionError] = useState("");
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const [pendingReview, setPendingReview] = useState<MissionReview | null>(null);
  const [isPendingReviewDismissed, setIsPendingReviewDismissed] = useState(false);
  const [submissions, setSubmissions] = useState<OfflineMissionSubmission[]>([]);
  const [reviewError, setReviewError] = useState("");
  const [isRestoringReview, setIsRestoringReview] = useState(true);
  const restoredReviewRef = useRef(false);
  const reviewStorageKey = auth?.currentUser
    ? `learnbridge.pending-mission-review.${auth.currentUser.uid}`
    : null;
  const userId = auth?.currentUser?.uid ?? null;

  const gradeMissions = getMissionsForGrade(grade);
  const areaIcons = { Math: "🔢", Science: "🔬", "Reading & Writing": "📖" };
  const refreshSubmissions = useCallback(async () => {
    if (!userId) {
      setSubmissions([]);
      return;
    }
    setSubmissions(await getMissionSubmissions(userId));
  }, [userId]);

  const syncSubmissions = useCallback(async () => {
    if (!userId) return;
    await syncMissionSubmissions(userId, (submission) => {
      setSubmissions((current) => [
        submission,
        ...current.filter((item) => item.id !== submission.id),
      ]);
      if (submission.status === "submitted_successfully") {
        restoredReviewRef.current = true;
        const review: MissionReview = {
          id: submission.id,
          missionId: submission.missionId,
          status: "pending",
        };
        setPendingReview(review);
        setIsPendingReviewDismissed(false);
        if (reviewStorageKey) {
          void AsyncStorage.setItem(reviewStorageKey, JSON.stringify(review)).catch(
            (error: unknown) => {
              setReviewError(
                error instanceof Error
                  ? `The submission was sent, but the review status could not be saved on this device: ${error.message}`
                  : "The submission was sent, but the review status could not be saved on this device."
              );
            }
          );
        }
      }
    });
    await refreshSubmissions();
  }, [refreshSubmissions, reviewStorageKey, userId]);

  useEffect(() => {
    let active = true;
    void refreshSubmissions().catch((error: unknown) => {
      if (active) {
        setMissionError(
          error instanceof Error
            ? `Could not load saved mission submissions: ${error.message}`
            : "Could not load saved mission submissions."
        );
      }
    });
    void syncSubmissions().catch((error: unknown) => {
      if (active) {
        setMissionError(
          error instanceof Error
            ? `Could not synchronize saved mission submissions: ${error.message}`
            : "Could not synchronize saved mission submissions."
        );
      }
    });
    const subscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected === true && state.isInternetReachable !== false) {
        void syncSubmissions().catch((error: unknown) => {
          if (active) {
            setMissionError(
              error instanceof Error
                ? `Could not synchronize saved mission submissions: ${error.message}`
                : "Could not synchronize saved mission submissions."
            );
          }
        });
      }
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [refreshSubmissions, syncSubmissions]);

  // reload checkmarks whenever this screen is shown (e.g. back from the scanner)
  useFocusEffect(
    useCallback(() => {
      void getCompletedMissions()
        .then(setCompleted)
        .catch((error: unknown) => {
          setMissionError(
            error instanceof Error ? error.message : "Could not load completed missions."
          );
        });
    }, [])
  );

  useEffect(() => {
    if (!reviewStorageKey) {
      setIsRestoringReview(false);
      return;
    }
    let active = true;
    void AsyncStorage.getItem(reviewStorageKey)
      .then((value) => {
        if (!active || restoredReviewRef.current || !value) return;
        const parsed = JSON.parse(value) as Partial<MissionReview>;
        if (
          typeof parsed.id === "string" &&
          typeof parsed.missionId === "string" &&
          (parsed.status === "pending" ||
            parsed.status === "approved" ||
            parsed.status === "needs_revision")
        ) {
          restoredReviewRef.current = true;
          setIsPendingReviewDismissed(false);
          setPendingReview({
            id: parsed.id,
            missionId: parsed.missionId,
            status: parsed.status,
          });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setReviewError(
            error instanceof Error ? error.message : "Could not restore the pending mission review."
          );
        }
      })
      .finally(() => {
        if (active) setIsRestoringReview(false);
      });
    return () => {
      active = false;
    };
  }, [reviewStorageKey]);

  useEffect(() => {
    if (!pendingReview || pendingReview.status !== "pending") return;
    return listenToMissionReview(
      pendingReview.id,
      (updatedReview) => {
        if (updatedReview.status === "pending") return;
        setPendingReview(updatedReview);
        setReviewError("");
        if (reviewStorageKey) {
          void AsyncStorage.setItem(reviewStorageKey, JSON.stringify(updatedReview)).catch(
            (error: unknown) => {
              setReviewError(
                error instanceof Error
                  ? `Parent decision received, but it could not be saved on this device: ${error.message}`
                  : "Parent decision received, but it could not be saved on this device."
              );
            }
          );
        }
      },
      (error) => setReviewError(error.message)
    );
  }, [pendingReview, reviewStorageKey]);

  useEffect(() => {
    if (pendingReview?.status !== "approved") return;
    let active = true;
    void markMissionComplete(pendingReview.missionId)
      .then(() => getCompletedMissions())
      .then((missions) => {
        if (active) setCompleted(missions);
      })
      .catch((error: unknown) => {
        if (active) {
          setReviewError(
            error instanceof Error
              ? `The parent approved this mission, but local progress could not be saved: ${error.message}`
              : "The parent approved this mission, but local progress could not be saved."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [pendingReview?.missionId, pendingReview?.status]);

  useEffect(() => {
    if (pendingReview?.status === "approved" && userId) {
      void syncSubmissions().catch((error: unknown) => {
        setMissionError(
          error instanceof Error
            ? `Could not synchronize the next saved mission: ${error.message}`
            : "Could not synchronize the next saved mission."
        );
      });
    }
  }, [pendingReview?.status, syncSubmissions, userId]);

  const closeCheck = () => {
    setPending(null);
    setPhotoUri(null);
    setPhotoContentType("image/jpeg");
    setPhotoError("");
    setMissionError("");
    setIsPickingPhoto(false);
    setIsSubmittingPhoto(false);
  };

  const confirmMission = async () => {
    if (
      !pending ||
      isSubmittingPhoto ||
      (pending.submission === "photo" && !photoUri)
    ) return;
    if (requiresParentEmailReview(pending)) {
      setIsSubmittingPhoto(true);
      setMissionError("");
      try {
        if (!userId) throw new Error("Sign in before saving a mission submission.");
        const submission = await saveMissionPhotoSubmission(
          userId,
          pending.id,
          photoUri!,
          photoContentType
        );
        setSubmissions((current) => [submission, ...current]);
        closeCheck();
        void syncSubmissions().catch((error: unknown) => {
          setMissionError(
            error instanceof Error
              ? `Saved offline. Synchronization will retry when the connection is available: ${error.message}`
              : "Saved offline. Synchronization will retry when the connection is available."
          );
        });
      } catch (error) {
        setMissionError(
          error instanceof Error
            ? `Could not save the submission on this device: ${error.message}`
            : "Could not save the submission on this device. Please try again."
        );
      } finally {
        setIsSubmittingPhoto(false);
      }
      return;
    }

    setMissionError("");
    try {
      await markMissionComplete(pending.id);
      setCompleted(await getCompletedMissions());
      closeCheck();
    } catch (error) {
      setMissionError(
        error instanceof Error ? error.message : "Could not save mission completion. Please try again."
      );
    }
  };

  const closePendingReview = async (): Promise<boolean> => {
    if (reviewStorageKey) {
      try {
        await AsyncStorage.removeItem(reviewStorageKey);
      } catch (error) {
        setReviewError(
          error instanceof Error
            ? `Could not clear the saved mission review: ${error.message}`
            : "Could not clear the saved mission review."
        );
        return false;
      }
    }
    setPendingReview(null);
    setReviewError("");
    restoredReviewRef.current = false;
    return true;
  };

  const chooseMissionPhoto = async (source: "camera" | "library") => {
    if (isPickingPhoto) return;
    try {
      setIsPickingPhoto(true);
      setPhotoError("");
      let result: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setPhotoError(
            "Camera access is needed to take a photo. Allow camera access or choose a photo from your device."
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
      }
      if (result.canceled) return;
      const selectedAsset = result.assets[0];
      if (!selectedAsset) {
        setPhotoError("No image was selected. Please try again.");
        return;
      }
      setPhotoUri(selectedAsset.uri);
      setPhotoContentType(selectedAsset.mimeType ?? "image/jpeg");
      setPhotoError("");
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : "Could not open the photo picker. Please try again."
      );
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const startMission = (mission: OfflineMission) => {
    if (mission.submission === "shape-scan") {
      router.push({ pathname: "/shape-recognition", params: { missionId: mission.id } });
    } else if (mission.submission === "photo") {
      setPending(mission);
      setPhotoUri(null);
      setPhotoContentType("image/jpeg");
      setPhotoError("");
      setMissionError("");
    } else {
      setPending(mission);
      setMissionError("");
    }
  };

  const latestSubmissionByMission = new Map<string, OfflineMissionSubmission>();
  for (const submission of submissions) {
    if (!latestSubmissionByMission.has(submission.missionId)) {
      latestSubmissionByMission.set(submission.missionId, submission);
    }
  }
  const submissionStatusLabels: Record<OfflineMissionSubmission["status"], string> = {
    saved_offline: "Saved Offline",
    pending_upload: "Pending Upload",
    uploading: "Uploading",
    submitted_successfully: "Submitted Successfully",
    upload_failed: "Upload Failed — will retry when online",
  };

  if (isRestoringReview) {
    return (
      <SafeAreaView style={styles.missionPendingPage}>
        <ActivityIndicator size="large" color="#258EA3" />
        <Text style={styles.missionPendingTitle}>Checking mission review…</Text>
      </SafeAreaView>
    );
  }

  if (pendingReview?.status === "approved" || pendingReview?.status === "needs_revision") {
    const approved = pendingReview.status === "approved";
    const reviewMission = gradeMissions.find((mission) => mission.id === pendingReview.missionId);
    return (
      <SafeAreaView style={styles.missionResultPage}>
        <ScrollView contentContainerStyle={styles.missionResultContent}>
          <View style={styles.missionResultCard}>
            <Text style={styles.missionResultIcon}>{approved ? "🌟" : "📷"}</Text>
            <Text style={styles.pageTitle}>
              {approved ? "Mission Complete!" : "Please Try Again"}
            </Text>
            <Text style={styles.pageSubtitle}>{reviewMission?.title ?? "Mission review"}</Text>
            <Text style={styles.missionResultMessage}>
              {approved
                ? "Your parent reviewed the photo and approved your mission. Great work!"
                : "Your parent would like a clearer or more complete photo. Take another picture and send it for review."}
            </Text>
            {reviewError ? (
              <Text accessibilityLiveRegion="polite" style={styles.missionInlineError}>
                {reviewError}
              </Text>
            ) : null}
            {approved ? (
              <View style={styles.missionResultBadge}>
                <Text style={styles.missionResultBadgeText}>✓ PARENT APPROVED</Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  if (!(await closePendingReview())) return;
                  if (reviewMission) {
                    setPending(reviewMission);
                    setPhotoUri(null);
                    setPhotoContentType("image/jpeg");
                    setPhotoError("");
                  }
                }}
                style={({ pressed }) => [styles.missionResultButton, pressed && styles.pressed]}
              >
                <Text style={styles.missionResultButtonText}>TAKE ANOTHER PHOTO</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => void closePendingReview()}
              style={({ pressed }) => [
                styles.missionResultButton,
                !approved && styles.missionResultSecondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.missionResultButtonText}>BACK TO MISSIONS</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
          onPress={() => setScreen("menu")}
          style={({ pressed }) => [styles.missionBackButton, pressed && styles.pressed]}
        >
          <Text style={styles.missionBackButtonText}>← Back to Dashboard</Text>
        </Pressable>
        <Text style={styles.pageTitle}>Offline Missions</Text>
        <Text style={styles.pageSubtitle}>
          Showing only {gradeLabels[grade]} missions. Pick one to try at home!
        </Text>
        {missionError ? (
          <Text accessibilityLiveRegion="polite" style={styles.missionInlineError}>
            {missionError}
          </Text>
        ) : null}

        {gradeMissions.map((mission) => {
          const done = completed.includes(mission.id);
          const latestSubmission = latestSubmissionByMission.get(mission.id);
          return (
            <View style={styles.missionCard} key={mission.id}>
              <View style={styles.missionHeading}>
                <Text style={styles.missionId}>{areaIcons[mission.area]}</Text>
                <Text style={styles.missionTitle}>
                  {done ? "✅ " : ""}
                  {mission.title}
                </Text>
              </View>
              <Text style={styles.missionSkill}>📚 {mission.subject}</Text>
              <Text style={styles.cardBody}>{mission.task}</Text>
              {latestSubmission ? (
                <View style={styles.missionSubmissionStatus}>
                  <Text
                    accessibilityLiveRegion="polite"
                    style={styles.missionSubmissionStatusText}
                  >
                    Submission:{" "}
                    {submissionStatusLabels[latestSubmission.status]}
                  </Text>
                  {latestSubmission.errorMessage ? (
                    <Text style={styles.missionSubmissionError}>
                      {latestSubmission.errorMessage}
                    </Text>
                  ) : null}
                  {latestSubmission.status === "upload_failed" ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        void syncSubmissions().catch((error: unknown) => {
                          setMissionError(
                            error instanceof Error
                              ? `Could not retry the submission: ${error.message}`
                              : "Could not retry the submission."
                          );
                        });
                      }}
                      style={styles.missionRetryUpload}
                    >
                      <Text style={styles.missionRetryUploadText}>RETRY UPLOAD</Text>
                    </Pressable>
                  ) : null}
                </View>
              {mission.grade === "2" ? (
                <Text style={styles.missionPhotoInstruction}>
                  📷 Take a photo of your work to send to your parent for approval.
                </Text>
              ) : null}
              <ActionButton onPress={() => startMission(mission)}>
                {done ? "DO IT AGAIN" : "START MISSION"}
              </ActionButton>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!pending}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isPickingPhoto && !isSubmittingPhoto) closeCheck();
        }}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            style={styles.missionReviewContainer}
            contentContainerStyle={styles.missionReviewScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
            <Text style={styles.cardHeading}>{pending?.title}</Text>
            <Text style={styles.cardBody}>{pending?.task}</Text>
            <Text style={[styles.missionSkill, { marginTop: 12 }]}>
              Parent check: {pending?.parentCheck}
            </Text>
            {pending?.submission === "photo" ? (
              <>
                <Text style={styles.photoReviewHeading}>
                  {photoUri ? "Review the photo before sending" : "Add a photo to continue"}
                </Text>
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.missionPhotoPreview}
                    resizeMode="contain"
                    accessibilityLabel={`Photo evidence for ${pending.title}`}
                  />
                ) : (
                  <View style={styles.missionPhotoPlaceholder}>
                    <Text style={styles.missionPhotoPlaceholderText}>📷 No photo selected</Text>
                  </View>
                )}
                {photoError ? (
                  <Text accessibilityLiveRegion="polite" style={styles.missionInlineError}>
                    {photoError}
                  </Text>
                ) : null}
                <View style={styles.photoActionRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isPickingPhoto || isSubmittingPhoto}
                    onPress={() => void chooseMissionPhoto("camera")}
                    style={({ pressed }) => [
                      styles.photoActionButton,
                      (pressed || isPickingPhoto) && styles.pressed,
                    ]}
                  >
                    <Text style={styles.photoActionButtonText}>
                      {isPickingPhoto ? "OPENING..." : "TAKE PHOTO"}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isPickingPhoto || isSubmittingPhoto}
                    onPress={() => void chooseMissionPhoto("library")}
                    style={({ pressed }) => [
                      styles.photoActionButton,
                      styles.photoLibraryButton,
                      (pressed || isPickingPhoto) && styles.pressed,
                    ]}
                  >
                    <Text style={styles.photoActionButtonText}>CHOOSE PHOTO</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
            {missionError ? (
              <Text accessibilityLiveRegion="polite" style={styles.missionInlineError}>
                {missionError}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={isSubmittingPhoto || (pending?.submission === "photo" && !photoUri)}
              onPress={() => void confirmMission()}
              style={({ pressed }) => [
                styles.actionButton,
                (isSubmittingPhoto || (pending?.submission === "photo" && !photoUri)) &&
                  styles.missionActionDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionButtonText}>
                {isSubmittingPhoto
                  ? "SAVING ON DEVICE..."
                  : pending && requiresParentEmailReview(pending)
                    ? "SAVE SUBMISSION"
                    : "PARENT CONFIRMS ✓"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isPickingPhoto || isSubmittingPhoto}
              onPress={closeCheck}
              style={({ pressed }) => [
                styles.actionButton,
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>NOT YET</Text>
            </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={pendingReview?.status === "pending" && !isPendingReviewDismissed}
        animationType="fade"
        onRequestClose={() => undefined}
      >
        <SafeAreaView style={styles.missionPendingPage}>
          <Text style={styles.missionPendingIcon}>📨</Text>
          <Text style={styles.missionPendingTitle}>Waiting for your parent</Text>
          <Text style={styles.missionPendingMission}>
            {gradeMissions.find((mission) => mission.id === pendingReview?.missionId)?.title ??
              "Mission photo"}
          </Text>
          <Text style={styles.missionPendingMessage}>
            Your photo and mission target were emailed to your parent. You can continue when your parent reviews it.
          </Text>
          {auth?.currentUser?.email ? (
            <Text style={styles.missionPendingEmail}>{auth.currentUser.email}</Text>
          ) : null}
          <ActivityIndicator size="large" color="#258EA3" style={styles.missionPendingSpinner} />
          {reviewError ? (
            <Text accessibilityLiveRegion="polite" style={styles.missionInlineError}>
              {reviewError}
            </Text>
          ) : null}
          <Text style={styles.missionPendingHint}>
            Your submission was received. This screen will update automatically after your parent decides.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsPendingReviewDismissed(true)}
            style={styles.missionContinueButton}
          >
            <Text style={styles.missionContinueButtonText}>CONTINUE TO MISSIONS</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>

      <BottomNavigation screen={screen} setScreen={setScreen} />
    </SafeAreaView>
  );
}

function TutorialScreen({
  screen,
  setScreen,
  onContinue,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  onContinue?: () => void;
}) {
  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>How to LearnBridge</Text>
        {[
          ["📖", "1. Choose a Lesson", "Select a math lesson that you want to learn."],
          ["🎮", "2. Practice", "Play activities and answer simple questions."],
          ["⭐", "3. Earn Stars", "Complete activities to earn stars and improve your progress."],
          ["🇵🇭", "4. Try Offline Missions", "Practice mathematics using everyday Filipino experiences."],
        ].map(([icon, title, text]) => (
          <View style={styles.tutorialCard} key={title}>
            <Text style={styles.tutorialIcon}>{icon}</Text>
            <View style={styles.tutorialCopy}>
              <Text style={styles.cardHeading}>{title}</Text>
              <Text style={styles.cardBody}>{text}</Text>
            </View>
          </View>
        ))}
        {onContinue && (
          <ActionButton onPress={onContinue}>Continue to Email Verification</ActionButton>
        )}
      </ScrollView>
      {!onContinue && <BottomNavigation screen={screen} setScreen={setScreen} />}
    </SafeAreaView>
  );
}

function GradeSetupTutorialScreen({
  childName,
  currentGrade,
  onContinue,
}: {
  childName: string;
  currentGrade: Grade | null;
  onContinue: (grade: Grade) => Promise<void>;
}) {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(currentGrade);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const saveGrade = async () => {
    if (!selectedGrade || isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      await onContinue(selectedGrade);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the grade level.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Your LearnBridge tutorial</Text>
        <Text style={styles.pageSubtitle}>
          Welcome{childName ? `, ${childName}` : ""}! Your email is verified. First, choose your child's current grade so we can show the right activities.
        </Text>
        {[
          ["📖", "Choose a lesson", "Lessons are made for your child's learning level."],
          ["🎮", "Practice together", "Try activities and answer questions at your own pace."],
          ["⭐", "Celebrate progress", "Complete activities to earn stars and build confidence."],
        ].map(([icon, title, text]) => (
          <View style={styles.tutorialCard} key={title}>
            <Text style={styles.tutorialIcon}>{icon}</Text>
            <View style={styles.tutorialCopy}>
              <Text style={styles.cardHeading}>{title}</Text>
              <Text style={styles.cardBody}>{text}</Text>
            </View>
          </View>
        ))}
        <View style={styles.gradeSetupCard}>
          <Text style={styles.gradeSetupTitle}>What grade is your child in?</Text>
          <Text style={styles.gradeSetupHint}>You can update this later in Account Settings.</Text>
          <View style={styles.gradeSetupOptions}>
            {(Object.keys(gradeLabels) as Grade[]).map((grade) => {
              const selected = selectedGrade === grade;
              return (
                <Pressable
                  key={grade}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedGrade(grade)}
                  style={[styles.gradeSetupOption, selected && styles.gradeSetupOptionSelected]}
                >
                  <Text style={styles.gradeSetupEmoji}>{grade === "K" ? "🎨" : "📚"}</Text>
                  <Text style={[styles.gradeSetupOptionText, selected && styles.gradeSetupOptionTextSelected]}>
                    {gradeLabels[grade]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {error ? <Text style={styles.formMessage}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={!selectedGrade || isSaving}
            onPress={() => void saveGrade()}
            style={[
              styles.gradeSetupSubmit,
              (!selectedGrade || isSaving) && styles.gradeSetupSubmitDisabled,
            ]}
          >
            <Text style={styles.gradeSetupSubmitText}>
              {isSaving ? "Saving..." : "Save grade and start learning"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- MAIN APP COMPONENT ---

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const setCloudBackdropVisible = useContext(CloudBackdropVisibilityContext);
  const { setDarkMode } = useContext(AppAppearanceContext);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("math");
  const [curriculumCategory, setCurriculumCategory] = useState<CategoryId | null>(null);
  const backgroundMusicTrack = getBackgroundMusicTrack(
    screen,
    selectedCategory,
    curriculumCategory
  );

  useEffect(() => {
    setCloudBackdropVisible(screen !== "settings");
    return () => setCloudBackdropVisible(true);
  }, [screen, setCloudBackdropVisible]);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [childName, setChildName] = useState("");
  const [childBirthdate, setChildBirthdate] = useState("");
  const [childProfiles, setChildProfiles] = useState<LearnerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profilesReady, setProfilesReady] = useState(false);
  const activeLearnerProfile = childProfiles.find((profile) => profile.id === activeProfileId);
  const childGrade = activeLearnerProfile?.grade ?? null;
  const [parentEmail, setParentEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🦉");
  const [preferences, setPreferences] = useState<AccountPreferences>(DEFAULT_PREFERENCES);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    setDarkMode(Boolean(firebaseUser && screen !== "home" && preferences.darkMode));
  }, [firebaseUser, preferences.darkMode, screen, setDarkMode]);

  const [quizResults, setQuizResults] = useState<{
    correct: number;
    total: number;
    breakdown: { label: string; answer: string; correct: boolean }[];
  }>({ correct: 0, total: 0, breakdown: [] });
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [lessonProgressReady, setLessonProgressReady] = useState(false);
  const completedLessonIdsRef = useRef<string[]>([]);
  const [screenTimeUsedSeconds, setScreenTimeUsedSeconds] = useState(0);
  const [screenTimeReady, setScreenTimeReady] = useState(false);
  const [eyeBreakSecondsRemaining, setEyeBreakSecondsRemaining] = useState(0);
  const screenTimePersistenceRef = useRef<DailyScreenTimePersistence | null>(null);
  const notificationsEnabledRef = useRef(preferences.notificationsEnabled);
  const eyeRestEnabledRef = useRef(preferences.screenTimeLimitMinutes > 0);

  useEffect(() => {
    setBackgroundMusic(backgroundMusicTrack);
    return () => setBackgroundMusic(null);
  }, [backgroundMusicTrack]);

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setPreferences(DEFAULT_PREFERENCES);
      if (!user) {
        setPreferencesReady(false);
        setProfilesReady(true);
        setChildProfiles([]);
        setActiveProfileId(null);
        return;
      }

      setPreferencesReady(false);
      setProfilesReady(false);
      setParentEmail(user.email ?? "");
      setChildProfiles([]);
      setActiveProfileId(null);
      void (async () => {
        if (!firestore) {
          throw new Error("Cloud profile storage is not configured.");
        }
        const profileRef = doc(firestore, "users", user.uid, "learnerProfiles", "current");
        let stored: StoredLearnerProfiles;
        let cloudSyncError: unknown;
        try {
          const cloudProfile = await getDoc(profileRef);
          if (cloudProfile.exists()) {
            stored = parseStoredLearnerProfiles(cloudProfile.data(), user.uid);
          } else {
            const localProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_PREFIX}${user.uid}`);
            stored = localProfile
              ? parseStoredLearnerProfiles(JSON.parse(localProfile), user.uid)
              : { version: 2, profiles: [], activeProfileId: null };
            if (stored.profiles.length > 0) {
              await setDoc(profileRef, stored);
            }
          }
        } catch (error) {
          cloudSyncError = error;
          const localProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_PREFIX}${user.uid}`);
          if (!localProfile) {
            throw error;
          }
          stored = parseStoredLearnerProfiles(JSON.parse(localProfile), user.uid);
        }

        if (auth?.currentUser?.uid !== user.uid) return;
        if (stored.profiles.length > 0) {
          await AsyncStorage.setItem(
            `${PROFILE_STORAGE_PREFIX}${user.uid}`,
            JSON.stringify(stored)
          );
        }
        if (auth?.currentUser?.uid !== user.uid) return;
        setChildProfiles(stored.profiles);
        setActiveProfileId(stored.activeProfileId);
        const activeProfile = stored.profiles.find(
          (profile) => profile.id === stored.activeProfileId
        );
        if (activeProfile) {
          setChildName(activeProfile.childName);
          setChildBirthdate(activeProfile.childBirthdate);
          setSelectedIcon(activeProfile.selectedIcon);
        }
        setProfilesReady(true);
        if (cloudSyncError) {
          Alert.alert(
            "Child profile restored on this device",
            `Your saved profile is available, but it could not sync with your account. Check your internet connection and try again. ${
              cloudSyncError instanceof Error ? cloudSyncError.message : ""
            }`
          );
        }
        if (user.emailVerified) {
          setScreen((currentScreen) => {
            const canRedirect = ["login", "signup", "verify-email", "tutorial", "menu"].includes(currentScreen);
            if (!canRedirect) return currentScreen;
            return activeProfile?.grade ? "menu" : "grade-selection";
          });
        }
      })().catch((error: unknown) => {
        if (auth?.currentUser?.uid === user.uid) {
          setProfilesReady(true);
          Alert.alert(
            "Could not load child profile",
            error instanceof Error ? error.message : "Check your connection and try again."
          );
        }
      });

      void AsyncStorage.getItem(`${SETTINGS_STORAGE_PREFIX}${user.uid}`)
        .then((storedPreferences) => {
          if (auth?.currentUser?.uid !== user.uid) return;
          if (storedPreferences) {
            const parsed = JSON.parse(storedPreferences) as Partial<AccountPreferences>;
            setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
          }
          setPreferencesReady(true);
        })
        .catch(() => {
          if (auth?.currentUser?.uid === user.uid) setPreferencesReady(true);
        });

      if (!user.emailVerified) {
        setScreen((currentScreen) =>
          currentScreen === "home" ? currentScreen : "verify-email"
        );
      }
    });
  }, []);

  useEffect(() => {
    let isCurrent = true;
    completedLessonIdsRef.current = [];
    setCompletedLessonIds([]);

    const userId = firebaseUser?.uid;
    if (!userId) {
      setLessonProgressReady(true);
      return () => {
        isCurrent = false;
      };
    }
    if (!activeProfileId) {
      setLessonProgressReady(false);
      return () => {
        isCurrent = false;
      };
    }

    const storageKey = getLessonProgressStorageKey(userId, activeProfileId);
    setLessonProgressReady(false);
    void AsyncStorage.getItem(storageKey)
      .then((storedProgress) => {
        if (!isCurrent) return;
        const parsed: unknown = storedProgress ? JSON.parse(storedProgress) : [];
        if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) {
          throw new Error("Saved lesson progress is invalid.");
        }
        completedLessonIdsRef.current = parsed;
        setCompletedLessonIds(parsed);
        setLessonProgressReady(true);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLessonProgressReady(true);
        Alert.alert(
          "Could not load lesson progress",
          error instanceof Error ? error.message : "Check device storage and try again."
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [firebaseUser?.uid, activeProfileId]);

  useEffect(() => {
    notificationsEnabledRef.current = preferences.notificationsEnabled;
  }, [preferences.notificationsEnabled]);

  useEffect(() => {
    eyeRestEnabledRef.current = preferences.screenTimeLimitMinutes > 0;
  }, [preferences.screenTimeLimitMinutes]);

  useEffect(() => {
    const accountId = firebaseUser?.uid;
    if (!accountId) {
      screenTimePersistenceRef.current = null;
      setScreenTimeUsedSeconds(0);
      setScreenTimeReady(false);
      setEyeBreakSecondsRemaining(0);
      return;
    }

    const storageKey = `${SCREEN_TIME_STORAGE_PREFIX}${accountId}`;
    let isCurrent = true;
    let isLoaded = false;
    let usageDate = getLocalDateStamp();
    let usedSeconds = 0;
    let focusSeconds = 0;
    let breakSeconds = 0;
    const persistence: DailyScreenTimePersistence = {
      storageKey,
      writeQueue: Promise.resolve(),
      persist: null,
    };
    screenTimePersistenceRef.current = persistence;
    setScreenTimeReady(false);

    const persistUsage = (): Promise<void> => {
      const snapshot: DailyScreenTimeSnapshot = {
        date: usageDate,
        usedSeconds,
        focusSeconds,
        breakSeconds,
      };
      persistence.writeQueue = persistence.writeQueue
        .catch(() => undefined)
        .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(snapshot)));
      return persistence.writeQueue;
    };

    void AsyncStorage.getItem(storageKey)
      .then((storedUsage) => {
        if (!isCurrent) return;
        if (storedUsage) {
          const parsed = JSON.parse(storedUsage) as {
            date?: string;
            usedSeconds?: number;
            focusSeconds?: number;
            breakSeconds?: number;
          };
          if (parsed.date === usageDate && Number.isFinite(parsed.usedSeconds)) {
            usedSeconds = Math.max(0, Math.floor(parsed.usedSeconds ?? 0));
            focusSeconds = Number.isFinite(parsed.focusSeconds)
              ? Math.max(0, Math.floor(parsed.focusSeconds ?? 0))
              : usedSeconds % EYE_BREAK_INTERVAL_SECONDS;
            breakSeconds = Number.isFinite(parsed.breakSeconds)
              ? Math.max(0, Math.floor(parsed.breakSeconds ?? 0))
              : 0;
          }
        }
        isLoaded = true;
        persistence.persist = persistUsage;
        setScreenTimeUsedSeconds(usedSeconds);
        setEyeBreakSecondsRemaining(breakSeconds);
        setScreenTimeReady(true);
      })
      .catch(() => {
        if (!isCurrent) return;
        isLoaded = true;
        persistence.persist = persistUsage;
        setScreenTimeUsedSeconds(0);
        setEyeBreakSecondsRemaining(0);
        setScreenTimeReady(true);
      });

    const interval = setInterval(() => {
      if (!isCurrent || !isLoaded || AppState.currentState !== "active") return;
      const currentDate = getLocalDateStamp();
      if (currentDate !== usageDate) {
        usageDate = currentDate;
        usedSeconds = 0;
        focusSeconds = 0;
        breakSeconds = 0;
        setScreenTimeUsedSeconds(0);
        setEyeBreakSecondsRemaining(0);
      }

      if (!eyeRestEnabledRef.current) {
        focusSeconds = 0;
        if (breakSeconds > 0) {
          breakSeconds = 0;
          setEyeBreakSecondsRemaining(0);
          void persistUsage().catch((error: unknown) => {
            console.warn("Could not save today's screen-time usage.", error);
          });
        }
      } else if (breakSeconds > 0) {
        breakSeconds -= 1;
        setEyeBreakSecondsRemaining(breakSeconds);
        if (breakSeconds % 5 === 0) {
          void persistUsage().catch((error: unknown) => {
            console.warn("Could not save today's screen-time usage.", error);
          });
        }
        return;
      }

      usedSeconds += 1;
      setScreenTimeUsedSeconds(usedSeconds);
      if (eyeRestEnabledRef.current) {
        focusSeconds += 1;
        if (focusSeconds >= EYE_BREAK_INTERVAL_SECONDS) {
          focusSeconds = 0;
          breakSeconds = EYE_BREAK_DURATION_SECONDS;
          setEyeBreakSecondsRemaining(breakSeconds);
          if (
            notificationsEnabledRef.current &&
            Platform.OS !== "web" &&
            !isRunningInExpoGo()
          ) {
            void getNotificationsModule()
              .then((Notifications) =>
                Notifications?.scheduleNotificationAsync({
                  content: {
                    title: "Eye-rest break",
                    body: "Look away from the screen and relax your eyes for 5 minutes.",
                  },
                  trigger: null,
                })
              )
              .catch((error: unknown) => {
                console.warn("Could not schedule the eye-rest reminder.", error);
              });
          }
        }
      }
      if (usedSeconds % 5 === 0) {
        void persistUsage().catch((error: unknown) => {
          console.warn("Could not save today's screen-time usage.", error);
        });
      }
    }, 1000);

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" && isLoaded) {
        void persistUsage().catch((error: unknown) => {
          console.warn("Could not save screen-time usage when leaving the app.", error);
        });
      }
    });

    return () => {
      isCurrent = false;
      clearInterval(interval);
      appStateSubscription.remove();
      if (screenTimePersistenceRef.current === persistence) {
        persistence.persist = null;
        screenTimePersistenceRef.current = null;
      }
      if (isLoaded) {
        void persistUsage().catch((error: unknown) => {
          console.warn("Could not save screen-time usage when closing the timer.", error);
        });
      }
    };
  }, [firebaseUser?.uid]);

  const persistLearnerProfiles = async (
    profiles: LearnerProfile[],
    profileId: string
  ) => {
    const currentUser = requireFirebaseAuth().currentUser;
    if (!currentUser) throw new Error("Sign in again to manage child profiles.");
    if (!firestore) throw new Error("Cloud profile storage is not configured.");
    const data: StoredLearnerProfiles = {
      version: 2,
      profiles,
      activeProfileId: profileId,
    };
    await setDoc(
      doc(firestore, "users", currentUser.uid, "learnerProfiles", "current"),
      data
    );
    await AsyncStorage.setItem(
      `${PROFILE_STORAGE_PREFIX}${currentUser.uid}`,
      JSON.stringify(data)
    );
    setChildProfiles(profiles);
    setActiveProfileId(profileId);
    const activeProfile = profiles.find((profile) => profile.id === profileId);
    if (activeProfile) {
      setChildName(activeProfile.childName);
      setChildBirthdate(activeProfile.childBirthdate);
      setSelectedIcon(activeProfile.selectedIcon);
    }
  };

  const handleSelectChildProfile = async (profileId: string) => {
    await persistLearnerProfiles(childProfiles, profileId);
  };

  const handleAddChildProfile = async (
    profile: Omit<LearnerProfile, "id" | "grade"> & { grade: Grade }
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await persistLearnerProfiles([...childProfiles, { ...profile, id }], id);
  };

  const handleSetProfileGrade = async (profileId: string, grade: Grade) => {
    const profiles = childProfiles.map((profile) =>
      profile.id === profileId ? { ...profile, grade } : profile
    );
    if (profiles.every((profile, index) => profile === childProfiles[index])) return;

    setChildProfiles(profiles);
    try {
      await persistLearnerProfiles(profiles, activeProfileId ?? profileId);
    } catch (error) {
      setChildProfiles(childProfiles);
      throw error;
    }
  };

  const handleSaveChildGrade = async (grade: Grade) => {
    if (!activeProfileId || !activeLearnerProfile) {
      throw new Error("No child profile is available. Please sign in again or create a profile.");
    }
    const profiles = childProfiles.map((profile) =>
      profile.id === activeProfileId ? { ...profile, grade } : profile
    );
    await persistLearnerProfiles(profiles, activeProfileId);
    setScreen("menu");
  };

  const handleCompleteLesson = async (lessonId: string) => {
    const currentUser = auth?.currentUser;
    if (!currentUser || !activeProfileId || !lessonProgressReady) {
      Alert.alert("Progress not ready", "Please wait for your learner profile to finish loading.");
      return;
    }
    if (completedLessonIdsRef.current.includes(lessonId)) return;

    const previousIds = completedLessonIdsRef.current;
    const nextIds = [...previousIds, lessonId];
    const storageKey = getLessonProgressStorageKey(currentUser.uid, activeProfileId);
    completedLessonIdsRef.current = nextIds;
    setCompletedLessonIds(nextIds);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextIds));
    } catch (error) {
      completedLessonIdsRef.current = previousIds;
      setCompletedLessonIds(previousIds);
      Alert.alert(
        "Lesson progress not saved",
        error instanceof Error ? error.message : "Check device storage and try again."
      );
    }
  };

  const handlePreferencesChange = async (nextPreferences: AccountPreferences) => {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      setPreferences(nextPreferences);
      return;
    }

    try {
      const screenTimePersistence = screenTimePersistenceRef.current;
      if (screenTimePersistence?.storageKey === `${SCREEN_TIME_STORAGE_PREFIX}${currentUser.uid}`) {
        await screenTimePersistence.persist?.();
      }
      await AsyncStorage.setItem(
        `${SETTINGS_STORAGE_PREFIX}${currentUser.uid}`,
        JSON.stringify(nextPreferences)
      );
      setPreferences(nextPreferences);
    } catch (error) {
      Alert.alert(
        "Settings not saved",
        error instanceof Error ? error.message : "Check device storage and try again."
      );
    }
  };

  const handleNotificationPreferenceChange = async (enabled: boolean) => {
    if (enabled && Platform.OS !== "web") {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        throw new Error(
          "Eye-rest notifications require a development build. You can still use LearnBridge in Expo Go without reminders."
        );
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("eye-rest", {
          name: "Eye-rest reminders",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      let permission = await Notifications.getPermissionsAsync();
      if (
        !permission.granted &&
        permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL
      ) {
        permission = await Notifications.requestPermissionsAsync();
      }
      if (
        !permission.granted &&
        permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL
      ) {
        throw new Error("Allow LearnBridge notifications in device settings to enable reminders.");
      }
    }

    handlePreferencesChange({ ...preferences, notificationsEnabled: enabled });
  };

  const clearLearningProgress = async () => {
    const currentUser = auth?.currentUser;
    if (currentUser && activeProfileId) {
      try {
        await AsyncStorage.removeItem(
          getLessonProgressStorageKey(currentUser.uid, activeProfileId)
        );
      } catch (error) {
        Alert.alert(
          "Progress not cleared",
          error instanceof Error ? error.message : "Check device storage and try again."
        );
        return;
      }
    }
    completedLessonIdsRef.current = [];
    setCompletedLessonIds([]);
    setQuizResults({ correct: 0, total: 0, breakdown: [] });
    setScreen("profile");
  };

  const handleClearProgress = () => {
    Alert.alert(
      "Clear learning progress?",
      "This clears the current quiz results and lesson progress. It will not delete your account or child profiles.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Progress",
          style: "destructive",
          onPress: () => void clearLearningProgress(),
        },
      ]
    );
  };

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(
        requireFirebaseAuth(),
        loginEmail,
        loginPassword
      );
      setFirebaseUser(user);
      if (!user.emailVerified) {
        setScreen("verify-email");
        try {
          await sendEmailVerification(user);
          Alert.alert("Verify your email", "A verification link has been sent to your email.");
        } catch (error) {
          Alert.alert("Could not send verification email", getAuthErrorMessage(error));
        }
        return;
      }
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const handlePasswordReset = async (resetEmail: string) => {
    await sendPasswordResetEmail(requireFirebaseAuth(), resetEmail);
  };

  const handleRegister = async (
    profile: LearnerProfile,
    registerEmail: string,
    registerPassword: string
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        requireFirebaseAuth(),
        registerEmail,
        registerPassword
      );
      await updateProfile(user, { displayName: profile.childName });
      if (!firestore) throw new Error("Cloud profile storage is not configured.");
      const profiles: StoredLearnerProfiles = {
        version: 2,
        profiles: [profile],
        activeProfileId: profile.id,
      };
      await AsyncStorage.setItem(
        `${PROFILE_STORAGE_PREFIX}${user.uid}`,
        JSON.stringify(profiles)
      );
      await setDoc(
        doc(firestore, "users", user.uid, "learnerProfiles", "current"),
        profiles
      );
      setFirebaseUser(user);
      setChildProfiles([profile]);
      setActiveProfileId(profile.id);
      setChildName(profile.childName);
      setChildBirthdate(profile.childBirthdate);
      setSelectedIcon(profile.selectedIcon);
      setPreferences(DEFAULT_PREFERENCES);
      setParentEmail(registerEmail);
      setScreen("verify-email");

      try {
        await sendEmailVerification(user);
        Alert.alert("Check your email", `We sent a verification link to ${registerEmail}.`);
      } catch (error) {
        Alert.alert("Account created", getAuthErrorMessage(error));
      }
    } catch (error) {
      throw error;
    }
  };

  const handleResendVerification = async () => {
    try {
      const user = requireFirebaseAuth().currentUser;
      if (!user) throw new Error("Sign in again to verify your email.");
      await sendEmailVerification(user);
      Alert.alert("Email sent", "A new verification link has been sent.");
    } catch (error) {
      Alert.alert("Could not send email", getAuthErrorMessage(error));
    }
  };

  const handleCheckVerification = async () => {
    try {
      const user = requireFirebaseAuth().currentUser;
      if (!user) throw new Error("Sign in again to check your verification status.");
      await reload(user);
      const refreshedUser = requireFirebaseAuth().currentUser;
      if (!refreshedUser?.emailVerified) {
        Alert.alert("Not verified yet", "Open the email link, then check again.");
        return;
      }
      setFirebaseUser(refreshedUser);
      const profile = childProfiles.find((item) => item.id === activeProfileId);
      setScreen(profile?.grade ? "menu" : "grade-selection");
    } catch (error) {
      Alert.alert("Could not check verification", getAuthErrorMessage(error));
    }
  };

  const handleEditRegistration = async () => {
    const currentAuth = requireFirebaseAuth();
    const user = currentAuth.currentUser;
    if (user) {
      await reload(user);
      if (user.emailVerified) {
        setFirebaseUser(user);
        const profile = childProfiles.find((item) => item.id === activeProfileId);
        setScreen(profile?.grade ? "menu" : "grade-selection");
        return;
      }

      await deleteUser(user);
      try {
        await deleteMissionSubmissionsForUser(user.uid);
      } catch (error) {
        Alert.alert(
          "Account removed",
          error instanceof Error
            ? `The local mission submissions could not be fully cleared: ${error.message}`
            : "The local mission submissions could not be fully cleared."
        );
      }
      void Promise.all([
        AsyncStorage.removeItem(`${PROFILE_STORAGE_PREFIX}${user.uid}`),
        AsyncStorage.removeItem(`${SETTINGS_STORAGE_PREFIX}${user.uid}`),
        AsyncStorage.removeItem(`${SCREEN_TIME_STORAGE_PREFIX}${user.uid}`),
      ]).catch(() => undefined);
    }

    setFirebaseUser(null);
    setChildProfiles([]);
    setActiveProfileId(null);
    setScreen("signup");
  };

  const handleSignOut = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (error) {
      Alert.alert("Sign out failed", getAuthErrorMessage(error));
      return;
    }
    setEmail("");
    setPassword("");
    setChildName("");
    setChildBirthdate("");
    setChildProfiles([]);
    setActiveProfileId(null);
    setParentEmail("");
    setSignUpPassword("");
    setSelectedIcon("🦉");
    setPreferences(DEFAULT_PREFERENCES);
    setQuizResults({ correct: 0, total: 0, breakdown: [] });
    completedLessonIdsRef.current = [];
    setCompletedLessonIds([]);
    setScreen("home");
  };

  const handleDeleteAccount = async (password: string) => {
    const user = requireFirebaseAuth().currentUser;
    if (!user?.email) throw new Error("No parent account is signed in.");
    if (!password) throw new Error("Enter the parent account password to verify.");

    try {
      await reload(user);
      if (!user.emailVerified) {
        throw new Error("Verify the parent email before deleting this account.");
      }
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, password)
      );
      await deleteUser(user);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }

    let submissionCleanupError: unknown;
    try {
      await deleteMissionSubmissionsForUser(user.uid);
    } catch (error) {
      submissionCleanupError = error;
    }
    void Promise.all([
      AsyncStorage.removeItem(`${PROFILE_STORAGE_PREFIX}${user.uid}`),
      AsyncStorage.removeItem(`${SETTINGS_STORAGE_PREFIX}${user.uid}`),
      AsyncStorage.removeItem(`${SCREEN_TIME_STORAGE_PREFIX}${user.uid}`),
      AsyncStorage.removeItem(`learnbridge.missions.${user.uid}`),
      ...childProfiles.map((profile) =>
        AsyncStorage.removeItem(getLessonProgressStorageKey(user.uid, profile.id))
      ),
    ]).catch(() => undefined);
    setFirebaseUser(null);
    setEmail("");
    setPassword("");
    setChildName("");
    setChildBirthdate("");
    setChildProfiles([]);
    setActiveProfileId(null);
    setParentEmail("");
    setSignUpPassword("");
    setSelectedIcon(KID_ICONS[0]);
    setPreferences(DEFAULT_PREFERENCES);
    setQuizResults({ correct: 0, total: 0, breakdown: [] });
    completedLessonIdsRef.current = [];
    setCompletedLessonIds([]);
    setScreenTimeUsedSeconds(0);
    setEyeBreakSecondsRemaining(0);
    setScreen("home");
    if (submissionCleanupError) {
      Alert.alert(
        "Account deleted",
        submissionCleanupError instanceof Error
          ? `The local mission submissions could not be fully cleared: ${submissionCleanupError.message}`
          : "The local mission submissions could not be fully cleared."
      );
    }
  };

  const screenTimeLimitReached =
    Boolean(firebaseUser) &&
    screenTimeReady &&
    preferences.screenTimeLimitMinutes > 0 &&
    screenTimeUsedSeconds >= preferences.screenTimeLimitMinutes * 60;
  const accountLoadSteps = [
    { label: "Learner profile", ready: profilesReady },
    { label: "Account preferences", ready: preferencesReady },
    { label: "Screen-time data", ready: screenTimeReady },
  ];
  const accountLoadProgress = Math.round(
    (accountLoadSteps.filter((step) => step.ready).length / accountLoadSteps.length) * 100
  );
  const accountLoading = Boolean(
    firebaseUser &&
      screen !== "home" &&
      screen !== "verify-email" &&
      (!profilesReady || !screenTimeReady || !preferencesReady)
  );
  const accountLoadingSweep = useRef(new Animated.Value(0)).current;
  const [accountLoadingTrackWidth, setAccountLoadingTrackWidth] = useState(0);

  useEffect(() => {
    if (!accountLoading) return;

    const sweep = Animated.loop(
      Animated.timing(accountLoadingSweep, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    sweep.start();
    return () => sweep.stop();
  }, [accountLoading, accountLoadingSweep]);

  if (screen === "home") {
    return (
      <HomeScreen
        onPlay={() => {
          if (!firebaseUser) {
            setScreen("signup");
          } else if (!firebaseUser.emailVerified) {
            setScreen("verify-email");
          } else {
            setScreen("menu");
          }
        }}
        setScreen={setScreen}
      />
    );
  }

  if (accountLoading) {
    return (
      <SafeAreaView style={styles.limitReachedPage}>
        <View style={styles.accountLoadingPanel}>
          <Text style={styles.accountLoadingIcon}>☁️</Text>
          <Text style={styles.accountLoadingTitle}>Getting your account ready</Text>
          <Text style={styles.accountLoadingMessage}>
            We’re loading your saved family information.
          </Text>
          <View
            accessibilityLabel={`Account loading progress: ${accountLoadProgress}%`}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: accountLoadProgress,
            }}
            onLayout={({ nativeEvent }) =>
              setAccountLoadingTrackWidth(nativeEvent.layout.width)
            }
            style={styles.accountLoadingProgressTrack}
          >
            <View
              style={[
                styles.accountLoadingProgressValue,
                { width: `${accountLoadProgress}%` },
              ]}
            />
            <Animated.View
              style={[
                styles.accountLoadingProgressSweep,
                {
                  transform: [
                    {
                      translateX: accountLoadingSweep.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-90, accountLoadingTrackWidth || 300],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.accountLoadingPercent}>
            {accountLoadSteps.filter((step) => step.ready).length} of {accountLoadSteps.length} steps complete
          </Text>
          <View style={styles.accountLoadingSteps}>
            {accountLoadSteps.map((step) => {
              return (
                <View key={step.label} style={styles.accountLoadingStep}>
                  <View style={styles.accountLoadingStepIcon}>
                    {step.ready ? (
                      <Text style={styles.accountLoadingCheck}>✓</Text>
                    ) : (
                      <ActivityIndicator size="small" color="#258EA3" />
                    )}
                  </View>
                  <Text style={styles.accountLoadingStepLabel}>{step.label}</Text>
                  <Text style={styles.accountLoadingStepStatus}>
                    {step.ready ? "Ready" : "Loading"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (eyeBreakSecondsRemaining > 0 && preferences.screenTimeLimitMinutes > 0) {
    return <EyeRestBreakScreen secondsRemaining={eyeBreakSecondsRemaining} />;
  }

  if (screenTimeLimitReached && screen !== "settings" && screen !== "verify-email") {
    return (
      <SafeAreaView style={styles.limitReachedPage}>
        <View style={styles.limitReachedPanel}>
          <Text style={styles.limitReachedTitle}>Today's screen time is up</Text>
          <Text style={styles.limitReachedText}>
            LearnBridge is paused for today. A parent can change the limit in Account Settings.
          </Text>
          <ActionButton onPress={() => setScreen("settings")}>
            PARENT: ACCOUNT SETTINGS
          </ActionButton>
          <ActionButton onPress={() => void handleSignOut()} variant="secondary">
            SIGN OUT
          </ActionButton>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "forgot-password") {
    return (
      <ForgotPasswordScreen
        email={email}
        setEmail={setEmail}
        setScreen={setScreen}
        onSubmit={handlePasswordReset}
      />
    );
  }

  if (screen === "login") {
    return (
      <LoginScreen
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        setScreen={setScreen}
        onSubmit={handleLogin}
      />
    );
  }

  if (screen === "signup") {
    return (
      <SignUpScreen
        childName={childName}
        setChildName={setChildName}
        childBirthdate={childBirthdate}
        setChildBirthdate={setChildBirthdate}
        parentEmail={parentEmail}
        setParentEmail={setParentEmail}
        signUpPassword={signUpPassword}
        setSignUpPassword={setSignUpPassword}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        setScreen={setScreen}
        onRegister={handleRegister}
      />
    );
  }

  if (screen === "verify-email") {
    return (
      <EmailVerificationScreen
        email={firebaseUser?.email ?? parentEmail}
        onResend={handleResendVerification}
        onCheckVerification={handleCheckVerification}
        onEditRegistration={handleEditRegistration}
      />
    );
  }

  if (screen === "grade-selection") {
    return (
      <GradeSetupTutorialScreen
        childName={childName}
        currentGrade={childGrade}
        onContinue={handleSaveChildGrade}
      />
    );
  }

  if (screen === "menu") {
    return (
      <MenuScreen
        childName={childName}
        selectedIcon={selectedIcon}
        privacyMode={preferences.privacyMode}
        completedLessonIds={completedLessonIds}
        lessonProgressReady={lessonProgressReady}
        offlineMode={preferences.offlineMode}
        grade={childGrade}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        screen={screen}
        setScreen={setScreen}
      />
    );
  }

  if (screen === "profile") {
    return (
      <ProfileScreen
        selectedIcon={selectedIcon}
        childName={childName}
        childBirthdate={childBirthdate}
        firebaseUser={firebaseUser}
        privacyMode={preferences.privacyMode}
        onOpenSettings={() => setScreen("settings")}
        onSignOut={handleSignOut}
        screen={screen}
        setScreen={setScreen}
      />
    );
  }

  if (screen === "settings") {
    return (
      <AccountSettingsScreen
        email={firebaseUser?.email ?? parentEmail}
        profiles={childProfiles}
        activeProfileId={activeProfileId}
        preferences={preferences}
        screenTimeUsedSeconds={screenTimeUsedSeconds}
        onBack={() => setScreen("profile")}
        onSelectProfile={(profileId) => void handleSelectChildProfile(profileId)}
        onAddProfile={handleAddChildProfile}
        onSetProfileGrade={handleSetProfileGrade}
        onPreferencesChange={handlePreferencesChange}
        onNotificationPreferenceChange={handleNotificationPreferenceChange}
        onResetPassword={() => {
          const accountEmail = firebaseUser?.email ?? parentEmail;
          if (!accountEmail) throw new Error("No account email is available.");
          return handlePasswordReset(accountEmail);
        }}
        onClearProgress={handleClearProgress}
        onDeleteAccount={handleDeleteAccount}
      />
    );
  }

  if (screen === "missions") {
    return (
      <MissionsScreen
        screen={screen}
        setScreen={setScreen}
        grade={childGrade ?? "K"}
      />
    );
  }

  if (screen === "kinder-lessons") {
    return (
      <KindergartenLessonsScreen
        onBack={() => {
          setCurriculumCategory(null);
          setScreen("menu");
        }}
        onMusicCategoryChange={setCurriculumCategory}
        screenTimeLimitMinutes={preferences.screenTimeLimitMinutes}
        completedLessonIds={completedLessonIds}
        lessonProgressReady={lessonProgressReady}
        onCompleteLesson={(lessonId) => void handleCompleteLesson(lessonId)}
      />
    );
  }
  if (screen === "grade1-lessons") {
    return (
      <GradeOneLessonsScreen
        difficulty={preferences.difficulty}
        onBack={() => {
          setCurriculumCategory(null);
          setScreen("menu");
        }}
        onMusicCategoryChange={setCurriculumCategory}
        screenTimeLimitMinutes={preferences.screenTimeLimitMinutes}
        completedLessonIds={completedLessonIds}
        lessonProgressReady={lessonProgressReady}
        onCompleteLesson={(lessonId) => void handleCompleteLesson(lessonId)}
      />
    );
  }
  if (screen === "grade2-lessons") {
    return (
      <GradeTwoLessonsScreen
        difficulty={preferences.difficulty}
        onBack={() => {
          setCurriculumCategory(null);
          setScreen("menu");
        }}
        onMusicCategoryChange={setCurriculumCategory}
        completedLessonIds={completedLessonIds}
        lessonProgressReady={lessonProgressReady}
        onCompleteLesson={(lessonId) => void handleCompleteLesson(lessonId)}
      />
    );
  }

  if (screen === "tutorial") {
    return (
      <TutorialScreen
        screen={screen}
        setScreen={setScreen}
        onContinue={firebaseUser && !firebaseUser.emailVerified ? () => setScreen("verify-email") : undefined}
      />
    );
  }

  if (screen === "character-select") {
    return (
      <CharacterSelectScreen
        gradeLabel={childGrade ? gradeLabels[childGrade] : "Choose a grade"}
        lessonTitle={lessonContent[selectedCategory].title}
        onSelect={() => setScreen("lesson")}
      />
    );
  }

  if (screen === "lesson") {
    return (
      <LessonScreen
        category={selectedCategory}
        onBack={() => setScreen("character-select")}
        onContinue={() => setScreen("quiz")}
      />
    );
  }

  if (screen === "quiz") {
    return (
      <QuizScreen
        category={selectedCategory}
        difficulty={preferences.difficulty}
        onBack={() => setScreen("lesson")}
        onFinish={(results) => {
          setQuizResults(results);
          void handleCompleteLesson(`grade:${childGrade}:${selectedCategory}`);
          setScreen("results");
        }}
      />
    );
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        childName={preferences.privacyMode ? "Learner" : childName || "Bea"}
        correct={quizResults.correct}
        total={quizResults.total}
        lessonTitle={lessonContent[selectedCategory].title}
        timeLabel="0:24"
        xpEarned={quizResults.correct * 10}
        breakdown={quizResults.breakdown}
        onRetry={() => setScreen("quiz")}
        onNext={() => setScreen("menu")}
      />
    );
  }

  if (screen === "lesson-complete") {
    return (
      <LessonCompleteScreen
        lessonTitle={lessonContent[selectedCategory].title}
        correct={quizResults.correct}
        total={quizResults.total}
        xpEarned={quizResults.correct * 10}
        newBadges={
          quizResults.total > 0 && quizResults.correct === quizResults.total ? 1 : 0
        }
        streakDays={1}
        unlockedLessonTitle="Adding Up at the Market!"
        onNext={() => setScreen("menu")}
        onMenu={() => setScreen("menu")}
      />
    );
  }

  return (
    <HomeScreen
      onPlay={() => setScreen("signup")}
      setScreen={setScreen}
    />
  );
}

const styles = StyleSheet.create({
  eyeBreakPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", padding: 20 },
  eyeBreakPanel: { width: "100%", maxWidth: 420, alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#B8DFCC", borderWidth: 2, borderRadius: 20, padding: 24 },
  eyeBreakIcon: { fontSize: 54, marginBottom: 12 },
  eyeBreakTitle: { color: "#173B53", fontSize: 26, lineHeight: 32, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  eyeBreakMessage: { color: "#36566A", fontSize: 16, lineHeight: 24, textAlign: "center", marginBottom: 22 },
  eyeBreakTimer: { color: "#28543A", fontSize: 48, lineHeight: 56, fontWeight: "900", fontVariant: ["tabular-nums"] },
  eyeBreakCaption: { color: "#46564B", fontSize: 14, lineHeight: 20, fontWeight: "700", marginTop: 2 },
  limitReachedPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", padding: 20 },
  accountLoadingPanel: { width: "100%", maxWidth: 420, alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#B8DFCC", borderWidth: 2, borderRadius: 24, padding: 24 },
  accountLoadingIcon: { fontSize: 42, marginBottom: 8 },
  accountLoadingTitle: { color: "#173B53", fontSize: 24, lineHeight: 30, fontWeight: "900", textAlign: "center" },
  accountLoadingMessage: { color: "#465E6C", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 6, marginBottom: 20 },
  accountLoadingProgressTrack: { width: "100%", height: 12, overflow: "hidden", backgroundColor: "#E7F0EC", borderRadius: 6 },
  accountLoadingProgressValue: { height: "100%", backgroundColor: "#258EA3", borderRadius: 6 },
  accountLoadingProgressSweep: { position: "absolute", left: 0, top: 0, width: 90, height: "100%", backgroundColor: "#81D1D7", opacity: 0.8 },
  accountLoadingPercent: { color: "#173B53", fontSize: 16, fontWeight: "800", marginTop: 8, marginBottom: 14 },
  accountLoadingSteps: { width: "100%", gap: 10 },
  accountLoadingStep: { minHeight: 40, flexDirection: "row", alignItems: "center", backgroundColor: "#F5F9F7", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  accountLoadingStepIcon: { width: 28, height: 28, alignItems: "center", justifyContent: "center", marginRight: 10 },
  accountLoadingCheck: { color: "#23804F", fontSize: 20, fontWeight: "900" },
  accountLoadingStepLabel: { flex: 1, color: "#263F4D", fontSize: 14, fontWeight: "700" },
  accountLoadingStepStatus: { color: "#59737F", fontSize: 12, fontWeight: "700" },
  limitReachedPanel: { width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", borderColor: "#D8E1D7", borderWidth: 1, borderRadius: 14, padding: 22 },
  limitReachedTitle: { color: "#26352B", fontSize: 26, lineHeight: 32, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  limitReachedText: { color: "#46564B", fontSize: 16, lineHeight: 24, textAlign: "center", marginBottom: 18 },
  homePage: { flex: 1, backgroundColor: "transparent", padding: 12 },
  homeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    overflow: "hidden",
    borderRadius: 30,
    shadowColor: "#24546A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  homeCardDay: {
    backgroundColor: "rgba(255, 248, 231, 0.72)",
  },
  homeLogo: { width: 380, height: 380, marginBottom: 4 },
  homeTitle: { color: "#173B53", fontSize: 37, fontWeight: "900", textAlign: "center" },
  homeSubtitle: { color: "#36566A", fontSize: 17, fontWeight: "700", textAlign: "center", marginTop: 5, marginBottom: 22 },
  homeActions: { width: "100%", maxWidth: 360, gap: 10 },
  actionButton: { alignItems: "center", justifyContent: "center", minHeight: 58, paddingHorizontal: 16, borderRadius: 16, backgroundColor: "#F17D65", marginBottom: 6 },
  actionButtonText: { color: "#FFFDF5", fontWeight: "700", fontSize: 16, textAlign: "center" },
  secondaryButton: { backgroundColor: "#258EA3", marginBottom: 6 },
  secondaryButtonText: { color: "#FFFDF5", fontSize: 14, textAlign: "left" },
  pressed: { opacity: 0.7 },
  appPage: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { paddingHorizontal: 12, paddingTop: 1, paddingBottom: 95 },
  appTitle: { color: "#173B53", fontSize: 29, fontWeight: "900", textAlign: "center", marginTop: 39 },
  appSubtitle: { color: "#4A2F22", fontSize: 15, textAlign: "center", marginTop: 3, marginBottom: 19 },
  profileBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFE181", borderRadius: 22, padding: 16, minHeight: 112, marginBottom: 12 },
  profileStatusCard: { backgroundColor: "#FFFDF5", borderRadius: 16, padding: 15, marginBottom: 12 },
  profileStatusTitle: { color: "#173B53", fontSize: 16, fontWeight: "900", marginBottom: 8 },
  profileStatusRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  profileStatusLabel: { color: "#4A2F22", fontSize: 14 },
  profileStatusValue: { color: "#397147", fontSize: 14, fontWeight: "800" },
  profileStatusPending: { color: "#A85B17" },
  avatar: { width: 76, height: 76, textAlign: "center", textAlignVertical: "center", borderRadius: 38, backgroundColor: "#E4F0DF", fontSize: 43, marginRight: 12 },
  profileName: { color: "#4A2F22", fontSize: 17, fontWeight: "800" },
  profileHint: { color: "#4A2F22", marginTop: 5 },
  menuHero: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF7DD", borderRadius: 24, minHeight: 132, padding: 14, marginTop: 14, marginBottom: 12, borderWidth: 2, borderColor: "#FFFFFF" },
  menuMascotStage: { width: 100, height: 100, alignItems: "center", justifyContent: "center", borderRadius: 50, backgroundColor: "#A6E5EE", marginRight: 12 },
  menuMascot: { fontSize: 63 },
  menuSparkle: { position: "absolute", top: 4, right: 12, fontSize: 22 },
  menuBook: { position: "absolute", left: 2, bottom: 4, fontSize: 24 },
  menuGreetingCopy: { flex: 1 },
  menuGreeting: { color: "#173B53", fontSize: 21, fontWeight: "900" },
  menuGreetingSub: { color: "#36566A", fontSize: 14, lineHeight: 20, marginTop: 5 },
  progressCard: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1", borderWidth: 2, borderRadius: 20, padding: 16, marginBottom: 12 },
  cardTitle: { color: "#173B53", fontSize: 16, fontWeight: "900", textAlign: "center", marginBottom: 11 },
  progressTrack: { height: 20, backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden" },
  progressValue: { width: "62%", height: "100%", backgroundColor: "#F17D65" },
  streakBadge: { alignSelf: "center", backgroundColor: "#FFE181", borderRadius: 14, paddingVertical: 7, paddingHorizontal: 12, marginTop: 10 },
  streakBadgeText: { color: "#173B53", fontSize: 13, fontWeight: "800" },
  lessonsCard: { backgroundColor: "#FFF0AA", borderColor: "#F3C451", borderWidth: 2, borderRadius: 20, paddingBottom: 13, marginBottom: 12, paddingHorizontal: 15, paddingTop: 15 },
  cardHeading: { color: "#173B53", fontSize: 17, fontWeight: "900", marginBottom: 11, textAlign: "center" },
  lessonBoardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  lessonBoardIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#B8EDF3" },
  lessonBoardIconText: { fontSize: 30 },
  lessonBoardCopy: { flex: 1 },
  lessonBoardTitle: { color: "#173B53", fontSize: 20, fontWeight: "900", marginBottom: 3 },
  gradeLessonGrid: { gap: 12 },
  gradeLessonGridLandscape: { flexDirection: "row", flexWrap: "wrap" },
  gradeLessonCard: { backgroundColor: "#FFF9E9", borderRadius: 16, padding: 13 },
  lockedGradeLessonCard: { borderColor: "#B9C6C4", borderWidth: 1 },
  lockedGradeLessonText: { color: "#6E8190" },
  gradeLessonCardLandscape: { flexBasis: "48%", flexGrow: 1, marginBottom: 0 },
  lessonPreviewTitle: { color: "#173B53", fontSize: 18, fontWeight: "900", marginBottom: 5 },
  lessonContentPreview: { backgroundColor: "#FFF9E9", borderRadius: 14, padding: 12, marginTop: 12, marginBottom: 12 },
  lessonPreviewHeading: { color: "#315C4A", fontSize: 12, fontWeight: "900", marginBottom: 5 },
  lessonPreviewHint: { color: "#36566A", fontSize: 13, lineHeight: 19, marginTop: 7 },
  lessonPreviewNotice: { color: "#8C4B22", fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 8 },
  lockedLesson: { backgroundColor: "#E2E8E7", borderRadius: 15, padding: 14, marginTop: 6 },
  lockedLessonText: { color: "#36566A", fontSize: 14, fontWeight: "700" },
  offlineCard: { backgroundColor: "#E4F6EF", borderColor: "#9CCDBA", borderWidth: 1.5, borderRadius: 22, padding: 18, marginTop: 3, marginBottom: 10 },
  offlineModePanel: { backgroundColor: "#E4F6EF", borderColor: "#9CCDBA", borderWidth: 1.5, borderRadius: 22, padding: 18, marginTop: 10 },
  offlineMissionIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#C8EBDD" },
  offlineMissionEmoji: { fontSize: 28 },
  offlineCopy: { flex: 1, paddingRight: 4 },
  missionCardHeading: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  openMissionsButton: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 14 },
  cardBody: { color: "#36566A", fontSize: 15, lineHeight: 22 },
  openButton: { color: "#173B53", fontWeight: "800", fontSize: 14 },
  pageTitle: { color: "#173B53", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  missionBackButton: { alignSelf: "flex-start", backgroundColor: "#258EA3", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  missionBackButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  formMessage: { color: "#9C3E32", fontSize: 14, lineHeight: 20, fontWeight: "700", marginBottom: 12 },
  successMessage: { color: "#397147", fontSize: 14, lineHeight: 20, fontWeight: "700", marginBottom: 12 },
  pageSubtitle: { color: "#36566A", fontSize: 16, lineHeight: 23, textAlign: "center", marginBottom: 18 },
  missionCard: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF", borderWidth: 2, borderRadius: 20, padding: 15, marginBottom: 14, shadowColor: "#24546A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 4, elevation: 3 },
  missionSubmissionStatus: { backgroundColor: "#EAF5F7", borderRadius: 10, marginBottom: 12, padding: 10 },
  missionSubmissionStatusText: { color: "#173B53", fontSize: 13, fontWeight: "900" },
  missionSubmissionError: { color: "#9C3E32", fontSize: 12, lineHeight: 17, marginTop: 4 },
  missionRetryUpload: { alignSelf: "flex-start", backgroundColor: "#258EA3", borderRadius: 8, marginTop: 8, paddingHorizontal: 12, paddingVertical: 8 },
  missionRetryUploadText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  missionReviewContainer: { width: "100%", maxWidth: 460, maxHeight: "92%" },
  missionReviewScroll: { flexGrow: 1, justifyContent: "flex-end", alignItems: "flex-end", paddingVertical: 16 },
  missionPendingPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF5F7", padding: 24 },
  missionPendingIcon: { fontSize: 68, marginBottom: 12 },
  missionPendingTitle: { color: "#173B53", fontSize: 27, lineHeight: 34, fontWeight: "900", textAlign: "center" },
  missionPendingMission: { color: "#397147", fontSize: 18, lineHeight: 24, fontWeight: "900", textAlign: "center", marginTop: 10 },
  missionPendingMessage: { color: "#36566A", fontSize: 16, lineHeight: 24, textAlign: "center", marginTop: 12 },
  missionPendingEmail: { color: "#173B53", fontSize: 14, lineHeight: 20, fontWeight: "800", textAlign: "center", marginTop: 10 },
  missionPendingSpinner: { marginTop: 24 },
  missionPendingHint: { color: "#526778", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 14 },
  missionContinueButton: { minHeight: 48, backgroundColor: "#258EA3", borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 20, paddingHorizontal: 18 },
  missionContinueButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  photoReviewHeading: { color: "#173B53", fontSize: 15, fontWeight: "900", marginTop: 6, marginBottom: 8, textAlign: "center" },
  missionPhotoInstruction: { color: "#397147", fontSize: 13, lineHeight: 19, fontWeight: "800", marginTop: 8 },
  missionPhotoPreview: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#EAF5F7", marginBottom: 10 },
  missionPhotoPlaceholder: { width: "100%", height: 110, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF5F7", borderRadius: 12, marginBottom: 10 },
  missionPhotoPlaceholderText: { color: "#36566A", fontSize: 15, fontWeight: "800" },
  photoActionRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  photoActionButton: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", backgroundColor: "#258EA3", borderRadius: 11, paddingHorizontal: 8 },
  photoLibraryButton: { backgroundColor: "#397147" },
  photoActionButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", textAlign: "center" },
  missionInlineError: { color: "#9C3E32", fontSize: 13, lineHeight: 19, fontWeight: "700", marginBottom: 10 },
  missionActionDisabled: { opacity: 0.5 },
  missionResultContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 24 },
  missionResultPage: { flex: 1, backgroundColor: "#EAF5F7" },
  missionResultCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 22, padding: 22, shadowColor: "#24546A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 4, elevation: 3 },
  missionResultIcon: { fontSize: 64, marginBottom: 6 },
  missionResultMessage: { color: "#36566A", fontSize: 16, lineHeight: 23, textAlign: "center", marginBottom: 12 },
  missionResultImage: { width: "100%", height: 220, borderRadius: 14, backgroundColor: "#EAF5F7", marginBottom: 14 },
  missionResultBadge: { backgroundColor: "#D5F5EB", borderRadius: 16, paddingHorizontal: 15, paddingVertical: 9, marginBottom: 18 },
  missionResultBadgeText: { color: "#28543A", fontSize: 14, fontWeight: "900" },
  missionResultButton: { width: "100%", minHeight: 52, alignItems: "center", justifyContent: "center", backgroundColor: "#F17D65", borderRadius: 14, paddingHorizontal: 16 },
  missionResultSecondaryButton: { backgroundColor: "#258EA3", marginTop: 10 },
  missionResultButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  missionIllustration: { height: 138, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 14, position: "relative" },
  missionIllustrationBlue: { backgroundColor: "#B8EDF3" },
  missionIllustrationYellow: { backgroundColor: "#FFE9A0" },
  missionArt: { fontSize: 76 },
  missionArtSparkle: { position: "absolute", top: 10, right: 18, color: "#FFFFFF", fontSize: 34, fontWeight: "900" },
  missionHeading: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  missionId: { color: "#FFFFFF", backgroundColor: "#258EA3", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10, fontWeight: "900", marginRight: 10 },
  missionTitle: { flex: 1, color: "#173B53", fontSize: 18, fontWeight: "900", lineHeight: 24 },
  missionSkill: { color: "#36566A", fontSize: 14, fontWeight: "800", marginBottom: 10 },
  tutorialCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#D5F5EB", borderWidth: 2, borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: "#24546A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.11, shadowRadius: 3, elevation: 2 },
  tutorialIcon: { width: 58, height: 58, overflow: "hidden", textAlign: "center", textAlignVertical: "center", fontSize: 37, marginRight: 14, backgroundColor: "#FFE9A0", borderRadius: 17 },
  tutorialCopy: { flex: 1 },
  gradeSetupCard: { backgroundColor: "#FFF8E7", borderColor: "#F3C451", borderWidth: 2, borderRadius: 20, padding: 16, marginTop: 4, marginBottom: 20 },
  gradeSetupTitle: { color: "#173B53", fontSize: 20, lineHeight: 26, fontWeight: "900", textAlign: "center" },
  gradeSetupHint: { color: "#36566A", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 5, marginBottom: 12 },
  gradeSetupOptions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 14 },
  gradeSetupOption: { width: "47%", minHeight: 66, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#D5F5EB", borderRadius: 14, paddingHorizontal: 8 },
  gradeSetupOptionSelected: { backgroundColor: "#D5F5EB", borderColor: "#759B57" },
  gradeSetupEmoji: { fontSize: 20 },
  gradeSetupOptionText: { color: "#173B53", fontSize: 14, fontWeight: "800" },
  gradeSetupOptionTextSelected: { color: "#28543A" },
  gradeSetupSubmit: { minHeight: 50, borderRadius: 12, backgroundColor: "#759B57", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  gradeSetupSubmitDisabled: { opacity: 0.55 },
  gradeSetupSubmitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  bottomNavigation: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#FFFFFF", height: 72, paddingHorizontal: 8, borderTopWidth: 2, borderTopColor: "#D5F5EB" },
  navButton: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#FFFFFF" },
  navButtonActive: { backgroundColor: "#D5F5EB" },
  navButtonText: { color: "#36566A", fontSize: 27 },
  navButtonTextActive: { color: "#F17D65" },
  addButton: { width: 60, height: 60, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#F17D65", marginTop: -24, borderWidth: 3, borderColor: "#FFFFFF" },
  addButtonText: { color: "#FFFFFF", fontSize: 31, lineHeight: 34 },
  bottomNavigationDark: { backgroundColor: "#202B40", borderTopColor: "#35445F" },
  navButtonDark: { backgroundColor: "#29364D" },
  navButtonActiveDark: { backgroundColor: "#384B69" },
  navButtonTextDark: { color: "#C2CDDF" },
  navButtonTextActiveDark: { color: "#F1D9A4" },
  addButtonDark: { backgroundColor: "#587C91", borderColor: "#202B40" },
  actionButtonPrimaryDark: { backgroundColor: "#9A685E" },
  actionButtonSecondaryDark: { backgroundColor: "#456C7B" },
  darkPanel: { backgroundColor: "#253149", borderColor: "#3B4A64" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkAccent: { backgroundColor: "#3B5067", borderColor: "#50617A" },
  darkTrack: { backgroundColor: "#46546A" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
  loginContainer: { flex: 1, backgroundColor: "transparent" },
  verificationContainer: { flex: 1, justifyContent: "center", padding: 20, gap: 12 },
  resendButton: { backgroundColor: "#587449" },
  editRegistrationButton: { backgroundColor: "#B85B42" },
  loginInner: { flex: 1, justifyContent: "center", padding: 20 },
  loginHeader: { marginBottom: 24 },
  authMascotBanner: { minHeight: 88, flexDirection: "row", alignItems: "center", backgroundColor: "#D5F5E7", borderRadius: 20, padding: 10, marginBottom: 14 },
  authMascotArt: { width: 68, height: 68, alignItems: "center", justifyContent: "center", backgroundColor: "#FFE181", borderRadius: 22, marginRight: 12 },
  authMascotOwl: { fontSize: 43 },
  authMascotStar: { position: "absolute", right: 0, top: 0, fontSize: 17 },
  authMascotCopy: { flex: 1 },
  authMascotTitle: { color: "#173B53", fontSize: 15, fontWeight: "900" },
  authMascotMessage: { color: "#36566A", fontSize: 14, lineHeight: 20, marginTop: 3 },
  formContainer: { backgroundColor: "#FFF8E7", borderRadius: 22, padding: 20, shadowColor: "#24546A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 6, elevation: 3 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: "#4A2F22", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  inputHint: { color: "#766B5D", fontSize: 12, lineHeight: 17, marginTop: 5 },
  birthdateRow: { flexDirection: "row", gap: 10 },
  birthdatePart: { flex: 1 },
  birthdatePartLabel: { color: "#4A2F22", fontSize: 12, fontWeight: "700", marginBottom: 6 },
  birthdateInput: { textAlign: "center", paddingHorizontal: 6 },
  fieldError: { color: "#9C3E32", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 5 },
  textInput: { width: "100%", height: 48, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DCE8CE", borderRadius: 12, paddingHorizontal: 14, color: "#4A2F22" },
  errorInput: { borderColor: "#E53E3E", borderWidth: 2 }, // Highlight style for incorrect inputs
  submitButton: { width: "100%", height: 50, backgroundColor: "#759B57", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  backButton: { width: "100%", height: 50, backgroundColor: "#C62828", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  disabledButton: { opacity: 0.65 },
  submitButtonText: { color: "#FFFDF5", fontWeight: "700", fontSize: 16 },
  forgotPasswordRow: { alignItems: "flex-end", marginTop: -8, marginBottom: 12 },
  forgotPasswordLink: { color: "#397147", fontSize: 14, fontWeight: "700" },
  backToSignIn: { width: "100%", minHeight: 46, backgroundColor: "#C62828", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { color: "#4A2F22", fontSize: 14 },
  footerLink: { color: "#759B57", fontWeight: "700", fontSize: 14 },
  iconPickerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  iconOption: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F0F4EC", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  selectedIconOption: { borderColor: "#759B57", backgroundColor: "#E4F0DF" },
  iconOptionText: { fontSize: 24 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(23,59,83,0.55)", alignItems: "flex-end", justifyContent: "flex-end", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#FFF8E7", borderRadius: 22, padding: 20 },
});
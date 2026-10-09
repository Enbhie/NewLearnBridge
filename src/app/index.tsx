import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
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
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    AppState,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountSettingsScreen, {
    type AccountPreferences,
    type LearnerProfile,
} from "../components/AccountSettingsScreen";
import { AnimatedPressable as Pressable } from "../components/AnimatedPressable";
import CharacterSelectScreen from "../components/CharacterSelectScreen";
import LessonCompleteScreen from "../components/LessonCompleteScreen";
import LessonScreen from "../components/LessonScreen";
import QuizScreen from "../components/QuizScreen";
import ResultsScreen from "../components/ResultsScreen";
import { getCompletedMissions, markMissionComplete } from "../data/missionProgress";
import { offlineMissions, type Grade, type OfflineMission } from "../data/offlineMissions";
import { auth, firebaseConfigured } from "../firebase";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

type Screen =
  | "home"
  | "login"
  | "forgot-password"
  | "signup"
  | "verify-email"
  | "menu"
  | "profile"
  | "settings"
  | "missions"
  | "tutorial"
  | "character-select"
  | "lesson"
  | "quiz"
  | "lesson-complete"
  | "results";

type Mission = {
  id: string;
  title: string;
  skill: string;
  description: string;
};

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
const EYE_BREAK_INTERVAL_SECONDS = 15 * 60;
const EYE_BREAK_DURATION_SECONDS = 5 * 60;
const DEFAULT_PREFERENCES: AccountPreferences = {
  difficulty: "standard",
  notificationsEnabled: false,
  offlineMode: false,
  privacyMode: false,
  screenTimeLimitMinutes: 0,
};

type StoredLearnerProfiles = {
  version: 2;
  profiles: LearnerProfile[];
  activeProfileId: string;
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
    throw new Error("Firebase is not configured. Set the EXPO_PUBLIC_FIREBASE values in .env.local.");
  }
  return auth;
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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === "secondary" && styles.secondaryButton,
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
  onPress,
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
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
        active && styles.navButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>
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

  return (
    <View style={styles.bottomNavigation}>
      <NavButton label="▣" active={screen === "missions"} onPress={() => setScreen("missions")} />
      <NavButton label="♧" active={screen === "menu"} onPress={() => setScreen("menu")} />
      <Pressable
        accessibilityLabel="Open camera shape scanner"
        accessibilityRole="button"
        onPress={() => router.push("/shape-recognition")}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </Pressable>
      <NavButton label="⚙" active={screen === "tutorial"} onPress={() => setScreen("tutorial")} />
      <NavButton
        label="♙"
        accessibilityLabel="Profile"
        active={screen === "profile"}
        onPress={() => setScreen("profile")}
      />
    </View>
  );
}

// --- SCREEN COMPONENTS (OUTSIDE APP) ---


function HomeScreen({
  setScreen,
}: {
  setScreen: (s: Screen) => void;
}) {
  return (
    <SafeAreaView style={styles.homePage}>
      <View style={styles.homeCard}>
        <View style={styles.owlScene}>
          <View style={styles.owlSun}><Text style={styles.owlSunText}>☀️</Text></View>
          <Text style={styles.owlStickerLeft}>📚</Text>
          <View style={styles.owl}>
            <Text style={styles.owlHat}>🎓</Text>
            <Text style={styles.owlFace}>🦉</Text>
          </View>
          <Text style={styles.owlStickerRight}>🌟</Text>
        </View>

        <Text style={styles.homeTitle}>LearnBridge</Text>
        <Text style={styles.homeSubtitle}>Little learners. Big discoveries.</Text>

        <View style={styles.homeActions}>
          <ActionButton onPress={() => setScreen("signup")}>LET'S PLAY!</ActionButton>

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

  const handleLogin = async () => {
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
              style={[styles.submitButton, { backgroundColor: "#9A9488", marginTop: 12 }]}
              onPress={() => setScreen("home")}
            >
              <Text style={styles.submitButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
              <Text style={styles.forgotPasswordLink}>Back to Sign In</Text>
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
      if (firebaseConfigured) setFormMessage(getAuthErrorMessage(error));
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
                Firebase setup is required. Fill in .env.local from .env.example, then restart Expo.
              </Text>
            )}
            {formMessage ? <Text style={styles.formMessage}>{formMessage}</Text> : null}
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

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => setScreen("login")}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.submitButton, { backgroundColor: "#9A9488", marginTop: 12 }]}
              onPress={() => setScreen("home")}
            >
              <Text style={styles.submitButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  password,
  onResend,
  onCheckVerification,
  onEditRegistration,
}: {
  email: string;
  password: string;
  onResend: () => Promise<void>;
  onCheckVerification: () => Promise<void>;
  onEditRegistration: (password: string) => Promise<void>;
}) {
  const [isWorking, setIsWorking] = useState(false);
  const [editError, setEditError] = useState("");
  const [reauthPassword, setReauthPassword] = useState(password);

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
        <Text style={styles.inputLabel}>Password to change registration details</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your account password"
          placeholderTextColor="#9CA3AF"
          value={reauthPassword ?? ""}
          onChangeText={setReauthPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isWorking}
        />
        <Pressable
          accessibilityRole="button"
          style={[styles.submitButton, styles.editRegistrationButton]}
          onPress={() => {
            setEditError("");
            void runAction(() => onEditRegistration(reauthPassword)).catch((error: unknown) => {
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
  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.profileBanner}>
          <Text style={styles.avatar}>{selectedIcon}</Text>
          <View>
            <Text style={styles.profileName}>
              {privacyMode ? "Learner" : childName || "User_Name"}
            </Text>
            <Text style={styles.profileHint}>
              {privacyMode
                ? "Personal details hidden"
                : `Age: ${getAgeFromBirthdate(childBirthdate) ?? "Not set"} | Keep learning!`}
            </Text>
          </View>
        </View>

        <View style={styles.profileStatusCard}>
          <Text style={styles.profileStatusTitle}>Profile status</Text>
          <View style={styles.profileStatusRow}>
            <Text style={styles.profileStatusLabel}>Account</Text>
            <Text style={styles.profileStatusValue}>
              {firebaseUser ? "Signed in" : "Guest"}
            </Text>
          </View>
          <View style={styles.profileStatusRow}>
            <Text style={styles.profileStatusLabel}>Email</Text>
            <Text
              style={[
                styles.profileStatusValue,
                !firebaseUser?.emailVerified && styles.profileStatusPending,
              ]}
            >
              {firebaseUser?.emailVerified ? "Verified" : "Not verified"}
            </Text>
          </View>
          <View style={styles.profileStatusRow}>
            <Text style={styles.profileStatusLabel}>Learner profile</Text>
            <Text style={styles.profileStatusValue}>
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
  lessonProgress,
  offlineMode,
  screen,
  setScreen,
}: {
  childName: string;
  selectedIcon: string;
  privacyMode: boolean;
  lessonProgress: number;
  offlineMode: boolean;
  screen: Screen;
  setScreen: (s: Screen) => void;
}) {
  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuHero}>
          <View style={styles.menuMascotStage}>
            <Text style={styles.menuSparkle}>✨</Text>
            <Text style={styles.menuMascot}>{selectedIcon || "🦉"}</Text>
            <Text style={styles.menuBook}>📘</Text>
          </View>
          <View style={styles.menuGreetingCopy}>
            <Text style={styles.menuGreeting}>
              {privacyMode ? "Hello, learner!" : `Hi, ${childName || "friend"}!`}
            </Text>
            <Text style={styles.menuGreetingSub}>Ready for a little adventure?</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>PROGRESS BAR</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressValue, { width: `${lessonProgress}%` }]} />
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🔥 1 DAY STREAK</Text>
          </View>
        </View>

        {offlineMode ? (
          <View style={styles.offlineModePanel}>
            <Text style={styles.cardHeading}>Offline-only mode</Text>
            <Text style={styles.cardBody}>
              Online lessons are hidden. Your local math missions are ready to play.
            </Text>
            <ActionButton onPress={() => setScreen("missions")}>
              OPEN OFFLINE MISSIONS
            </ActionButton>
          </View>
        ) : (
          <>
            <View style={styles.lessonsCard}>
              <Text style={styles.cardHeading}>Lesson Plans</Text>
              <ActionButton onPress={() => setScreen("lesson")} variant="primary">
                ▶ Continue Lesson
              </ActionButton>
              <ActionButton onPress={() => setScreen("lesson")} variant="secondary">
                Lesson 1: Number Sense to 1000s
              </ActionButton>
              <View style={styles.lockedLesson}>
                <Text style={styles.lockedLessonText}>🔒 Lesson 2: Intro to Addition & Subtracting</Text>
              </View>
            </View>

            <View style={styles.offlineCard}>
              <View style={styles.offlineCopy}>
                <Text style={styles.cardHeading}>Offline Missions</Text>
                <Text style={styles.cardBody}>Practice math through real-life Filipino experiences.</Text>
              </View>
              <Pressable onPress={() => setScreen("missions")} accessibilityRole="button">
                <Text style={styles.openButton}>Open missions →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
      <BottomNavigation screen={screen} setScreen={setScreen} />
    </SafeAreaView>
  );
}

  const GRADES: Grade[] = ["K", "1", "2", "3"];
  function MissionsScreen({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) 
  {
  const router = useRouter();
  const [grade, setGrade] = useState<Grade>("K");
  const [completed, setCompleted] = useState<string[]>([]);
  const [pending, setPending] = useState<OfflineMission | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const gradeMissions = offlineMissions.filter((mission) => mission.grade === grade);
  const areaIcons = { Math: "🔢", Science: "🔬", "Reading & Writing": "📖" };

  // reload checkmarks whenever this screen is shown (e.g. back from the scanner)
  useFocusEffect(
    useCallback(() => {
      void getCompletedMissions().then(setCompleted);
    }, [])
  );

  const closeCheck = () => {
    setPending(null);
    setPhotoUri(null);
  };

  const confirmMission = async () => {
    if (!pending) return;
    await markMissionComplete(pending.id);
    setCompleted(await getCompletedMissions());
    closeCheck();
  };

  const takePhoto = async (mission: OfflineMission) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      const result = permission.granted
        ? await ImagePicker.launchCameraAsync({ quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
      if (result.canceled) return;
      setPhotoUri(result.assets[0].uri);
      setPending(mission);
    } catch {
      Alert.alert("Could not open the camera", "Please try again.");
    }
  };

  const startMission = (mission: OfflineMission) => {
    if (mission.submission === "shape-scan") {
      router.push({ pathname: "/shape-recognition", params: { missionId: mission.id } });
    } else if (mission.submission === "photo") {
      void takePhoto(mission);
    } else {
      setPending(mission);
    }
  };

  return (
    <SafeAreaView style={styles.appPage}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Offline Missions</Text>
        <Text style={styles.pageSubtitle}>Pick a mission and try it at home!</Text>

        <View style={styles.gradeRow}>
          {GRADES.map((g) => (
            <Pressable
              key={g}
              accessibilityRole="button"
              onPress={() => setGrade(g)}
              style={[styles.gradeChip, grade === g && styles.gradeChipActive]}
            >
              <Text style={[styles.gradeChipText, grade === g && styles.gradeChipTextActive]}>
                {g === "K" ? "K" : `Grade ${g}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {gradeMissions.map((mission) => {
          const done = completed.includes(mission.id);
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
              <ActionButton onPress={() => startMission(mission)}>
                {done ? "DO IT AGAIN" : "START MISSION"}
              </ActionButton>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!pending} transparent animationType="fade" onRequestClose={closeCheck}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardHeading}>{pending?.title}</Text>
            <Text style={styles.cardBody}>{pending?.task}</Text>
            <Text style={[styles.missionSkill, { marginTop: 12 }]}>
              Parent check: {pending?.parentCheck}
            </Text>
            {photoUri ? (
              <Text style={styles.cardBody}>📸 Photo taken — please look at it together.</Text>
            ) : null}
            <ActionButton onPress={() => void confirmMission()}>PARENT CONFIRMS ✓</ActionButton>
            <ActionButton onPress={closeCheck} variant="secondary">
              NOT YET
            </ActionButton>
          </View>
        </View>
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

// --- MAIN APP COMPONENT ---

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [childName, setChildName] = useState("");
  const [childBirthdate, setChildBirthdate] = useState("");
  const [childProfiles, setChildProfiles] = useState<LearnerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [parentEmail, setParentEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🦉");
  const [preferences, setPreferences] = useState<AccountPreferences>(DEFAULT_PREFERENCES);
  const [preferencesReady, setPreferencesReady] = useState(false);

  const [quizResults, setQuizResults] = useState<{
    correct: number;
    total: number;
    breakdown: { label: string; answer: string; correct: boolean }[];
  }>({ correct: 0, total: 0, breakdown: [] });
  const [lessonProgress, setLessonProgress] = useState(0);
  const [screenTimeUsedSeconds, setScreenTimeUsedSeconds] = useState(0);
  const [screenTimeReady, setScreenTimeReady] = useState(false);
  const [eyeBreakSecondsRemaining, setEyeBreakSecondsRemaining] = useState(0);
  const notificationsEnabledRef = useRef(preferences.notificationsEnabled);

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setPreferencesReady(false);
        return;
      }

      setPreferencesReady(false);
      setParentEmail(user.email ?? "");
      void AsyncStorage.getItem(`${PROFILE_STORAGE_PREFIX}${user.uid}`)
        .then(async (storedProfile) => {
          if (!storedProfile || auth?.currentUser?.uid !== user.uid) return;
          const parsed = JSON.parse(storedProfile) as Partial<StoredLearnerProfiles> &
            Partial<LearnerProfile>;
          const profiles = Array.isArray(parsed.profiles)
            ? parsed.profiles
            : parsed.childName
              ? [{
                  id: `legacy-${user.uid}`,
                  childName: parsed.childName,
                  childBirthdate: parsed.childBirthdate ?? "",
                  selectedIcon: parsed.selectedIcon ?? KID_ICONS[0],
                }]
              : [];
          const activeId = profiles.some((profile) => profile.id === parsed.activeProfileId)
            ? parsed.activeProfileId!
            : profiles[0]?.id ?? null;
          setChildProfiles(profiles);
          setActiveProfileId(activeId);
          const activeProfile = profiles.find((profile) => profile.id === activeId);
          if (activeProfile) {
            setChildName(activeProfile.childName);
            setChildBirthdate(activeProfile.childBirthdate);
            setSelectedIcon(activeProfile.selectedIcon);
          }
          if (profiles.length && !Array.isArray(parsed.profiles)) {
            await AsyncStorage.setItem(
              `${PROFILE_STORAGE_PREFIX}${user.uid}`,
              JSON.stringify({ version: 2, profiles, activeProfileId: activeId })
            );
          }
        })
        .catch(() => undefined);

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

      setScreen((currentScreen) =>
        user.emailVerified
          ? currentScreen === "home" || currentScreen === "verify-email"
            ? "menu"
            : currentScreen
          : currentScreen === "tutorial"
            ? "tutorial"
            : "verify-email"
      );
    });
  }, []);

  useEffect(() => {
    notificationsEnabledRef.current = preferences.notificationsEnabled;
  }, [preferences.notificationsEnabled]);

  useEffect(() => {
    const accountId = firebaseUser?.uid;
    if (!accountId) {
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
    setScreenTimeReady(false);

    const persistUsage = () => {
      void AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ date: usageDate, usedSeconds, focusSeconds, breakSeconds })
      ).catch(() => undefined);
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
        setScreenTimeUsedSeconds(usedSeconds);
        setEyeBreakSecondsRemaining(breakSeconds);
        setScreenTimeReady(true);
      })
      .catch(() => {
        if (!isCurrent) return;
        isLoaded = true;
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
        setEyeBreakSecondsRemaining(0);
      }

      if (breakSeconds > 0) {
        breakSeconds -= 1;
        setEyeBreakSecondsRemaining(breakSeconds);
        if (breakSeconds % 5 === 0) persistUsage();
        return;
      }

      usedSeconds += 1;
      focusSeconds += 1;
      setScreenTimeUsedSeconds(usedSeconds);
      if (focusSeconds >= EYE_BREAK_INTERVAL_SECONDS) {
        focusSeconds = 0;
        breakSeconds = EYE_BREAK_DURATION_SECONDS;
        setEyeBreakSecondsRemaining(breakSeconds);
        if (notificationsEnabledRef.current && Platform.OS !== "web") {
          void Notifications.scheduleNotificationAsync({
            content: {
              title: "Eye-rest break",
              body: "Look away from the screen and relax your eyes for 5 minutes.",
            },
            trigger: null,
          }).catch(() => undefined);
        }
      }
      if (usedSeconds % 5 === 0) persistUsage();
    }, 1000);

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" && isLoaded) persistUsage();
    });

    return () => {
      isCurrent = false;
      clearInterval(interval);
      appStateSubscription.remove();
      if (isLoaded) persistUsage();
    };
  }, [firebaseUser?.uid]);

  const persistLearnerProfiles = async (
    profiles: LearnerProfile[],
    profileId: string
  ) => {
    const currentUser = requireFirebaseAuth().currentUser;
    if (!currentUser) throw new Error("Sign in again to manage child profiles.");
    const data: StoredLearnerProfiles = {
      version: 2,
      profiles,
      activeProfileId: profileId,
    };
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

  const handleAddChildProfile = async (profile: Omit<LearnerProfile, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await persistLearnerProfiles([...childProfiles, { ...profile, id }], id);
  };

  const handlePreferencesChange = (nextPreferences: AccountPreferences) => {
    setPreferences(nextPreferences);
    const currentUser = auth?.currentUser;
    if (!currentUser) return;
    void AsyncStorage.setItem(
      `${SETTINGS_STORAGE_PREFIX}${currentUser.uid}`,
      JSON.stringify(nextPreferences)
    ).catch(() => Alert.alert("Settings not saved", "Check device storage and try again."));
  };

  const handleNotificationPreferenceChange = async (enabled: boolean) => {
    if (enabled && Platform.OS !== "web") {
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

  const handleClearProgress = () => {
    Alert.alert(
      "Clear learning progress?",
      "This clears the current quiz results and lesson progress. It will not delete your account or child profiles.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Progress",
          style: "destructive",
          onPress: () => {
            setQuizResults({ correct: 0, total: 0, breakdown: [] });
            setLessonProgress(0);
            setScreen("profile");
          },
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
      setScreen("menu");
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
      await AsyncStorage.setItem(
        `${PROFILE_STORAGE_PREFIX}${user.uid}`,
        JSON.stringify({
          version: 2,
          profiles: [profile],
          activeProfileId: profile.id,
        } satisfies StoredLearnerProfiles)
      );
      setFirebaseUser(user);
      setChildProfiles([profile]);
      setActiveProfileId(profile.id);
      setChildName(profile.childName);
      setChildBirthdate(profile.childBirthdate);
      setSelectedIcon(profile.selectedIcon);
      setPreferences(DEFAULT_PREFERENCES);
      setParentEmail(registerEmail);
      setScreen("tutorial");

      try {
        await sendEmailVerification(user);
        Alert.alert("Check your email", `We sent a verification link to ${registerEmail}.`);
      } catch (error) {
        Alert.alert("Account created", getAuthErrorMessage(error));
      }
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
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
      setScreen("menu");
    } catch (error) {
      Alert.alert("Could not check verification", getAuthErrorMessage(error));
    }
  };

  const handleEditRegistration = async (password: string) => {
    const currentAuth = requireFirebaseAuth();
    const user = currentAuth.currentUser;
    if (user) {
      await reload(user);
      if (user.emailVerified) {
        setFirebaseUser(user);
        setScreen("menu");
        return;
      }

      if (!user.email || !password) {
        throw new Error("Enter your account password to continue.");
      }
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, password)
      );
      await deleteUser(user);
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
    setLessonProgress(0);
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

    void Promise.all([
      AsyncStorage.removeItem(`${PROFILE_STORAGE_PREFIX}${user.uid}`),
      AsyncStorage.removeItem(`${SETTINGS_STORAGE_PREFIX}${user.uid}`),
      AsyncStorage.removeItem(`${SCREEN_TIME_STORAGE_PREFIX}${user.uid}`),
      AsyncStorage.removeItem(`learnbridge.missions.${user.uid}`),
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
    setLessonProgress(0);
    setScreenTimeUsedSeconds(0);
    setEyeBreakSecondsRemaining(0);
    setScreen("home");
  };

  const screenTimeLimitReached =
    Boolean(firebaseUser) &&
    screenTimeReady &&
    preferences.screenTimeLimitMinutes > 0 &&
    screenTimeUsedSeconds >= preferences.screenTimeLimitMinutes * 60;

  if (firebaseUser && screen !== "verify-email" && (!screenTimeReady || !preferencesReady)) {
    return (
      <SafeAreaView style={styles.limitReachedPage}>
        <Text style={styles.limitReachedText}>Loading account settings...</Text>
      </SafeAreaView>
    );
  }

  if (eyeBreakSecondsRemaining > 0) {
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
        password={signUpPassword}
        onResend={handleResendVerification}
        onCheckVerification={handleCheckVerification}
        onEditRegistration={handleEditRegistration}
      />
    );
  }

  if (screen === "menu") {
    return (
      <MenuScreen
        childName={childName}
        selectedIcon={selectedIcon}
        privacyMode={preferences.privacyMode}
        lessonProgress={lessonProgress}
        offlineMode={preferences.offlineMode}
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
    return <MissionsScreen screen={screen} setScreen={setScreen} />;
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
    return <CharacterSelectScreen onSelect={() => setScreen("lesson")} />;
  }

  if (screen === "lesson") {
    return (
      <LessonScreen
        onBack={() => setScreen("character-select")}
        onContinue={() => setScreen("quiz")}
      />
    );
  }

  if (screen === "quiz") {
    return (
      <QuizScreen
        difficulty={preferences.difficulty}
        onBack={() => setScreen("lesson")}
        onFinish={(results) => {
          setQuizResults(results);
          setLessonProgress(100);
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
        timeLabel="0:24"
        xpEarned={quizResults.correct * 10}
        breakdown={quizResults.breakdown}
        onRetry={() => setScreen("quiz")}
        onNext={() => setScreen("menu")}
      />
    );
  }

  if (screen === "lesson-complete") {
    const percent = quizResults.total
      ? Math.round((quizResults.correct / quizResults.total) * 100)
      : 0;

    return (
      <LessonCompleteScreen
        lessonTitle="Counting Change"
        percent={percent}
        xpEarned={quizResults.correct * 10}
        newBadges={percent === 100 ? 1 : 0}
        streakDays={1}
        unlockedLessonTitle="Adding Up at the Market!"
        onNext={() => setScreen("menu")}
        onMenu={() => setScreen("menu")}
      />
    );
  }

  return <HomeScreen setScreen={setScreen} />;
}

const styles = StyleSheet.create({
  eyeBreakPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#D5F5E7", padding: 20 },
  eyeBreakPanel: { width: "100%", maxWidth: 420, alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#B8DFCC", borderWidth: 2, borderRadius: 20, padding: 24 },
  eyeBreakIcon: { fontSize: 54, marginBottom: 12 },
  eyeBreakTitle: { color: "#173B53", fontSize: 26, lineHeight: 32, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  eyeBreakMessage: { color: "#36566A", fontSize: 16, lineHeight: 24, textAlign: "center", marginBottom: 22 },
  eyeBreakTimer: { color: "#28543A", fontSize: 48, lineHeight: 56, fontWeight: "900", fontVariant: ["tabular-nums"] },
  eyeBreakCaption: { color: "#46564B", fontSize: 14, lineHeight: 20, fontWeight: "700", marginTop: 2 },
  limitReachedPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F4EF", padding: 20 },
  limitReachedPanel: { width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", borderColor: "#D8E1D7", borderWidth: 1, borderRadius: 14, padding: 22 },
  limitReachedTitle: { color: "#26352B", fontSize: 26, lineHeight: 32, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  limitReachedText: { color: "#46564B", fontSize: 16, lineHeight: 24, textAlign: "center", marginBottom: 18 },
  homePage: { flex: 1, backgroundColor: "#70CDE2", padding: 12 },
  homeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#FFF8E7",
    shadowColor: "#24546A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  owlScene: { width: 230, height: 205, alignItems: "center", justifyContent: "center", backgroundColor: "#B4EAF0", borderRadius: 105, borderWidth: 5, borderColor: "#FFFFFF", marginBottom: 14 },
  owlSun: { position: "absolute", top: 16, right: 27, width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFD66E", alignItems: "center", justifyContent: "center" },
  owlSunText: { fontSize: 25 },
  owlStickerLeft: { position: "absolute", left: 15, bottom: 28, fontSize: 37 },
  owlStickerRight: { position: "absolute", right: 14, bottom: 31, fontSize: 34 },
  owl: { alignItems: "center", marginTop: 12 },
  owlHat: { fontSize: 36, lineHeight: 38 },
  owlFace: { fontSize: 94, lineHeight: 100, marginTop: -4 },
  homeTitle: { color: "#173B53", fontSize: 37, fontWeight: "900", textAlign: "center" },
  homeSubtitle: { color: "#36566A", fontSize: 17, fontWeight: "700", textAlign: "center", marginTop: 5, marginBottom: 22 },
  homeActions: { width: "100%", maxWidth: 360, gap: 10 },
  actionButton: { alignItems: "center", justifyContent: "center", minHeight: 58, paddingHorizontal: 16, borderRadius: 16, backgroundColor: "#F17D65", marginBottom: 6 },
  actionButtonText: { color: "#FFFDF5", fontWeight: "700", fontSize: 16, textAlign: "center" },
  secondaryButton: { backgroundColor: "#258EA3", marginBottom: 6 },
  secondaryButtonText: { color: "#FFFDF5", fontSize: 14, textAlign: "left" },
  pressed: { opacity: 0.7 },
  appPage: { flex: 1, backgroundColor: "#A6E5EE" },
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
  lockedLesson: { backgroundColor: "#E2E8E7", borderRadius: 15, padding: 14, marginTop: 6 },
  lockedLessonText: { color: "#36566A", fontSize: 14, fontWeight: "700" },
  offlineCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFDCCF", borderColor: "#F2A28B", borderWidth: 2, borderRadius: 20, padding: 18, marginTop: 3, marginBottom: 10 },
  offlineModePanel: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1", borderWidth: 2, borderRadius: 18, padding: 18, marginTop: 10 },
  offlineCopy: { flex: 1, paddingRight: 10 },
  cardBody: { color: "#36566A", fontSize: 15, lineHeight: 22 },
  openButton: { color: "#173B53", backgroundColor: "#FFFFFF", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 13, fontWeight: "800", fontSize: 14 },
  pageTitle: { color: "#173B53", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  formMessage: { color: "#9C3E32", fontSize: 14, lineHeight: 20, fontWeight: "700", marginBottom: 12 },
  successMessage: { color: "#397147", fontSize: 14, lineHeight: 20, fontWeight: "700", marginBottom: 12 },
  pageSubtitle: { color: "#36566A", fontSize: 16, lineHeight: 23, textAlign: "center", marginBottom: 18 },
  missionCard: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF", borderWidth: 2, borderRadius: 20, padding: 15, marginBottom: 14, shadowColor: "#24546A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 4, elevation: 3 },
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
  bottomNavigation: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#FFFFFF", height: 72, paddingHorizontal: 8, borderTopWidth: 2, borderTopColor: "#D5F5EB" },
  navButton: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#FFFFFF" },
  navButtonActive: { backgroundColor: "#D5F5EB" },
  navButtonText: { color: "#36566A", fontSize: 27 },
  navButtonTextActive: { color: "#F17D65" },
  addButton: { width: 60, height: 60, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#F17D65", marginTop: -24, borderWidth: 3, borderColor: "#FFFFFF" },
  addButtonText: { color: "#FFFFFF", fontSize: 31, lineHeight: 34 },
  loginContainer: { flex: 1, backgroundColor: "#70CDE2" },
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
  disabledButton: { opacity: 0.65 },
  submitButtonText: { color: "#FFFDF5", fontWeight: "700", fontSize: 16 },
  forgotPasswordRow: { alignItems: "flex-end", marginTop: -8, marginBottom: 12 },
  forgotPasswordLink: { color: "#397147", fontSize: 14, fontWeight: "700" },
  backToSignIn: { alignSelf: "center", marginTop: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { color: "#4A2F22", fontSize: 14 },
  footerLink: { color: "#759B57", fontWeight: "700", fontSize: 14 },
  iconPickerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  iconOption: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F0F4EC", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  selectedIconOption: { borderColor: "#759B57", backgroundColor: "#E4F0DF" },
  iconOptionText: { fontSize: 24 },    gradeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
   gradeChip: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#FFFFFF" },
   gradeChipActive: { backgroundColor: "#F17D65" },
   gradeChipText: { color: "#173B53", fontSize: 14, fontWeight: "800" },
   gradeChipTextActive: { color: "#FFFFFF" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(23,59,83,0.55)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#FFF8E7", borderRadius: 22, padding: 20 },
});
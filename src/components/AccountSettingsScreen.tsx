import { useContext, useRef, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";
import { gradeLabels, type Grade } from "../data/offlineMissions";

export type Difficulty = "easy" | "standard" | "challenge";

export type AccountPreferences = {
  difficulty: Difficulty;
  notificationsEnabled: boolean;
  offlineMode: boolean;
  privacyMode: boolean;
  darkMode: boolean;
  screenTimeLimitMinutes: number;
};

export type LearnerProfile = {
  id: string;
  childName: string;
  childBirthdate: string;
  selectedIcon: string;
  grade?: Grade;
};

type Props = {
  email: string;
  profiles: LearnerProfile[];
  activeProfileId: string | null;
  preferences: AccountPreferences;
  screenTimeUsedSeconds: number;
  onBack: () => void;
  onSelectProfile: (id: string) => void;
  onAddProfile: (
    profile: Omit<LearnerProfile, "id" | "grade"> & { grade: Grade }
  ) => Promise<void>;
  onSetProfileGrade: (profileId: string, grade: Grade) => Promise<void>;
  onPreferencesChange: (preferences: AccountPreferences) => void;
  onNotificationPreferenceChange: (enabled: boolean) => Promise<void>;
  onResetPassword: () => Promise<void>;
  onClearProgress: () => void;
  onDeleteAccount: (password: string) => Promise<void>;
};

const profileIcons = ["🦉", "🦁", "🐰", "🐼", "🦊", "🐯"];
const difficulties: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "standard", label: "Standard" },
  { value: "challenge", label: "Challenge" },
];
const screenTimeLimits = [0, 15, 30, 45, 60];

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getAgeFromParts(month: string, day: string, year: string): number | null {
  if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(day) || !/^\d{4}$/.test(year)) {
    return null;
  }
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const yearNumber = Number(year);
  const birthdate = new Date(yearNumber, monthNumber - 1, dayNumber);
  if (
    birthdate.getFullYear() !== yearNumber ||
    birthdate.getMonth() !== monthNumber - 1 ||
    birthdate.getDate() !== dayNumber
  ) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - yearNumber;
  if (
    today.getMonth() < monthNumber - 1 ||
    (today.getMonth() === monthNumber - 1 && today.getDate() < dayNumber)
  ) {
    age -= 1;
  }
  return age;
}

export default function AccountSettingsScreen({
  email,
  profiles,
  activeProfileId,
  preferences,
  screenTimeUsedSeconds,
  onBack,
  onSelectProfile,
  onAddProfile,
  onSetProfileGrade,
  onPreferencesChange,
  onNotificationPreferenceChange,
  onResetPassword,
  onClearProgress,
  onDeleteAccount,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [icon, setIcon] = useState(profileIcons[0]);
  const [grade, setGrade] = useState<Grade>("K");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [savingGradeProfileId, setSavingGradeProfileId] = useState<string | null>(null);
  const [isWaitingForGradeSave, setIsWaitingForGradeSave] = useState(false);
  const pendingGradeSaveRef = useRef<Promise<boolean> | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const updateDatePart = (
    part: "month" | "day" | "year",
    value: string
  ) => {
    const nextValue = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    if (part === "month") setMonth(nextValue);
    if (part === "day") setDay(nextValue);
    if (part === "year") setYear(nextValue);
    setProfileError("");
  };

  const handleSetProfileGrade = (profileId: string, nextGrade: Grade): Promise<boolean> => {
    if (pendingGradeSaveRef.current) return pendingGradeSaveRef.current;

    setSavingGradeProfileId(profileId);
    const savePromise = onSetProfileGrade(profileId, nextGrade)
      .then(() => true)
      .catch((error: unknown) => {
        Alert.alert(
          "Grade not saved",
          error instanceof Error ? error.message : "Check device storage and try again."
        );
        return false;
      })
      .finally(() => {
        if (pendingGradeSaveRef.current === savePromise) {
          pendingGradeSaveRef.current = null;
        }
        setSavingGradeProfileId(null);
      });
    pendingGradeSaveRef.current = savePromise;
    return savePromise;
  };

  const handleBack = async () => {
    setIsWaitingForGradeSave(true);
    try {
      const saved = await pendingGradeSaveRef.current;
      if (saved !== false) onBack();
    } finally {
      setIsWaitingForGradeSave(false);
    }
  };

  const handleAddProfile = async () => {
    const age = getAgeFromParts(month, day, year);
    if (!newName.trim()) {
      setProfileError("Enter the child's name.");
      return;
    }
    if (age === null || age < 2 || age > 10) {
      setProfileError("Enter a valid birthdate for a child aged 2 to 10.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    try {
      await onAddProfile({
        childName: newName.trim(),
        childBirthdate: `${year}-${month}-${day}`,
        selectedIcon: icon,
        grade,
      });
      setNewName("");
      setMonth("");
      setDay("");
      setYear("");
      setIcon(profileIcons[0]);
      setGrade("K");
      setShowAddProfile(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not save this profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetPassword = async () => {
    setIsSendingReset(true);
    try {
      await onResetPassword();
      Alert.alert(
        "Check your email",
        "If this email has a LearnBridge account, we sent a secure link to verify your email and choose a new password."
      );
    } catch (error) {
      Alert.alert(
        "Could not send reset link",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleNotificationPreferenceChange = async (enabled: boolean) => {
    try {
      await onNotificationPreferenceChange(enabled);
    } catch (error) {
      Alert.alert(
        "Notifications not enabled",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Enter the parent account password to verify.");
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError("");
    try {
      await onDeleteAccount(deletePassword);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete the account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const updatePreference = <K extends keyof AccountPreferences>(
    key: K,
    value: AccountPreferences[K]
  ) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isWaitingForGradeSave }}
          disabled={isWaitingForGradeSave}
          onPress={() => void handleBack()}
          style={({ pressed }) => [
            styles.backButton,
            darkMode && styles.darkBackButton,
            isWaitingForGradeSave && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.backText, darkMode && styles.darkBackText]}>
            {isWaitingForGradeSave ? "Saving grade..." : "← Back"}
          </Text>
        </Pressable>
        <View style={[styles.pageHero, darkMode && styles.darkPageHero]}>
          <View style={[styles.heroIcon, darkMode && styles.darkHeroIcon]}>
            <Text style={styles.heroIconText}>⚙️</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.title, darkMode && styles.darkText]}>Account Settings</Text>
            <Text style={[styles.heroSubtitle, darkMode && styles.darkHeroSubtitle]}>
              Make LearnBridge feel just right for your family.
            </Text>
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>🌙  APPEARANCE</Text>
          <View style={[styles.preferenceRow, darkMode && styles.darkPreferenceRow]}>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Dark mode</Text>
              <Text style={[styles.hint, darkMode && styles.darkHint]}>
                Switch LearnBridge to a starry night sky.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Enable dark mode"
              value={preferences.darkMode}
              onValueChange={(value) => updatePreference("darkMode", value)}
              trackColor={{ false: "#B9B2A8", true: "#8A78D6" }}
              thumbColor={preferences.darkMode ? "#F2E9C8" : undefined}
            />
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>👨‍👩‍👧  ACCOUNT</Text>
          <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Parent / guardian email</Text>
          <Text style={[styles.valueText, darkMode && styles.darkText]}>{email || "Not available"}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSendingReset || !email}
            onPress={() => void handleResetPassword()}
            style={({ pressed }) => [
              styles.actionButton,
              darkMode && styles.darkActionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionText}>
              {isSendingReset ? "Sending verification link..." : "Change Password"}
            </Text>
          </Pressable>
          <Text style={[styles.hint, darkMode && styles.darkHint]}>A link sent to your email verifies the change.</Text>
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>CHILD PROFILES</Text>
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfileId;
            return (
              <View key={profile.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => onSelectProfile(profile.id)}
                  style={[
                    styles.profileRow,
                    isActive && styles.profileRowSelected,
                    darkMode && styles.darkProfileRow,
                    darkMode && isActive && styles.darkProfileRowSelected,
                  ]}
                >
                  <Text style={styles.profileIcon}>{profile.selectedIcon}</Text>
                  <View style={styles.profileCopy}>
                    <Text style={[styles.profileName, darkMode && styles.darkText]}>{profile.childName}</Text>
                    <Text style={[styles.hint, darkMode && styles.darkHint]}>
                      Age {getAgeFromParts(
                        profile.childBirthdate.slice(5, 7),
                        profile.childBirthdate.slice(8, 10),
                        profile.childBirthdate.slice(0, 4)
                      ) ?? "Not set"} · {profile.grade ? gradeLabels[profile.grade] : "Grade not set"}
                    </Text>
                  </View>
                  {isActive && <Text style={[styles.activeLabel, darkMode && styles.darkActiveLabel]}>ACTIVE</Text>}
                </Pressable>
                <View style={styles.profileGradeEditor}>
                  <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Grade level for {profile.childName}</Text>
                  <View style={styles.gradeRow}>
                    {(Object.keys(gradeLabels) as Grade[]).map((grade) => {
                      const selected = profile.grade === grade;
                      return (
                        <Pressable
                          key={grade}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected,
                            disabled: savingGradeProfileId !== null,
                          }}
                          disabled={savingGradeProfileId !== null}
                          onPress={() => {
                            if (!selected) void handleSetProfileGrade(profile.id, grade);
                          }}
                          style={[
                            styles.gradeOption,
                            darkMode && styles.darkOption,
                            selected && styles.gradeOptionSelected,
                            savingGradeProfileId !== null && styles.disabled,
                          ]}
                        >
                          <Text style={[
                            styles.gradeOptionText,
                            darkMode && styles.darkText,
                            selected && styles.gradeOptionTextSelected,
                          ]}>
                            {gradeLabels[grade]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {savingGradeProfileId === profile.id ? (
                    <Text accessibilityLiveRegion="polite" style={[styles.hint, darkMode && styles.darkHint]}>
                      Saving grade...
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
          {!showAddProfile ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAddProfile(true)}
              style={[styles.outlineButton, darkMode && styles.darkOutlineButton]}
            >
              <Text style={[styles.outlineButtonText, darkMode && styles.darkText]}>＋  Add Child Profile</Text>
            </Pressable>
          ) : (
            <View style={[styles.addProfileForm, darkMode && styles.darkSubPanel]}>
              <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Child's name</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={newName ?? ""}
                onChangeText={setNewName}
                placeholder="Name"
                placeholderTextColor={darkMode ? "#B9C5D8" : "#6B7280"}
              />
              <Text style={[styles.bodyLabel, styles.dateLabel, darkMode && styles.darkText]}>Birthdate</Text>
              <View style={styles.dateRow}>
                {([
                  ["Month", month, setMonth, 2],
                  ["Day", day, setDay, 2],
                  ["Year", year, setYear, 4],
                ] as const).map(([label, value, setValue, maxLength]) => (
                  <View key={label} style={styles.datePart}>
                    <Text style={[styles.datePartLabel, darkMode && styles.darkHint]}>{label}</Text>
                    <TextInput
                      accessibilityLabel={`Birthdate ${label.toLowerCase()}`}
                      style={[styles.input, styles.dateInput, darkMode && styles.darkInput]}
                      value={value ?? ""}
                      onChangeText={(next) => updateDatePart(label.toLowerCase() as "month" | "day" | "year", next)}
                      keyboardType="number-pad"
                      maxLength={maxLength}
                      placeholder={label === "Year" ? "YYYY" : label === "Month" ? "MM" : "DD"}
                      placeholderTextColor={darkMode ? "#B9C5D8" : "#6B7280"}
                    />
                  </View>
                ))}
              </View>
              <Text style={[styles.bodyLabel, styles.dateLabel, darkMode && styles.darkText]}>Child's grade</Text>
              <View style={styles.gradeRow}>
                {(Object.keys(gradeLabels) as Grade[]).map((value) => {
                  const selected = grade === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setGrade(value)}
                      style={[
                        styles.gradeOption,
                        darkMode && styles.darkOption,
                        selected && styles.gradeOptionSelected,
                      ]}
                    >
                      <Text style={[
                        styles.gradeOptionText,
                        darkMode && styles.darkText,
                        selected && styles.gradeOptionTextSelected,
                      ]}>
                        {gradeLabels[value]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.bodyLabel, styles.dateLabel, darkMode && styles.darkText]}>Choose an icon</Text>
              <View style={styles.iconRow}>
                {profileIcons.map((option) => (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: icon === option }}
                    onPress={() => setIcon(option)}
                    style={[
                      styles.iconOption,
                      darkMode && styles.darkOption,
                      icon === option && styles.iconOptionSelected,
                    ]}
                  >
                    <Text style={styles.iconOptionText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
              {profileError ? <Text style={[styles.errorText, darkMode && styles.darkErrorText]}>{profileError}</Text> : null}
              <View style={styles.formActions}>
                <Pressable onPress={() => setShowAddProfile(false)} style={styles.cancelButton}>
                  <Text style={[styles.cancelText, darkMode && styles.darkHint]}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={isSavingProfile}
                  onPress={() => void handleAddProfile()}
                  style={[
                    styles.actionButton,
                    darkMode && styles.darkActionButton,
                    isSavingProfile && styles.disabled,
                  ]}
                >
                  <Text style={styles.actionText}>{isSavingProfile ? "Saving..." : "Save Profile"}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>📚  LEARNING</Text>
          <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Difficulty</Text>
          <View style={styles.segmentRow}>
            {difficulties.map(({ value, label }) => {
              const selected = preferences.difficulty === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updatePreference("difficulty", value)}
                  style={[
                    styles.segment,
                    darkMode && styles.darkOption,
                    selected && styles.segmentSelected,
                  ]}
                >
                  <Text style={[
                    styles.segmentText,
                    darkMode && styles.darkText,
                    selected && styles.segmentTextSelected,
                  ]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.hint, darkMode && styles.darkHint]}>
            Difficulty changes the number of questions, answer choices, and passing score in online lessons and quizzes.
          </Text>
          <View style={styles.screenTimeBlock}>
            <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Daily screen time limit</Text>
            <Text style={[styles.hint, darkMode && styles.darkHint]}>
              {preferences.screenTimeLimitMinutes === 0
                ? `Today: ${formatDuration(screenTimeUsedSeconds)} used. No daily limit is set.`
                : `Today: ${formatDuration(screenTimeUsedSeconds)} used · ${formatDuration(Math.max(0, preferences.screenTimeLimitMinutes * 60 - screenTimeUsedSeconds))} remaining.`}
            </Text>
            <View style={styles.limitOptions}>
              {screenTimeLimits.map((minutes) => {
                const selected = preferences.screenTimeLimitMinutes === minutes;
                return (
                  <Pressable
                    key={minutes}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => updatePreference("screenTimeLimitMinutes", minutes)}
                    style={[
                      styles.limitOption,
                      darkMode && styles.darkOption,
                      selected && styles.limitOptionSelected,
                    ]}
                  >
                    <Text style={[
                      styles.limitOptionText,
                      darkMode && styles.darkText,
                      selected && styles.limitOptionTextSelected,
                    ]}>
                      {minutes === 0 ? "No limit" : `${minutes} min`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.hint, darkMode && styles.darkHint]}>
              This limit applies across all grade levels. Choosing a limit also enables 5-minute eye-rest breaks every 15 active minutes; break time is not counted. Selecting No limit disables both limits and breaks. Usage resets at local midnight.
            </Text>
          </View>
          <View style={[styles.preferenceRow, darkMode && styles.darkPreferenceRow]}>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Eye-rest notifications</Text>
              <Text style={[styles.hint, darkMode && styles.darkHint]}>
                Your child gets a 5-minute break every 15 active minutes. Reminder banners require a development build; the app still works in Expo Go without them.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Enable eye-rest notification banners"
              value={preferences.notificationsEnabled}
              onValueChange={(value) => void handleNotificationPreferenceChange(value)}
              disabled={Platform.OS === "web"}
              trackColor={{ false: "#B9B2A8", true: "#759B57" }}
            />
          </View>
          <View style={[styles.preferenceRow, darkMode && styles.darkPreferenceRow]}>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Offline-only mode</Text>
              <Text style={[styles.hint, darkMode && styles.darkHint]}>Shows local offline missions instead of lessons.</Text>
            </View>
            <Switch
              accessibilityLabel="Enable offline-only mode"
              value={preferences.offlineMode}
              onValueChange={(value) => updatePreference("offlineMode", value)}
              trackColor={{ false: "#B9B2A8", true: "#759B57" }}
            />
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>🛡️  DATA & PRIVACY</Text>
          <View style={[styles.preferenceRow, darkMode && styles.darkPreferenceRow]}>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>Privacy mode</Text>
              <Text style={[styles.hint, darkMode && styles.darkHint]}>Hide the active child's name and age on screen.</Text>
            </View>
            <Switch
              accessibilityLabel="Enable privacy mode"
              value={preferences.privacyMode}
              onValueChange={(value) => updatePreference("privacyMode", value)}
              trackColor={{ false: "#B9B2A8", true: "#759B57" }}
            />
          </View>
          <View style={[styles.disclosure, darkMode && styles.darkSubPanel]}>
            <Text style={[styles.bodyLabel, darkMode && styles.darkText]}>What is stored</Text>
            <Text style={[styles.hint, darkMode && styles.darkHint]}>
              Firebase manages the parent account email, password, and sign-in session. LearnBridge keeps a local copy of child profiles, preferences, lesson completions, and mistake counts so they remain available offline. Child profiles and lesson progress also sync to your Firebase account when online. Earned module badges are saved locally.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onClearProgress}
            style={[styles.clearButton, darkMode && styles.darkClearButton]}
          >
            <Text style={[styles.clearButtonText, darkMode && styles.darkClearButtonText]}>Clear Learning Progress</Text>
          </Pressable>
          <Text style={[styles.hint, darkMode && styles.darkHint]}>Clears current quiz results and progress only. Account and child profiles stay intact.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setDeletePassword("");
              setDeleteError("");
              setShowDeleteConfirmation(true);
            }}
            style={styles.deleteAccountButton}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </Pressable>
          <Text style={[styles.hint, darkMode && styles.darkHint]}>Requires the parent account password. This permanently deletes the account and child profiles.</Text>
        </View>
      </ScrollView>
      <Modal
        visible={showDeleteConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeletingAccount) setShowDeleteConfirmation(false);
        }}
      >
        <View style={[styles.modalBackdrop, darkMode && styles.darkModalBackdrop]}>
          <View style={[styles.modalCard, darkMode && styles.darkModalCard]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Verify parent to delete account</Text>
            <Text style={[styles.modalMessage, darkMode && styles.darkHint]}>
              This permanently deletes {email || "the parent account"} and its child profiles. Enter the parent account password to continue.
            </Text>
            <TextInput
              accessibilityLabel="Parent account password"
              style={[styles.input, darkMode && styles.darkInput]}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Parent account password"
              placeholderTextColor={darkMode ? "#B9C5D8" : "#6B7280"}
              secureTextEntry
              autoCapitalize="none"
              editable={!isDeletingAccount}
            />
            {deleteError ? <Text style={[styles.errorText, darkMode && styles.darkErrorText]}>{deleteError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={() => setShowDeleteConfirmation(false)}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, darkMode && styles.darkHint]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={() => void handleDeleteAccount()}
                style={[styles.deleteConfirmButton, isDeletingAccount && styles.disabled]}
              >
                <Text style={styles.deleteConfirmText}>
                  {isDeletingAccount ? "Deleting..." : "Verify & Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EDF3F2" },
  darkSafeArea: { backgroundColor: "#101936" },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 44 },
  backButton: { alignSelf: "flex-start", minHeight: 42, borderRadius: 14, backgroundColor: "#DCEDE8", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginBottom: 12 },
  darkBackButton: { backgroundColor: "#253149", borderWidth: 1, borderColor: "#465671" },
  backText: { color: "#28543A", fontSize: 15, fontWeight: "800" },
  darkBackText: { color: "#E4EAF3" },
  pageHero: { alignItems: "center", flexDirection: "row", gap: 14, backgroundColor: "#FFFFFF", borderColor: "#D8E5E1", borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 16 },
  darkPageHero: { backgroundColor: "#253149", borderColor: "#465671" },
  heroIcon: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#E4F3EE" },
  darkHeroIcon: { backgroundColor: "#303D55" },
  heroIconText: { fontSize: 30 },
  heroCopy: { flex: 1 },
  title: { color: "#26352B", fontSize: 25, lineHeight: 31, fontWeight: "900" },
  heroSubtitle: { color: "#52665D", fontSize: 14, lineHeight: 20, marginTop: 4 },
  darkHeroSubtitle: { color: "#B9C5D8" },
  section: { backgroundColor: "#FFFFFF", borderColor: "#D8E5E1", borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: "#25443A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  sectionTitle: { color: "#28543A", fontSize: 13, fontWeight: "900", marginBottom: 14 },
  bodyLabel: { color: "#26352B", fontSize: 15, lineHeight: 21, fontWeight: "800" },
  valueText: { color: "#26352B", fontSize: 16, lineHeight: 23, marginTop: 5, marginBottom: 14 },
  hint: { color: "#46564B", fontSize: 14, lineHeight: 21, marginTop: 5 },
  actionButton: { minHeight: 48, borderRadius: 9, backgroundColor: "#28543A", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  actionText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  profileRow: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#D8E1D7" },
  profileRowSelected: { backgroundColor: "#EAF3E9", borderRadius: 8 },
  profileIcon: { fontSize: 28, width: 42 },
  profileCopy: { flex: 1 },
  profileName: { color: "#26352B", fontSize: 16, lineHeight: 22, fontWeight: "800" },
  activeLabel: { color: "#28543A", fontSize: 12, fontWeight: "900" },
  profileGradeEditor: { paddingTop: 12 },
  outlineButton: { minHeight: 48, borderWidth: 1, borderColor: "#28543A", borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 12 },
  outlineButtonText: { color: "#28543A", fontSize: 15, fontWeight: "800" },
  addProfileForm: { backgroundColor: "#F4F7F3", borderColor: "#D8E1D7", borderWidth: 1, borderRadius: 9, padding: 14, marginTop: 12 },
  input: { height: 48, borderWidth: 1, borderColor: "#87978B", borderRadius: 8, backgroundColor: "#FFFFFF", paddingHorizontal: 10, color: "#26352B", fontSize: 16, marginTop: 6 },
  dateLabel: { marginTop: 12 },
  dateRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  datePart: { flex: 1 },
  datePartLabel: { color: "#46564B", fontSize: 13, fontWeight: "700" },
  dateInput: { textAlign: "center", paddingHorizontal: 4 },
  gradeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  gradeOption: { minHeight: 40, borderWidth: 1, borderColor: "#87978B", borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, backgroundColor: "#FFFFFF" },
  gradeOptionSelected: { backgroundColor: "#28543A", borderColor: "#28543A" },
  gradeOptionText: { color: "#26352B", fontSize: 13, fontWeight: "700" },
  gradeOptionTextSelected: { color: "#FFFFFF" },
  iconRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  iconOption: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#E4F0DF", alignItems: "center", justifyContent: "center" },
  iconOptionSelected: { borderWidth: 2, borderColor: "#587449" },
  iconOptionText: { fontSize: 22 },
  errorText: { color: "#8C2D24", fontSize: 14, lineHeight: 20, marginTop: 8 },
  formActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  cancelButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  cancelText: { color: "#28543A", fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  segmentRow: { flexDirection: "row", gap: 8, marginTop: 9 },
  segment: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: "#87978B", backgroundColor: "#FFFFFF" },
  segmentSelected: { backgroundColor: "#28543A", borderColor: "#28543A" },
  segmentText: { color: "#26352B", fontSize: 14, fontWeight: "700" },
  segmentTextSelected: { color: "#FFFFFF" },
  screenTimeBlock: { marginTop: 18, marginBottom: 8 },
  limitOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  limitOption: { width: "31%", minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: "#87978B", backgroundColor: "#FFFFFF" },
  limitOptionSelected: { backgroundColor: "#28543A", borderColor: "#28543A" },
  limitOptionText: { color: "#26352B", fontSize: 14, fontWeight: "700" },
  limitOptionTextSelected: { color: "#FFFFFF" },
  preferenceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#D8E1D7" },
  preferenceCopy: { flex: 1 },
  disclosure: { backgroundColor: "#F4F7F3", borderRadius: 8, padding: 13, marginVertical: 12 },
  clearButton: { minHeight: 48, borderWidth: 1, borderColor: "#8C2D24", borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 8 },
  clearButtonText: { color: "#8C2D24", fontSize: 15, fontWeight: "800" },
  deleteAccountButton: { minHeight: 48, backgroundColor: "#8C2D24", borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 12 },
  deleteAccountButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(20,35,26,0.58)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 20 },
  modalTitle: { color: "#26352B", fontSize: 20, lineHeight: 26, fontWeight: "900", marginBottom: 8 },
  modalMessage: { color: "#46564B", fontSize: 15, lineHeight: 22, marginBottom: 10 },
  modalActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 14 },
  deleteConfirmButton: { minHeight: 44, backgroundColor: "#8C2D24", borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  deleteConfirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.7 },
  darkSection: { backgroundColor: "#253149", borderColor: "#465671" },
  darkText: { color: "#F3F4FF" },
  darkHint: { color: "#C4CBE0" },
  darkSubPanel: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkInput: { backgroundColor: "#202B40", borderColor: "#66758E", color: "#F3F4FF" },
  darkOption: { backgroundColor: "#303D55", borderColor: "#66758E" },
  darkPreferenceRow: { borderBottomColor: "#465671" },
  darkProfileRow: { borderBottomColor: "#465671" },
  darkProfileRowSelected: { backgroundColor: "#303D55" },
  darkActiveLabel: { color: "#A7E2BC" },
  darkOutlineButton: { borderColor: "#A7E2BC" },
  darkActionButton: { backgroundColor: "#456C7B" },
  darkClearButton: { borderColor: "#FF9F94" },
  darkClearButtonText: { color: "#FFB4AA" },
  darkErrorText: { color: "#FFAAA2" },
  darkModalBackdrop: { backgroundColor: "rgba(5, 10, 24, 0.82)" },
  darkModalCard: { backgroundColor: "#253149", borderWidth: 1, borderColor: "#465671" },
});
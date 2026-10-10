import { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { gradeLabels, type Grade } from "../data/offlineMissions";

export type Difficulty = "easy" | "standard" | "challenge";

export type AccountPreferences = {
  difficulty: Difficulty;
  notificationsEnabled: boolean;
  offlineMode: boolean;
  privacyMode: boolean;
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
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [icon, setIcon] = useState(profileIcons[0]);
  const [grade, setGrade] = useState<Grade>("K");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹  Profile</Text>
        </Pressable>
        <Text style={styles.title}>Account Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <Text style={styles.bodyLabel}>Parent / guardian email</Text>
          <Text style={styles.valueText}>{email || "Not available"}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSendingReset || !email}
            onPress={() => void handleResetPassword()}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>
              {isSendingReset ? "Sending verification link..." : "Change Password"}
            </Text>
          </Pressable>
          <Text style={styles.hint}>A link sent to your email verifies the change.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHILD PROFILES</Text>
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfileId;
            return (
              <Pressable
                key={profile.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => onSelectProfile(profile.id)}
                style={[styles.profileRow, isActive && styles.profileRowSelected]}
              >
                <Text style={styles.profileIcon}>{profile.selectedIcon}</Text>
                <View style={styles.profileCopy}>
                  <Text style={styles.profileName}>{profile.childName}</Text>
                  <Text style={styles.hint}>
                    Age {getAgeFromParts(
                      profile.childBirthdate.slice(5, 7),
                      profile.childBirthdate.slice(8, 10),
                      profile.childBirthdate.slice(0, 4)
                    ) ?? "Not set"} · {profile.grade ? gradeLabels[profile.grade] : "Grade not set"}
                  </Text>
                </View>
                {isActive && <Text style={styles.activeLabel}>ACTIVE</Text>}
              </Pressable>
            );
          })}
          {profiles.find((profile) => profile.id === activeProfileId) ? (
            <View style={styles.profileGradeEditor}>
              <Text style={styles.bodyLabel}>Grade level for {profiles.find((profile) => profile.id === activeProfileId)?.childName}</Text>
              <View style={styles.gradeRow}>
                {(Object.keys(gradeLabels) as Grade[]).map((grade) => {
                  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
                  const selected = activeProfile?.grade === grade;
                  return (
                    <Pressable
                      key={grade}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        if (activeProfileId && !selected) {
                          void onSetProfileGrade(activeProfileId, grade).catch((error: unknown) => {
                            Alert.alert(
                              "Grade not saved",
                              error instanceof Error ? error.message : "Check device storage and try again."
                            );
                          });
                        }
                      }}
                      style={[styles.gradeOption, selected && styles.gradeOptionSelected]}
                    >
                      <Text style={[styles.gradeOptionText, selected && styles.gradeOptionTextSelected]}>
                        {gradeLabels[grade]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
          {!showAddProfile ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAddProfile(true)}
              style={styles.outlineButton}
            >
              <Text style={styles.outlineButtonText}>＋  Add Child Profile</Text>
            </Pressable>
          ) : (
            <View style={styles.addProfileForm}>
              <Text style={styles.bodyLabel}>Child's name</Text>
              <TextInput
                style={styles.input}
                value={newName ?? ""}
                onChangeText={setNewName}
                placeholder="Name"
                placeholderTextColor="#8A8175"
              />
              <Text style={[styles.bodyLabel, styles.dateLabel]}>Birthdate</Text>
              <View style={styles.dateRow}>
                {([
                  ["Month", month, setMonth, 2],
                  ["Day", day, setDay, 2],
                  ["Year", year, setYear, 4],
                ] as const).map(([label, value, setValue, maxLength]) => (
                  <View key={label} style={styles.datePart}>
                    <Text style={styles.datePartLabel}>{label}</Text>
                    <TextInput
                      accessibilityLabel={`Birthdate ${label.toLowerCase()}`}
                      style={[styles.input, styles.dateInput]}
                      value={value ?? ""}
                      onChangeText={(next) => updateDatePart(label.toLowerCase() as "month" | "day" | "year", next)}
                      keyboardType="number-pad"
                      maxLength={maxLength}
                      placeholder={label === "Year" ? "YYYY" : label === "Month" ? "MM" : "DD"}
                      placeholderTextColor="#8A8175"
                    />
                  </View>
                ))}
              </View>
              <Text style={[styles.bodyLabel, styles.dateLabel]}>Child's grade</Text>
              <View style={styles.gradeRow}>
                {(Object.keys(gradeLabels) as Grade[]).map((value) => {
                  const selected = grade === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setGrade(value)}
                      style={[styles.gradeOption, selected && styles.gradeOptionSelected]}
                    >
                      <Text style={[styles.gradeOptionText, selected && styles.gradeOptionTextSelected]}>
                        {gradeLabels[value]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.bodyLabel, styles.dateLabel]}>Choose an icon</Text>
              <View style={styles.iconRow}>
                {profileIcons.map((option) => (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: icon === option }}
                    onPress={() => setIcon(option)}
                    style={[styles.iconOption, icon === option && styles.iconOptionSelected]}
                  >
                    <Text style={styles.iconOptionText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
              {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
              <View style={styles.formActions}>
                <Pressable onPress={() => setShowAddProfile(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={isSavingProfile}
                  onPress={() => void handleAddProfile()}
                  style={[styles.actionButton, isSavingProfile && styles.disabled]}
                >
                  <Text style={styles.actionText}>{isSavingProfile ? "Saving..." : "Save Profile"}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEARNING</Text>
          <Text style={styles.bodyLabel}>Difficulty</Text>
          <View style={styles.segmentRow}>
            {difficulties.map(({ value, label }) => {
              const selected = preferences.difficulty === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updatePreference("difficulty", value)}
                  style={[styles.segment, selected && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>Difficulty changes the number challenge in the quiz.</Text>
          <View style={styles.screenTimeBlock}>
            <Text style={styles.bodyLabel}>Daily screen time limit</Text>
            <Text style={styles.hint}>
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
                    style={[styles.limitOption, selected && styles.limitOptionSelected]}
                  >
                    <Text style={[styles.limitOptionText, selected && styles.limitOptionTextSelected]}>
                      {minutes === 0 ? "No limit" : `${minutes} min`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              Counts active LearnBridge use and resets at local midnight. A 5-minute eye-rest break begins every 15 active minutes; break time is not counted.
            </Text>
          </View>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceCopy}>
              <Text style={styles.bodyLabel}>Eye-rest notifications</Text>
              <Text style={styles.hint}>
                Your child gets a 5-minute break every 15 active minutes. On mobile, enable banners for an extra reminder when the break begins.
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
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceCopy}>
              <Text style={styles.bodyLabel}>Offline-only mode</Text>
              <Text style={styles.hint}>Shows local offline missions instead of lessons.</Text>
            </View>
            <Switch
              accessibilityLabel="Enable offline-only mode"
              value={preferences.offlineMode}
              onValueChange={(value) => updatePreference("offlineMode", value)}
              trackColor={{ false: "#B9B2A8", true: "#759B57" }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA & PRIVACY</Text>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceCopy}>
              <Text style={styles.bodyLabel}>Privacy mode</Text>
              <Text style={styles.hint}>Hide the active child's name and age on screen.</Text>
            </View>
            <Switch
              accessibilityLabel="Enable privacy mode"
              value={preferences.privacyMode}
              onValueChange={(value) => updatePreference("privacyMode", value)}
              trackColor={{ false: "#B9B2A8", true: "#759B57" }}
            />
          </View>
          <View style={styles.disclosure}>
            <Text style={styles.bodyLabel}>What is stored</Text>
            <Text style={styles.hint}>
              Firebase manages the parent account email, password, and sign-in session. On this device, LearnBridge stores child names, birthdates, icons, and these preferences in app storage. Quiz results and lesson progress are held in memory and are not currently saved between app launches.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onClearProgress}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear Learning Progress</Text>
          </Pressable>
          <Text style={styles.hint}>Clears current quiz results and progress only. Account and child profiles stay intact.</Text>
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
          <Text style={styles.hint}>Requires the parent account password. This permanently deletes the account and child profiles.</Text>
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
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify parent to delete account</Text>
            <Text style={styles.modalMessage}>
              This permanently deletes {email || "the parent account"} and its child profiles. Enter the parent account password to continue.
            </Text>
            <TextInput
              accessibilityLabel="Parent account password"
              style={styles.input}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Parent account password"
              placeholderTextColor="#8A8175"
              secureTextEntry
              autoCapitalize="none"
              editable={!isDeletingAccount}
            />
            {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeletingAccount}
                onPress={() => setShowDeleteConfirmation(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
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
  safeArea: { flex: 1, backgroundColor: "#F1F4EF" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", paddingVertical: 10, paddingRight: 14 },
  backText: { color: "#28543A", fontSize: 16, fontWeight: "800" },
  title: { color: "#26352B", fontSize: 30, fontWeight: "900", marginBottom: 14 },
  section: { backgroundColor: "#FFFFFF", borderColor: "#D8E1D7", borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
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
});
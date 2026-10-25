import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
// @ts-ignore - exists at runtime on React Native, missing from the type definitions
import { getReactNativePersistence } from "firebase/auth";
import { Firestore, getFirestore, initializeFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { Functions, getFunctions } from "firebase/functions";
import { Database, getDatabase } from "firebase/database";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "learnbridge-a7c85",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://learnbridge-a7c85-default-rtdb.firebaseio.com",
};

export const firebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
].every((value) => typeof value === "string" && value.length > 0);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseFunctions: Functions | null = null;
let firebaseDatabase: Database | null = null;

if (firebaseConfigured) {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === "web") {
    firebaseAuth = getAuth(firebaseApp);
  } else {
    try {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/already-initialized") {
        throw error;
      }
      firebaseAuth = getAuth(firebaseApp);
    }
  }

  firebaseFirestore =
    Platform.OS === "web"
      ? getFirestore(firebaseApp)
      : initializeFirestore(firebaseApp, {
          experimentalForceLongPolling: true,
        });
  const storageBucket = firebaseConfig.storageBucket?.trim();
  firebaseStorage = storageBucket
    ? getStorage(
        firebaseApp,
        storageBucket.startsWith("gs://") || storageBucket.startsWith("https://")
          ? storageBucket
          : `gs://${storageBucket}`
      )
    : getStorage(firebaseApp);
  firebaseFunctions = getFunctions(firebaseApp, "us-central1");
  if (firebaseConfig.databaseURL) {
    firebaseDatabase = getDatabase(firebaseApp, firebaseConfig.databaseURL);
  }
}

export const auth = firebaseAuth;
export const firestore = firebaseFirestore;
export const storage = firebaseStorage;
export const cloudFunctions = firebaseFunctions;
export const realtimeDatabase = firebaseDatabase;
export const db = firebaseDatabase;
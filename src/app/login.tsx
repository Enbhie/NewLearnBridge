import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { AnimatedPressable as TouchableOpacity } from '../components/AnimatedPressable';
import { AppAppearanceContext } from '../components/CloudBackdrop';

export default function LoginScreen() {
  const { darkMode } = useContext(AppAppearanceContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12" style={darkMode && styles.darkContent}>
          <StatusBar style={darkMode ? "light" : "dark"} />
          
          {/* Header Section */}
          <View className="mb-8">
            <Text className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              Welcome Back
            </Text>
            <Text className={`text-base mt-2 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
              Sign in to continue to LearnBridge
            </Text>
          </View>

          {/* Form Inputs */}
          <View className="space-y-4">
            <View>
              <Text className={`text-sm font-medium mb-1.5 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                Email
              </Text>
              <TextInput
                className={`w-full px-4 py-3 border rounded-xl ${
                  darkMode
                    ? "bg-slate-800 border-slate-600 text-gray-100 focus:border-blue-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white"
                }`}
                placeholder="Enter your email"
                placeholderTextColor={darkMode ? "#CBD5E1" : "#6B7280"}
                value={email ?? ""}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className={`text-sm font-medium mb-1.5 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                Password
              </Text>
              <TextInput
                className={`w-full px-4 py-3 border rounded-xl ${
                  darkMode
                    ? "bg-slate-800 border-slate-600 text-gray-100 focus:border-blue-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white"
                }`}
                placeholder="Enter your password"
                placeholderTextColor={darkMode ? "#CBD5E1" : "#6B7280"}
                value={password ?? ""}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="items-end py-1">
              <Text className={`text-sm font-semibold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              className="w-full bg-blue-600 py-3.5 rounded-xl items-center shadow-sm mt-4"
              onPress={handleLogin}
            >
              <Text className="text-white font-semibold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer / Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className={darkMode ? "text-gray-300" : "text-gray-500"}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity>
              <Text className={`font-semibold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  darkContent: {
    alignSelf: "center" as const,
    width: "100%" as const,
    maxWidth: 560,
    backgroundColor: "#111827",
    borderRadius: 24,
    marginVertical: 20,
  },
};
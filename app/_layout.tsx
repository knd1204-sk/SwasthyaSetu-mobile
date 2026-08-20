import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors, fontSize } from '../src/constants/theme';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.primary,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
                fontSize: fontSize.lg,
                fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
              },
              headerBackTitleStyle: {
                fontSize: fontSize.md,
                fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
              },
              headerShadowVisible: false,
              headerTransparent: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="notifications"
              options={{
                headerShown: true,
                headerTitle: 'Notifications',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="conditions"
              options={{
                headerShown: true,
                headerTitle: 'Chronic Conditions',
                headerBackTitle: 'Back',
              }}
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

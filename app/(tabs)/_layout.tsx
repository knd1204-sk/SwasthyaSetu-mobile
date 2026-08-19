import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
  const { t } = useAuth();

  const tabBarIcon = (name: keyof typeof Ionicons.glyphMap, color: string, focused: boolean) => (
    <View style={styles.iconWrapper}>
      <Ionicons name={name} size={24} color={color} />
      {focused && <View style={[styles.focusDot, { backgroundColor: color }]} />}
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => tabBarIcon(focused ? 'home' : 'home-outline', color, focused),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: t('records'),
          tabBarIcon: ({ color, focused }) => tabBarIcon(focused ? 'folder' : 'folder-outline', color, focused),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scan'),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.scanTabIcon}>
              <Ionicons name={focused ? 'scan' : 'scan-outline'} size={28} color={colors.white} />
            </View>
          ),
          tabBarLabelStyle: [styles.tabLabel, { color: colors.primary, fontWeight: '600' }],
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat'),
          tabBarIcon: ({ color, focused }) => tabBarIcon(focused ? 'chatbubble' : 'chatbubble-outline', color, focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused }) => tabBarIcon(focused ? 'person' : 'person-outline', color, focused),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 0.5,
    height: 78,
    paddingTop: spacing.sm,
    paddingBottom: 18,
  },
  tabItem: {
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  focusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  scanTabIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});

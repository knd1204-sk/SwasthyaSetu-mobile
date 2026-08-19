import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, typography } from '../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  noPadding?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  title,
  subtitle,
  headerRight,
  style,
  scrollable = true,
  edges = ['top'],
  noPadding = false,
}) => {
  const content = (
    <>
      {(title || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={[{ flex: 1 }, noPadding ? null : { paddingHorizontal: spacing.lg }]}>
        {children}
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {scrollable ? (
        <ScreenScrollWrapper noPadding={noPadding}>{content}</ScreenScrollWrapper>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const ScreenScrollWrapper: React.FC<{ children: React.ReactNode; noPadding?: boolean }> = ({
  children,
}) => {
  const { ScrollView } = require('react-native');
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    fontFamily: typography.heading.fontFamily,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.body.fontFamily,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});

export default Screen;

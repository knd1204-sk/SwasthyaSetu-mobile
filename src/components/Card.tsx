import React from 'react';
import { View, Text, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { colors, borderRadius, fontSize, spacing, typography, shadows } from '../constants/theme';
import { Button } from './Button';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevation?: 'card' | 'elevated' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = spacing.lg,
  elevation = 'card',
}) => {
  return (
    <View
      style={[
        styles.card,
        { padding },
        elevation === 'card' ? shadows.card : elevation === 'elevated' ? shadows.elevated : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'sm' }) => {
  const getBgColor = () => {
    switch (variant) {
      case 'primary': return colors.primaryLight;
      case 'success': return '#E8F5E9';
      case 'warning': return '#FFF8E1';
      case 'error': return '#FFEBEE';
      case 'info': return '#E3F2FD';
      default: return '#F0F0F0';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'success': return '#2E7D32';
      case 'warning': return colors.honeyGold;
      case 'error': return colors.accent;
      case 'info': return colors.signalBlue;
      default: return colors.textMuted;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBgColor(),
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
          borderRadius: size === 'sm' ? borderRadius.sm : borderRadius.md,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: getTextColor(),
            fontSize: size === 'sm' ? fontSize.xs : fontSize.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const Skeleton: React.FC<{ width?: DimensionValue; height?: number; style?: ViewStyle }> = ({
  width = '100%',
  height = 16,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius: height / 3 },
        style,
      ]}
    />
  );
};

export const EmptyState: React.FC<{ title: string; description?: string; icon?: React.ReactNode }> = ({
  title,
  description,
  icon,
}) => {
  return (
    <View style={styles.emptyContainer}>
      {icon && <View style={styles.emptyIcon}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDesc}>{description}</Text>}
    </View>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}> = ({ title, message, onRetry, retryLabel }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>{title || 'Something went wrong'}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Button
          title={retryLabel || 'Try Again'}
          variant="outline"
          size="sm"
          onPress={onRetry}
          style={{ marginTop: spacing.md }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: typography.heading.fontFamily,
    fontWeight: '600',
  },
  skeleton: {
    backgroundColor: colors.skeleton,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    fontFamily: typography.heading.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.body.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    fontFamily: typography.heading.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.body.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
});

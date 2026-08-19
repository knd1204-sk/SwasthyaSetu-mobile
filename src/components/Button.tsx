import React from 'react';
import {
  Pressable,
  PressableProps,
  Text,
  TextStyle,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, borderRadius, fontSize, spacing, typography } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const [pressed, setPressed] = React.useState(false);

  const getBgColor = (): string => {
    if (disabled || loading) return '#B8C5C2';
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.primaryLight;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'danger': return colors.accent;
      default: return colors.primary;
    }
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'outline') return colors.border;
    return undefined;
  };

  const getTextColor = (): string => {
    if (disabled || loading) return colors.white;
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.primary;
      case 'outline': return colors.text;
      case 'ghost': return colors.primary;
      case 'danger': return colors.white;
      default: return colors.white;
    }
  };

  const getPadding = (): { py: number; px: number } => {
    switch (size) {
      case 'sm': return { py: spacing.sm, px: spacing.md };
      case 'md': return { py: spacing.md + 2, px: spacing.xl };
      case 'lg': return { py: spacing.lg + 2, px: spacing.xxl };
      default: return { py: spacing.md, px: spacing.xl };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'md': return fontSize.md;
      case 'lg': return fontSize.lg;
      default: return fontSize.md;
    }
  };

  const padding = getPadding();

  const buttonStyle: ViewStyle = {
    backgroundColor: getBgColor(),
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: getBorderColor(),
    borderRadius: borderRadius.md,
    paddingVertical: padding.py,
    paddingHorizontal: padding.px,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    transform: [{ scale: pressed ? 0.97 : 1 }],
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    minHeight: size === 'sm' ? 36 : size === 'md' ? 48 : 56,
    ...style,
  };

  const textStyling: TextStyle = {
    color: getTextColor(),
    fontSize: getFontSize(),
    fontFamily: typography.heading.fontFamily,
    fontWeight: '600',
    ...textStyle,
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      onPressIn={(e) => { setPressed(true); onPressIn?.(e); }}
      onPressOut={(e) => { setPressed(false); onPressOut?.(e); }}
      style={({ pressed: _p }) => buttonStyle}
    >
      {loading && (
        <ActivityIndicator
          color={getTextColor()}
          style={{ marginRight: spacing.sm }}
          size="small"
        />
      )}
      <Text style={textStyling}>{title}</Text>
    </Pressable>
  );
};

export default Button;

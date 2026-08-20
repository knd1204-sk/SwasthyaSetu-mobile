import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import { aiApi, handleApiError } from '../../src/services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const { t } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content:
        "Namaste! I'm your SwasthyaSetu health assistant. I can help you understand your reports, explain medical terms, or answer general health questions. Remember — I'm for informational purposes only and not a substitute for professional medical advice. How can I help today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiApi.chat(text);
      const reply = res.data?.data?.reply;
      if (reply) {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'ai',
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('No reply received');
      }
    } catch (e: any) {
      const handled = handleApiError(e);
      const is404 = handled.status === 404;
      const content = is404
        ? t('chatUnavailable')
        : handled.message || t('chatUnavailable');

      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'error',
          content,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, t]);

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'error';

    return (
      <View
        style={[
          styles.bubbleWrapper,
          isUser ? styles.bubbleUser : styles.bubbleAi,
        ]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons
              name={isError ? 'alert' : 'medical'}
              size={18}
              color={isError ? colors.accent : colors.white}
            />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUserBox : isError ? styles.bubbleErrorBox : styles.bubbleAiBox,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.bubbleTextUser : isError ? styles.bubbleTextError : styles.bubbleTextAi,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.headerTitle}>{t('aiChatTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('aiChatSubtitle')}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={scrollRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderBubble}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={
            isLoading ? (
              <View style={[styles.bubbleWrapper, styles.bubbleAi]}>
                <View style={styles.avatar}>
                  <Ionicons name="medical" size={18} color={colors.white} />
                </View>
                <View style={[styles.bubble, styles.bubbleAiBox, { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            ) : null
          }
        />

        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('typeMessage')}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
              style={styles.inputField}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!isLoading}
            />
          </View>
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendBtn,
              !input.trim() || isLoading ? styles.sendBtnDisabled : null,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  bubbleUser: {
    justifyContent: 'flex-end',
  },
  bubbleAi: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.lg,
  },
  bubbleUserBox: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
    marginLeft: 44,
  },
  bubbleAiBox: {
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: borderRadius.sm,
  },
  bubbleErrorBox: {
    backgroundColor: '#FFEBEE',
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  bubbleText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  bubbleTextUser: { color: colors.white },
  bubbleTextAi: { color: colors.text },
  bubbleTextError: { color: colors.accent },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  inputField: {
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 120,
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    padding: 0,
    lineHeight: 22,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  sendBtnDisabled: {
    backgroundColor: '#B8C5C2',
  },
});

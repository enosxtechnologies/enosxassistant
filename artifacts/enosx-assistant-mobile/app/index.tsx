import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetch } from "expo/fetch";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

let messageCounter = 0;
function generateId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

function TypingIndicator({ colors: c }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.bubbleRow, styles.assistantRow]}>
      <View style={[styles.bubble, styles.aiBubble, { backgroundColor: c.aiBubble as string, borderColor: c.aiBorder as string }]}>
        <View style={styles.typingDots}>
          <ActivityIndicator size="small" color={c.primary} />
        </View>
      </View>
    </View>
  );
}

function MessageBubble({ message, colors: c }: { message: Message; colors: ReturnType<typeof useColors> }) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser ? styles.userRow : styles.assistantRow]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <Ionicons name="flash" size={12} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: c.userBubble as string, borderColor: c.userBorder as string }]
            : [styles.aiBubble, { backgroundColor: c.aiBubble as string, borderColor: c.aiBorder as string }],
        ]}
      >
        <Text style={[styles.messageText, { color: c.foreground, fontFamily: "Inter_400Regular" }]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ colors: c }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyOrb, { borderColor: c.primary, shadowColor: c.glow as string }]}>
        <Ionicons name="flash" size={36} color={c.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: c.foreground, fontFamily: "Inter_700Bold" }]}>ENOSX</Text>
      <Text style={[styles.emptySubtitle, { color: c.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        Powered by Groq · llama-3.3-70b
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const c = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;

    setInputText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentMessages = [...messages];
    const userMessage: Message = { id: generateId(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setShowTyping(true);

    try {
      const chatHistory = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const url = domain ? `https://${domain}/api/chat` : "/api/chat";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      let assistantAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const chunk =
              parsed.content ||
              parsed.choices?.[0]?.delta?.content ||
              "";
            if (!chunk) continue;

            fullContent += chunk;

            if (!assistantAdded) {
              setShowTyping(false);
              setMessages((prev) => [
                ...prev,
                { id: generateId(), role: "assistant", content: fullContent },
              ]);
              assistantAdded = true;
            } else {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullContent,
                };
                return updated;
              });
            }
          } catch {}
        }
      }

      if (!assistantAdded && fullContent === "") {
        setShowTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: generateId(), role: "assistant", content: "No response received." },
        ]);
      }
    } catch {
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
      inputRef.current?.focus();
    }
  }, [inputText, isStreaming, messages]);

  const reversed = [...messages].reverse();

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12 + webTopInset,
            backgroundColor: c.card,
            borderBottomColor: c.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.headerOrb, { borderColor: c.primary }]}>
            <Ionicons name="flash" size={14} color={c.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: c.foreground, fontFamily: "Inter_700Bold" }]}>
            ENOSX
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/about")}
          style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.5 : 1 }]}
          testID="about-button"
        >
          <Ionicons name="information-circle-outline" size={24} color={c.mutedForeground} />
        </Pressable>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={reversed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} colors={c} />}
          inverted={messages.length > 0}
          ListHeaderComponent={showTyping ? <TypingIndicator colors={c} /> : null}
          ListFooterComponent={
            messages.length === 0 ? <EmptyState colors={c} /> : null
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            messages.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: c.card,
              borderTopColor: c.border,
              paddingBottom: insets.bottom + 8 + webBottomInset,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: c.background,
                borderColor: c.input,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                { color: c.foreground, fontFamily: "Inter_400Regular" },
              ]}
              placeholder="Message ENOSX..."
              placeholderTextColor={c.mutedForeground}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={4000}
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
              testID="chat-input"
            />
            <Pressable
              onPress={() => {
                handleSend();
                inputRef.current?.focus();
              }}
              disabled={!inputText.trim() || isStreaming}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor:
                    !inputText.trim() || isStreaming ? c.muted : c.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              testID="send-button"
            >
              <Ionicons
                name={isStreaming ? "ellipsis-horizontal" : "arrow-up"}
                size={18}
                color="#fff"
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerOrb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    letterSpacing: 2,
  },
  headerBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  listContentEmpty: {
    flex: 1,
  },
  bubbleRow: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
    gap: 8,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingDots: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyTitle: {
    fontSize: 28,
    letterSpacing: 6,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  inputBar: {
    paddingTop: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 120,
    padding: 0,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

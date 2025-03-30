import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatMessageTime } from '../../utils/timeUtils';

/**
 * Text message component
 * 
 * @param {Object} props
 * @param {Object} props.message - Text message data
 * @param {boolean} props.isUserMessage - Whether the message is from the current user
 * @param {Function} props.onLongPress - Callback when message is long-pressed
 * @param {Function} props.onPressOptions - Callback when options button is pressed
 * @param {Function} props.onPress - Callback when message is pressed
 */
const TextMessageItem = ({
  message,
  isUserMessage,
  onLongPress,
  onPressOptions,
  onPress,
}) => {
  // Handle long press with haptic feedback
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPress) {
      onLongPress(message);
    }
  }, [message, onLongPress]);

  // Handle press on the message
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(message);
    }
  }, [message, onPress]);

  return (
    <Pressable
      onLongPress={handleLongPress}
      onPress={handlePress}
      delayLongPress={300}
      style={({ pressed }) => [
        styles.container,
        isUserMessage ? styles.userContainer : styles.otherContainer,
        pressed && styles.pressedContainer,
      ]}
      accessibilityLabel={`Text message from ${message.senderName}: ${message.text}`}
      accessibilityHint="Tap to view details. Long press for more options."
    >
      {/* Message header */}
      <View style={styles.header}>
        {!isUserMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <Text style={[
          styles.timestamp,
          isUserMessage ? styles.userTimestamp : styles.otherTimestamp
        ]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>

      {/* Message text */}
      <Text style={[
        styles.messageText,
        isUserMessage ? styles.userMessageText : styles.otherMessageText,
      ]}>
        {message.text}
      </Text>

      {/* Options button */}
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => onPressOptions && onPressOptions(message)}
        accessibilityLabel="Message options"
      >
        <Ionicons
          name="ellipsis-horizontal"
          size={16}
          color={isUserMessage ? "rgba(255, 255, 255, 0.8)" : "#666"}
        />
      </TouchableOpacity>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#5A67F2',
    borderBottomRightRadius: 6,
    marginLeft: 40,
  },
  otherContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    marginRight: 40,
  },
  pressedContainer: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 6,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333',
  },
  optionsButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginTop: 4,
  },
});

export default memo(TextMessageItem);
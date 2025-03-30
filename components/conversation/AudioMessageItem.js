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
import AudioPlayer from '../audio/AudioPlayer';
import TagBubble from '../common/TagBubble';
import { formatMessageTime } from '../../utils/timeUtils';

/**
 * Audio message component
 * 
 * @param {Object} props
 * @param {Object} props.message - Audio message data
 * @param {boolean} props.isUserMessage - Whether the message is from the current user
 * @param {Function} props.onLongPress - Callback when message is long-pressed
 * @param {Function} props.onPressOptions - Callback when options button is pressed
 * @param {Function} props.onTagPress - Callback when a tag is pressed
 * @param {Function} props.onPress - Callback when message is pressed
 */
const AudioMessageItem = ({
  message,
  isUserMessage,
  onLongPress,
  onPressOptions,
  onTagPress,
  onPress,
}) => {
  // Handle long press with haptic feedback
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPress) {
      onLongPress(message);
    }
  }, [message, onLongPress]);

  // Handle tag press
  const handleTagPress = useCallback((tag) => {
    if (onTagPress) {
      onTagPress(tag, message.id);
    }
  }, [message.id, onTagPress]);

  // Handle press on the message bubble
  const handlePress = useCallback(() => {
    console.log('AudioMessageItem - handlePress called for message ID:', message.id);
    if (onPress) {
      console.log('AudioMessageItem - calling parent onPress callback');
      onPress(message);
    } else {
      console.log('AudioMessageItem - No parent onPress provided');
    }
  }, [message, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300}
      style={({ pressed }) => [
        styles.container,
        isUserMessage ? styles.userContainer : styles.otherContainer,
        pressed && styles.pressedContainer,
      ]}
      accessibilityLabel={`Audio message from ${message.senderName}, duration ${message.audioDuration} seconds`}
      accessibilityHint="Tap to expand. Long press for more options."
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

      {/* Audio player */}
      <View style={styles.audioPlayerWrapper} pointerEvents="none">
        <AudioPlayer
          message={message}
          isUserMessage={isUserMessage}
          style={styles.audioPlayer}
        />
      </View>

      {/* Tags */}
      {message.tags && message.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {message.tags.map(tag => (
            <TagBubble
              key={tag}
              label={tag}
              onPress={() => handleTagPress(tag)}
              isDark={isUserMessage}
            />
          ))}
        </View>
      )}

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
      
      {/* Tap to expand indicator */}
      <View style={styles.expandIndicator}>
        <Ionicons
          name="expand-outline"
          size={12}
          color={isUserMessage ? "rgba(255, 255, 255, 0.6)" : "#999"}
        />
        <Text style={[
          styles.expandText,
          isUserMessage ? styles.userExpandText : styles.otherExpandText
        ]}>
          Tap to expand
        </Text>
      </View>
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
  audioPlayerWrapper: {
    width: '100%',
  },
  audioPlayer: {
    marginVertical: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionsButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginTop: 4,
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  expandText: {
    fontSize: 11,
    marginLeft: 4,
  },
  userExpandText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherExpandText: {
    color: '#999',
  },
});

export default memo(AudioMessageItem);
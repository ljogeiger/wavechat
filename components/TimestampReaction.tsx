import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatTime } from '../utils/audioUtils';

interface Reaction {
  id: string;
  emoji: string;
  timestamp: number;
  username: string;
}

interface TimestampReactionProps {
  reaction: Reaction;
  duration: number;
  onPress: () => void;
}

const TimestampReaction: React.FC<TimestampReactionProps> = ({ reaction, duration, onPress }) => {
  const position = (reaction.timestamp / duration) * 100;

  return (
    <TouchableOpacity
      style={[styles.container, { left: `${position}%` }]}
      onPress={onPress}
    >
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{reaction.emoji}</Text>
      </View>
      <Text style={styles.username}>{reaction.username}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }],
  },
  emojiContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emoji: {
    fontSize: 16,
  },
  username: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});

export default TimestampReaction; 
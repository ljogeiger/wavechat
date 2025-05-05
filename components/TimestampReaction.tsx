import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <View style={styles.tooltip}>
        <Text style={styles.timestamp}>{formatTime(reaction.timestamp)}</Text>
        <Text style={styles.username}>{reaction.username}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    transform: [{ translateX: -15 }], // Center the emoji
  },
  emojiContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 16,
  },
  tooltip: {
    position: 'absolute',
    top: 35,
    left: -50,
    width: 100,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  username: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default TimestampReaction; 
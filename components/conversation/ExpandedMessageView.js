import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from '../audio/AudioPlayer';
import TagBubble from '../common/TagBubble';
import { formatMessageTime } from '../../utils/timeUtils';
import { getMessageTranscript, getMessageReactions } from '../../services/databaseService';

const { width, height } = Dimensions.get('window');

/**
 * Expanded message view component that shows when a message is tapped
 * 
 * @param {Object} props
 * @param {Object} props.message - Message object to display
 * @param {Function} props.onClose - Function to call when closing the expanded view
 * @param {boolean} props.visible - Whether the expanded view is visible
 */
const ExpandedMessageView = ({ message, onClose, visible = false }) => {
  const [transcript, setTranscript] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Handle animations when visibility changes
  useEffect(() => {
    if (visible && message) {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(height);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
      
      loadMessageData();
    }
  }, [visible, message]);
  
  // Load message transcript and reactions
  const loadMessageData = async () => {
    console.log('ExpandedMessageView - Loading message data');
    setLoading(true);
    
    if (message && message.type === 'audio') {
      try {
        // Fetch transcript
        console.log('ExpandedMessageView - Fetching transcript for message ID:', message.id);
        const transcriptData = await getMessageTranscript(message.id);
        setTranscript(transcriptData);
        
        // Fetch reactions
        console.log('ExpandedMessageView - Fetching reactions for message ID:', message.id);
        const reactionsData = await getMessageReactions(message.id);
        setReactions(reactionsData);
        
        console.log('ExpandedMessageView - Data loaded successfully');
      } catch (error) {
        console.error('Error loading message data:', error);
      }
    }
    
    setLoading(false);
  };
  
  // Handle close with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };
  
  // If not visible or no message, don't render anything
  if (!visible || !message) {
    return null;
  }
  
  const isAudioMessage = message.type === 'audio';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <Text style={styles.senderName}>{message.senderName}</Text>
                <Text style={styles.timestamp}>{formatMessageTime(message.timestamp)}</Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Message Content */}
            <ScrollView 
              style={styles.contentScroll}
              contentContainerStyle={styles.contentContainer}
            >
              {/* Audio Player (for audio messages) */}
              {isAudioMessage && (
                <View style={styles.audioPlayerContainer}>
                  <AudioPlayer 
                    message={message}
                    isUserMessage={message.senderId === '123'} // Replace with actual user ID
                    style={styles.audioPlayer}
                  />
                </View>
              )}
              
              {/* Text Content */}
              {message.type === 'text' && (
                <Text style={styles.messageText}>{message.text}</Text>
              )}
              
              {/* Transcript (for audio messages) */}
              {isAudioMessage && transcript && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Transcript</Text>
                  {transcript.segments.map((segment, index) => (
                    <View key={`segment-${index}`} style={styles.transcriptSegment}>
                      <Text style={styles.timestampLabel}>{formatTime(segment.start)}</Text>
                      <Text style={styles.transcriptText}>{segment.text}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Tags */}
              {message.tags && message.tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {message.tags.map((tag, index) => (
                      <TagBubble
                        key={`tag-${index}`}
                        label={tag}
                        isDark={false}
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {/* Reactions */}
              {reactions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Reactions</Text>
                  {reactions.map((reaction, index) => (
                    <View key={`reaction-${index}`} style={styles.reactionItem}>
                      <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                      <View style={styles.reactionInfo}>
                        <Text style={styles.reactionUser}>{reaction.username}</Text>
                        <Text style={styles.reactionTimestamp}>
                          at {formatTime(reaction.timestamp)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Add extra padding for iOS home indicator
  },
  audioPlayerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  audioPlayer: {
    marginVertical: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    padding: 16,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  transcriptSegment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timestampLabel: {
    width: 40,
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  transcriptText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reactionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  reactionInfo: {
    flex: 1,
  },
  reactionUser: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  reactionTimestamp: {
    fontSize: 12,
    color: '#666',
  },
});

export default ExpandedMessageView;
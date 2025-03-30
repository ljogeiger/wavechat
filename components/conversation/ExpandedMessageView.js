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
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  console.log('ExpandedMessageView - Rendered with visible:', visible);
  
  // Handle animations when visibility changes
  useEffect(() => {
    console.log('ExpandedMessageView - Effect triggered with visible:', visible);
    if (visible && message) {
      console.log('ExpandedMessageView - Starting animations');
      
      // Reset animation values to initial state
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(({ finished }) => {
        console.log('ExpandedMessageView - Animation finished:', finished);
      });
      
      // Load data
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
    console.log('ExpandedMessageView - handleClose called');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(({ finished }) => {
      console.log('ExpandedMessageView - Close animation finished:', finished);
      if (finished) {
        onClose();
      }
    });
  };
  
  // If not visible or no message, don't render anything
  if (!visible || !message) {
    console.log('ExpandedMessageView - Not rendering: visible=', visible, ', message=', !!message);
    return null;
  }
  
  console.log('ExpandedMessageView - Rendering visible view for message ID:', message.id);
  const isAudioMessage = message.type === 'audio';
  
  return (
    <View style={styles.overlayContainer}>
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: fadeAnim,
          }
        ]}
      >
        <BlurView intensity={15} style={styles.blurContainer}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={handleClose}
          />
          
          <Animated.View 
            style={[
              styles.container,
              {
                transform: [{ scale: scaleAnim }],
                marginBottom: 120, // Fixed bottom margin for audio recorder
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <Text style={styles.senderName}>{message.senderName}</Text>
                <Text style={styles.timestamp}>{formatMessageTime(message.timestamp)}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Message Content */}
            <ScrollView style={styles.contentScroll}>
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
          </Animated.View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120, // Space for the audio recorder
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'absolute',
    top: 120, // Position at the top with some padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
    maxHeight: height * 0.6,
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
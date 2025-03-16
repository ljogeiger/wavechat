import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Audio } from 'expo-av';

// Import database service
import { 
  fetchMessagesFromGCP, 
  sendAudioMessageToGCP,
  markMessagesAsRead 
} from '../services/databaseService';

const { width } = Dimensions.get('window');
const PHONE_WIDTH = Math.min(width * 0.9, 340);

const ConversationDetailScreen = ({ route, navigation }) => {
  const { conversationId, participantName } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [focusedMessageId, setFocusedMessageId] = useState(null);
  
  const flatListRef = useRef(null);
  const currentUserId = '123'; // This would come from your auth system
  const recordingTimerRef = useRef(null);
  
  // Available message tags
  const tagOptions = ['Grocery reminder', 'Want to come over?'];
  
  useEffect(() => {
    loadMessages();
    setupAudio();
    
    // Mark messages as read when opening the conversation
    markMessagesAsRead(conversationId, currentUserId);
    
    // Optional: Set up a polling for new messages
    const messageInterval = setInterval(loadMessages, 10000);
    
    return () => {
      clearInterval(messageInterval);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Clean up audio resources
      if (recording) {
        stopRecording();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch messages from GCP (via databaseService)
      const fetchedMessages = await fetchMessagesFromGCP(conversationId);
      
      // Process messages to add UI-specific properties
      const processedMessages = fetchedMessages.map(msg => ({
        ...msg,
        isCurrentUser: msg.senderId === currentUserId
      }));
      
      setMessages(processedMessages);
      setLoading(false);
      
      // Scroll to the bottom after loading messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages. Try again.');
      setLoading(false);
    }
  };

  const setupAudio = async () => {
    try {
      // Request permissions for audio recording
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio recording permission not granted');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      console.error('Failed to setup audio:', err);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      // Send the audio message
      await handleSendAudioMessage(uri, recordingDuration);
      
    } catch (err) {
      console.error('Failed to stop recording:', err);
    } finally {
      setRecording(null);
      setRecordingDuration(0);
    }
  };

  const handleSendAudioMessage = async (audioUri, duration) => {
    try {
      setSending(true);
      
      // Random tag for the message
      const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
      
      // Create a temporary message to display immediately
      const tempMessage = {
        id: `temp-${Date.now()}`,
        audioUri,
        audioDuration: duration,
        timestamp: new Date().toISOString(),
        senderId: currentUserId,
        senderName: 'You',
        type: 'audio',
        isCurrentUser: true
      };
      
      // Add to UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Scroll to the bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Send to backend
      await sendAudioMessageToGCP({
        conversationId,
        audioUri,
        audioDuration: duration,
        senderId: currentUserId,
        timestamp: tempMessage.timestamp,
        type: 'audio'
      });
      
      // Refresh messages from server
      await loadMessages();
      
    } catch (err) {
      console.error('Failed to send audio message:', err);
    } finally {
      setSending(false);
    }
  };

  const playAudio = async (messageId, audioUri) => {
    try {
      // If we're already playing something
      if (sound) {
        // If it's the same message, just stop it
        if (playingMessageId === messageId) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
          setPlayingMessageId(null);
          return;
        }
        
        // If it's a different message, stop the current one
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Load and play the new audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      // Set up finished playing listener
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingMessageId(null);
        }
      });
      
      setSound(newSound);
      setPlayingMessageId(messageId);
      
    } catch (err) {
      console.error('Failed to play audio:', err);
      // For demo purposes, just toggle the playing state even if error
      setPlayingMessageId(messageId);
    }
  };

  const handleMessagePress = (messageId) => {
    setFocusedMessageId(focusedMessageId === messageId ? null : messageId);
  };

  const renderMessage = ({ item }) => {
    const isPlaying = playingMessageId === item.id;
    const isFocused = focusedMessageId === item.id;
    const isBlurred = focusedMessageId !== null && focusedMessageId !== item.id;
    
    // Determine background color based on sender
    const bgColor = item.isCurrentUser ? '#ADD8E6' : '#2196F3';
    
    // Get the appropriate display name based on senderId
    const displayName = item.isCurrentUser ? 'Me' : participantName || 'Sarah';
    
    return (
      <TouchableOpacity
        onPress={() => handleMessagePress(item.id)}
        activeOpacity={0.9}
        style={styles.messageWrapper}
      >
        <View 
          style={[
            styles.messageContainer,
            isBlurred && styles.blurredMessage
          ]}
        >
          <View 
            style={[
              styles.messageContent, 
              { backgroundColor: bgColor },
              isFocused && styles.focusedMessageContent
            ]}
          >
            {/* User name at top */}
            <Text 
              style={[
                styles.userName,
                item.isCurrentUser ? styles.meLabel : styles.senderName
              ]}
            >
              {displayName}
            </Text>
            
            {/* Play button */}
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => playAudio(item.id, item.audioUri)}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={30} 
                color="black" 
              />
            </TouchableOpacity>
            
            {/* Audio waveform visualization */}
            <View style={styles.waveformContainer}>
              {Array.from({ length: 24 }).map((_, i) => {
                // Create a consistent pattern for the waveform
                // Using a set pattern based on index rather than random values
                const heightPattern = [12, 18, 8, 14, 20, 10, 16, 8];
                const height = heightPattern[i % heightPattern.length];
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.waveformBar,
                      { height }
                    ]} 
                  />
                );
              })}
            </View>
            
            {/* Tags at bottom */}
            <View style={styles.tagsRow}>
              {tagOptions.map((tag, index) => (
                <View key={index} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Press and hold the button to start talking</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.phoneFrame}>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={renderEmptyList}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
        
        {sending && (
          <View style={styles.sendingIndicator}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text style={styles.sendingText}>Sending...</Text>
          </View>
        )}
        
        <View style={styles.pushButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.pushButton,
              pressed && styles.pushButtonPressed
            ]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Text style={styles.pushButtonText}>Push{'\n'}Talk</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  phoneFrame: {
    flex: 1,
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageWrapper: {
    width: '100%',
    paddingVertical: 0,
    marginVertical: 0,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 0,
    marginVertical: 0,
  },
  blurredMessage: {
    opacity: 0.5,
  },
  messageContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 10,
    borderRadius: 0,
    position: 'relative',
    minHeight: 120,
  },
  focusedMessageContent: {
    transform: [{ scaleY: 1.1 }],
    zIndex: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    color: 'black',
  },
  senderName: {
    left: 10,
  },
  meLabel: {
    right: 10,
  },
  playButton: {
    marginLeft: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    marginHorizontal: 10,
  },
  waveformBar: {
    width: 4,
    backgroundColor: 'white',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  tagPill: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagText: {
    fontSize: 14,
    color: 'black',
  },
  pushButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  pushButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  pushButtonPressed: {
    backgroundColor: '#E3F2FD',
    transform: [{ scale: 0.95 }],
  },
  pushButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  sendingText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 8,
  },
});

export default ConversationDetailScreen;
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  AppState,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MessageList from '../components/conversation/MessageList';
import AudioRecorder from '../components/audio/AudioRecorder';
import MessageOptionsModal from '../components/common/MessageOptionsModal';
import useMessages from '../hooks/useMessages';
import {
  detectSpeechSegments,
  transcribeAudio,
  updateMessageTags,
} from '../services/databaseService';

/**
 * ConversationDetailScreen - Main chat screen with audio-first features
 */
const ConversationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, conversationName, participantAvatar } = route.params;
  
  // Refs
  const appStateRef = useRef(AppState.currentState);
  
  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeResult, setTranscribeResult] = useState(null);
  
  // Use custom hooks
  const {
    messages,
    loading,
    error,
    refreshing,
    sending,
    refreshMessages,
    sendAudioMessage,
  } = useMessages(conversationId);
  
  // Set up header with conversation name
  useEffect(() => {
    navigation.setOptions({
      title: conversationName || 'Chat',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('ConversationSettings', { conversationId })}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, conversationName, conversationId]);
  
  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground, refresh messages
        refreshMessages();
      }
      appStateRef.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, [refreshMessages]);
  
  // Handle recording completion
  const handleRecordingComplete = useCallback(async (recordingData) => {
    if (!recordingData) return;
    
    try {
      // Send the audio message
      const newMessage = await sendAudioMessage(recordingData);
      
      // Auto-detect speech segments for tagging (runs in background)
      if (newMessage) {
        detectSpeechSegments(newMessage.audioUri)
          .then(segments => {
            if (segments && segments.length > 0) {
              // Add suggested tags to the message
              const tags = segments.map(segment => segment.label);
              updateMessageTags(newMessage.id, tags);
            }
          })
          .catch(error => {
            console.error('Error detecting speech segments:', error);
          });
      }
    } catch (error) {
      console.error('Error sending audio message:', error);
      Alert.alert('Error', 'Failed to send audio message. Please try again.');
    }
  }, [sendAudioMessage]);
  
  // Handle recording cancellation
  const handleRecordingCancel = useCallback(() => {
    // No additional action needed, the hook handles cleanup
  }, []);
  
  // Handle message long press
  const handleMessageLongPress = useCallback((message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  }, []);
  
  // Handle message options button press
  const handleMessageOptions = useCallback((message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  }, []);
  
  // Handle adding a tag to a message
  const handleAddTag = useCallback(async (tag) => {
    if (!selectedMessage || !tag) return;
    
    try {
      // Get existing tags or empty array
      const existingTags = selectedMessage.tags || [];
      
      // Only add if tag doesn't already exist
      if (!existingTags.includes(tag)) {
        const updatedTags = [...existingTags, tag];
        
        // Update in database
        await updateMessageTags(selectedMessage.id, updatedTags);
        
        // Update local state
        setSelectedMessage(prev => ({
          ...prev,
          tags: updatedTags,
        }));
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      Alert.alert('Error', 'Failed to add tag. Please try again.');
    }
  }, [selectedMessage]);
  
  // Handle message deletion
  const handleDeleteMessage = useCallback(async (message) => {
    if (!message) return;
    
    try {
      // Here you would call your delete API
      // For this example, we'll just show an alert
      Alert.alert('Message deleted', 'Message has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message. Please try again.');
    }
  }, []);
  
  // Handle transcribe request
  const handleTranscribe = useCallback(async (message) => {
    if (!message || message.type !== 'audio') return;
    
    try {
      setTranscribing(true);
      
      // Request transcription
      const result = await transcribeAudio(message.audioUri);
      
      if (result && result.text) {
        setTranscribeResult(result);
        
        // Show the transcription in an alert
        Alert.alert(
          'Transcription',
          result.text,
          [
            { text: 'OK', onPress: () => setTranscribeResult(null) }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
      }
      
      setTranscribing(false);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
      setTranscribing(false);
    }
  }, []);
  
  // Navigate to message detail screen
  const handleNavigateToDetail = useCallback((message) => {
    navigation.navigate('MessageDetail', { message });
  }, [navigation]);
  
  // Handle message tag press
  const handleTagPress = useCallback((tag, messageId) => {
    // Could filter messages by tag or perform other actions
    Alert.alert('Tag Selected', `You selected tag: ${tag}`);
  }, []);
  
  // Handle message press
  const handleMessagePress = useCallback((message) => {
    if (message.type === 'audio') {
      // For audio messages, navigate to detail view
      handleNavigateToDetail(message);
    }
  }, [handleNavigateToDetail]);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Message List */}
        <View style={styles.messagesContainer}>
          <MessageList
            messages={messages}
            loading={loading}
            refreshing={refreshing}
            onRefresh={refreshMessages}
            onMessageLongPress={handleMessageLongPress}
            onMessageOptions={handleMessageOptions}
            onTagPress={handleTagPress}
            onMessagePress={handleMessagePress}
            currentUserId="123" // Replace with actual user ID in real app
          />
        </View>
        
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onRecordingCancel={handleRecordingCancel}
          />
        </View>
        
        {/* Message Options Modal */}
        <MessageOptionsModal
          visible={modalVisible}
          message={selectedMessage}
          onClose={() => setModalVisible(false)}
          onAddTag={handleAddTag}
          onNavigateToDetail={handleNavigateToDetail}
          onDelete={handleDeleteMessage}
          onTranscribe={handleTranscribe}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  headerButton: {
    padding: 8,
  },
});

export default ConversationDetailScreen;
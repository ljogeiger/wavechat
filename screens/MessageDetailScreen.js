import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-audio';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatTime } from '../utils/audioUtils';
import { addReactionToMessage, addReplyToMessage } from '../services/databaseService';
import TagBubble from '../components/common/TagBubble';
import TimestampReaction from '../components/TimestampReaction';
import DetailedWaveform from '../components/audio/DetailedWaveform';

const { width } = Dimensions.get('window');

const MessageDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { message } = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [replyTimestamp, setReplyTimestamp] = useState(null);
  const [reactions, setReactions] = useState(message.reactions || []);
  const [replies, setReplies] = useState(message.replies || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('👍');
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  
  const soundRef = useRef(null);
  const isScrubbingRef = useRef(false);
  
  // Common emoji options
  const emojiOptions = ['👍', '❤️', '😂', '😮', '👏', '🔥', '❓', '⭐'];
  
  useEffect(() => {
    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  const loadAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: message.audioUri },
        { progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Failed to load audio', error);
    }
  };
  
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded || isScrubbingRef.current) return;
    
    if (status.isPlaying) {
      setPlaybackPosition(status.positionMillis / status.durationMillis);
      setPlaybackTime(status.positionMillis / 1000);
    }
    
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPlaybackPosition(0);
      setPlaybackTime(0);
    }
  };
  
  const togglePlayback = async () => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const seekAudio = async (value) => {
    if (!soundRef.current) return;
    
    const seekPosition = value * (message.duration * 1000);
    await soundRef.current.setPositionAsync(seekPosition);
    setPlaybackTime(seekPosition / 1000);
  };
  
  const handleSliderValueChange = (value) => {
    isScrubbingRef.current = true;
    setPlaybackPosition(value);
  };
  
  const handleSliderComplete = async (value) => {
    await seekAudio(value);
    isScrubbingRef.current = false;
  };
  
  const jumpBackward = async () => {
    if (!soundRef.current) return;
    
    const newPosition = Math.max(0, playbackTime - 5) * 1000;
    await soundRef.current.setPositionAsync(newPosition);
  };
  
  const jumpForward = async () => {
    if (!soundRef.current) return;
    
    const newPosition = Math.min(message.duration, playbackTime + 5) * 1000;
    await soundRef.current.setPositionAsync(newPosition);
  };
  
  const handleWaveformPress = (position) => {
    seekAudio(position);
  };
  
  const handleTimestampSelection = (timestamp) => {
    setReplyTimestamp(timestamp);
    setSelectedTimestamp(timestamp);
  };
  
  const handleAddReaction = async (emoji) => {
    if (!selectedTimestamp) return;
    
    const newReaction = {
      id: Date.now().toString(),
      emoji,
      timestamp: selectedTimestamp,
      username: 'You', // In a real app, use authenticated user
    };
    
    const updatedReactions = [...reactions, newReaction];
    setReactions(updatedReactions);
    setShowEmojiPicker(false);
    setSelectedTimestamp(null);
    
    // Update in database
    await addReactionToMessage(message.id, newReaction);
  };
  
  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    const newReply = {
      id: Date.now().toString(),
      text: replyText,
      timestamp: replyTimestamp || playbackTime,
      username: 'You', // In a real app, use authenticated user
      createdAt: new Date().toISOString(),
    };
    
    const updatedReplies = [...replies, newReply];
    setReplies(updatedReplies);
    setReplyText('');
    setReplyTimestamp(null);
    setSelectedTimestamp(null);
    
    // Update in database
    await addReplyToMessage(message.id, newReply);
  };
  
  const renderReaction = ({ item }) => (
    <TimestampReaction
      reaction={item}
      duration={message.duration}
      onPress={() => seekAudio(item.timestamp / message.duration)}
    />
  );
  
  const renderReply = ({ item }) => (
    <TouchableOpacity 
      style={styles.replyItem}
      onPress={() => seekAudio(item.timestamp / message.duration)}
    >
      <View style={styles.replyHeader}>
        <Text style={styles.replyUsername}>{item.username}</Text>
        <Text style={styles.replyTimestamp}>
          {formatTime(item.timestamp)} • {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.replyText}>{item.text}</Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Audio Detail</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Audio Player Card */}
          <View style={styles.playerCard}>
            <View style={styles.waveformContainer}>
              <DetailedWaveform
                waveform={message.waveform}
                playbackPosition={playbackPosition}
                onPress={handleWaveformPress}
                onLongPress={handleTimestampSelection}
                selectedTimestamp={selectedTimestamp}
              />
            </View>
            
            {/* Playback Time */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(playbackTime)}</Text>
              <Text style={styles.timeText}>-{formatTime(message.duration - playbackTime)}</Text>
            </View>
            
            {/* Slider */}
            <Slider
              style={styles.slider}
              value={playbackPosition}
              onValueChange={handleSliderValueChange}
              onSlidingComplete={handleSliderComplete}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#5A67F2"
              maximumTrackTintColor="#DDDDDD"
              thumbTintColor="#5A67F2"
            />
            
            {/* Playback Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={jumpBackward}>
                <Ionicons name="play-back" size={24} color="#333" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={30} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={jumpForward}>
                <Ionicons name="play-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Playback Speed */}
            <View style={styles.speedContainer}>
              <TouchableOpacity style={styles.speedButton}>
                <Text style={styles.speedText}>0.5x</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.speedButton, styles.speedButtonActive]}>
                <Text style={styles.speedTextActive}>1.0x</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.speedButton}>
                <Text style={styles.speedText}>1.5x</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.speedButton}>
                <Text style={styles.speedText}>2.0x</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Tags Section */}
          {message.tags && message.tags.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {message.tags.map((tag, index) => (
                  <TagBubble key={index} label={tag} />
                ))}
              </View>
            </View>
          )}
          
          {/* Reactions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Reactions</Text>
            {reactions.length > 0 ? (
              <FlatList
                data={reactions}
                renderItem={renderReaction}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reactionsList}
              />
            ) : (
              <Text style={styles.emptyText}>
                No reactions yet. Long-press on the waveform to add a reaction.
              </Text>
            )}
          </View>
          
          {/* Comments/Replies Section */}
          <View style={[styles.sectionContainer, { marginBottom: 100 }]}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {replies.length > 0 ? (
              <View style={styles.repliesContainer}>
                {replies.map(reply => renderReply({ item: reply }))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No comments yet. Add the first comment below.
              </Text>
            )}
          </View>
        </ScrollView>
        
        {/* Emoji Picker */}
        {showEmojiPicker && selectedTimestamp !== null && (
          <View style={styles.emojiPicker}>
            <View style={styles.emojiContainer}>
              {emojiOptions.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiButton}
                  onPress={() => handleAddReaction(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeEmojiButton}
              onPress={() => {
                setShowEmojiPicker(false);
                setSelectedTimestamp(null);
              }}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Reply Input */}
        <View style={styles.replyInputContainer}>
          {selectedTimestamp !== null && (
            <View style={styles.selectedTimestampContainer}>
              <Text style={styles.selectedTimestampText}>
                at {formatTime(selectedTimestamp)}
              </Text>
              <TouchableOpacity onPress={() => setSelectedTimestamp(null)}>
                <Ionicons name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              multiline
            />
            
            {selectedTimestamp !== null && (
              <TouchableOpacity
                style={styles.emojiPickerButton}
                onPress={() => setShowEmojiPicker(true)}
              >
                <Ionicons name="happy-outline" size={24} color="#5A67F2" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                !replyText.trim() && styles.sendButtonDisabled
              ]}
              disabled={!replyText.trim()}
              onPress={handleSendReply}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  waveformContainer: {
    height: 100,
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5A67F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  speedButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
  },
  speedButtonActive: {
    backgroundColor: '#5A67F2',
  },
  speedText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  speedTextActive: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reactionsList: {
    paddingVertical: 8,
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  replyText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  replyInputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  selectedTimestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  selectedTimestampText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  replyInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 48,
    fontSize: 16,
  },
  emojiPickerButton: {
    position: 'absolute',
    right: 50,
    bottom: 8,
    padding: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5A67F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  emojiPicker: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingVertical: 12,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  emojiButton: {
    padding: 10,
  },
  emojiText: {
    fontSize: 24,
  },
  closeEmojiButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    padding: 6,
  },
});

export default MessageDetailScreen;
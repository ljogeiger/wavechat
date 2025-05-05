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
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { formatTime } from '../utils/audioUtils';
import { addReactionToMessage, addReplyToMessage } from '../services/databaseService';
import TagBubble from '../components/common/TagBubble';
import TimestampReaction from '../components/TimestampReaction';
import DetailedWaveform from '../components/audio/DetailedWaveform';

// Type definitions
interface Message {
  id: string;
  audioUri: string;
  duration: number;
  waveform: number[];
  reactions?: Reaction[];
  replies?: Reply[];
}

interface Reaction {
  id: string;
  emoji: string;
  timestamp: number;
  username: string;
}

interface Reply {
  id: string;
  text: string;
  timestamp: number;
  username: string;
  createdAt: string;
}

type RootStackParamList = {
  MessageDetail: {
    message: Message;
  };
};

type MessageDetailScreenRouteProp = RouteProp<RootStackParamList, 'MessageDetail'>;

const { width } = Dimensions.get('window');

const MessageDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MessageDetailScreenRouteProp>();
  const { message } = route.params;
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [replyText, setReplyText] = useState<string>('');
  const [replyTimestamp, setReplyTimestamp] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>(message.reactions || []);
  const [replies, setReplies] = useState<Reply[]>(message.replies || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('👍');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const isScrubbingRef = useRef<boolean>(false);
  
  // Common emoji options
  const emojiOptions: string[] = ['👍', '❤️', '😂', '😮', '👏', '🔥', '❓', '⭐'];
  
  useEffect(() => {
    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  const loadAudio = async (): Promise<void> => {
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
  
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded || isScrubbingRef.current) return;
    
    if (status.isPlaying && status.durationMillis) {
      setPlaybackPosition(status.positionMillis / status.durationMillis);
      setPlaybackTime(status.positionMillis / 1000);
    }
    
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPlaybackPosition(0);
      setPlaybackTime(0);
    }
  };
  
  const togglePlayback = async (): Promise<void> => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const seekAudio = async (value: number): Promise<void> => {
    if (!soundRef.current) return;
    
    const seekPosition = value * (message.duration * 1000);
    await soundRef.current.setPositionAsync(seekPosition);
    setPlaybackTime(seekPosition / 1000);
  };
  
  const handleSliderValueChange = (value: number): void => {
    isScrubbingRef.current = true;
    setPlaybackPosition(value);
  };
  
  const handleSliderComplete = async (value: number): Promise<void> => {
    await seekAudio(value);
    isScrubbingRef.current = false;
  };
  
  const jumpBackward = async (): Promise<void> => {
    if (!soundRef.current) return;
    
    const newPosition = Math.max(0, playbackTime - 5) * 1000;
    await soundRef.current.setPositionAsync(newPosition);
  };
  
  const jumpForward = async (): Promise<void> => {
    if (!soundRef.current) return;
    
    const newPosition = Math.min(message.duration, playbackTime + 5) * 1000;
    await soundRef.current.setPositionAsync(newPosition);
  };
  
  const handleWaveformPress = (position: number): void => {
    seekAudio(position);
  };
  
  const handleTimestampSelection = (timestamp: number): void => {
    setReplyTimestamp(timestamp);
    setSelectedTimestamp(timestamp);
  };
  
  const handleAddReaction = async (emoji: string): Promise<void> => {
    if (!selectedTimestamp) return;
    
    const newReaction: Reaction = {
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
  
  const handleSendReply = async (): Promise<void> => {
    if (!replyText.trim()) return;
    
    const newReply: Reply = {
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
  
  const renderReaction = ({ item }: { item: Reaction }) => (
    <TimestampReaction
      reaction={item}
      duration={message.duration}
      onPress={() => seekAudio(item.timestamp / message.duration)}
    />
  );
  
  const renderReply = ({ item }: { item: Reply }) => (
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
                selectedTimestamp={selectedTimestamp ?? 0}
                duration={message.duration}
                showTimestamps={true}
                showSelectedMarker={true}
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
              <TouchableOpacity onPress={jumpBackward}>
                <MaterialCommunityIcons name="rewind-5" size={24} color="#333" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={togglePlayback}>
                <MaterialCommunityIcons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={48}
                  color="#5A67F2"
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={jumpForward}>
                <MaterialCommunityIcons name="fast-forward-5" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Reactions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reactions</Text>
            <FlatList
              data={reactions}
              renderItem={renderReaction}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
          
          {/* Replies Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Replies</Text>
            <FlatList
              data={replies}
              renderItem={renderReply}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
        
        {/* Reply Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Add a reply..."
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendReply}
            disabled={!replyText.trim()}
          >
            <Ionicons name="send" size={24} color={replyText.trim() ? '#5A67F2' : '#999'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 12,
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
    marginTop: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  replyItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  replyUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  replyText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default MessageDetailScreen; 
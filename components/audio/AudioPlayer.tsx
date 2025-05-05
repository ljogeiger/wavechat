import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WaveformVisualizer from './WaveformVisualizer';
import { formatTime } from '../../utils/timeUtils';
import useAudioPlayer from '../../hooks/useAudioPlayer';

interface AudioMessage {
  id: string;
  audioUri: string;
  audioDuration: number;
  waveform?: number[];
}

interface AudioPlayerProps {
  message: AudioMessage;
  isUserMessage?: boolean;
  onPlaybackComplete?: () => void;
  style?: ViewStyle;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  message, 
  isUserMessage = false,
  onPlaybackComplete,
  style,
}) => {
  // Use the audio player hook
  const { 
    currentAudioId,
    isPlaying,
    playbackPosition,
    isLoading,
    playbackError,
    togglePlayback
  } = useAudioPlayer();
  
  // Detect if this is the currently playing audio
  const isCurrentAudio = currentAudioId === message.id;
  const isThisPlaying = isCurrentAudio && isPlaying;
  
  // Local loading state for this specific message
  const [localLoading, setLocalLoading] = useState(false);
  
  // Handle play/pause button press
  const handlePlayPause = useCallback(async () => {
    if (isLoading || localLoading) return;
    
    setLocalLoading(true);
    await togglePlayback(message.audioUri, message.id);
    setLocalLoading(false);
  }, [message, togglePlayback, isLoading, localLoading]);
  
  // Reset local loading state if there's an error
  useEffect(() => {
    if (playbackError) {
      setLocalLoading(false);
    }
  }, [playbackError]);
  
  // Handle playback completion
  useEffect(() => {
    if (isCurrentAudio && playbackPosition === 0 && !isPlaying && !isLoading && onPlaybackComplete) {
      onPlaybackComplete();
    }
  }, [isCurrentAudio, playbackPosition, isPlaying, isLoading, onPlaybackComplete]);
  
  return (
    <View style={[styles.container, style]}>
      {/* Duration */}
      <Text 
        style={[
          styles.duration, 
          isUserMessage ? styles.userMessageText : styles.otherMessageText
        ]}
      >
        {formatTime(message.audioDuration)}
      </Text>
      
      {/* Play/Pause Button */}
      <TouchableOpacity 
        style={[
          styles.playButton,
          isUserMessage ? styles.userPlayButton : styles.otherPlayButton
        ]}
        onPress={handlePlayPause}
        disabled={isLoading || localLoading}
      >
        {isLoading || localLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Ionicons 
            name={isThisPlaying ? "pause" : "play"} 
            size={20} 
            color="#FFFFFF" 
          />
        )}
      </TouchableOpacity>
      
      {/* Waveform */}
      <View style={styles.waveformContainer}>
        <WaveformVisualizer
          waveform={message.waveform || []}
          isPlaying={isThisPlaying}
          playbackPosition={isCurrentAudio ? playbackPosition : 0}
          isUserMessage={isUserMessage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userPlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  otherPlayButton: {
    backgroundColor: 'rgba(90, 103, 242, 0.8)',
  },
  waveformContainer: {
    flex: 1,
    height: 40,
  },
  duration: {
    fontSize: 12,
    marginRight: 8,
  },
  userMessageText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageText: {
    color: '#666',
  },
});

export default React.memo(AudioPlayer); 
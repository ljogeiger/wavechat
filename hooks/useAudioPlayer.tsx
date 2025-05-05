import { useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import * as Haptics from 'expo-haptics';

interface AudioPlayerState {
  currentAudioId: string | null;
  isPlaying: boolean;
  playbackPosition: number;
  isLoading: boolean;
  playbackError: string | null;
}

interface AudioPlayerHook {
  currentAudioId: string | null;
  isPlaying: boolean;
  playbackPosition: number;
  isLoading: boolean;
  playbackError: string | null;
  togglePlayback: (audioUri: string, audioId: string) => Promise<void>;
}

const isLoadedStatus = (status: AVPlaybackStatus): status is AVPlaybackStatusSuccess => {
  return status.isLoaded && 
         'durationMillis' in status && 
         'positionMillis' in status &&
         typeof status.durationMillis === 'number' &&
         status.durationMillis > 0;
};

const useAudioPlayer = (): AudioPlayerHook => {
  const [state, setState] = useState<AudioPlayerState>({
    currentAudioId: null,
    isPlaying: false,
    playbackPosition: 0,
    isLoading: false,
    playbackError: null,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (positionTimerRef.current) {
        clearInterval(positionTimerRef.current);
      }
    };
  }, []);

  // Update playback position periodically when playing
  useEffect(() => {
    if (state.isPlaying) {
      positionTimerRef.current = setInterval(async () => {
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync() as AVPlaybackStatus;
          if (isLoadedStatus(status) && status.durationMillis) {
            setState(prev => ({
              ...prev,
              playbackPosition: status.positionMillis / status.durationMillis,
            }));
          }
        }
      }, 100);
    } else if (positionTimerRef.current) {
      clearInterval(positionTimerRef.current);
    }

    return () => {
      if (positionTimerRef.current) {
        clearInterval(positionTimerRef.current);
      }
    };
  }, [state.isPlaying]);

  const togglePlayback = async (audioUri: string, audioId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, playbackError: null }));

      // If we're already playing this audio, just toggle play/pause
      if (soundRef.current && state.currentAudioId === audioId) {
        const status = await soundRef.current.getStatusAsync() as AVPlaybackStatus;
        if (isLoadedStatus(status)) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
          } else {
            await soundRef.current.playAsync();
            setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
          }
          return;
        }
      }

      // If we're playing a different audio, stop the current one
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load and play the new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (!isLoadedStatus(status)) return;
          
          // Handle playback completion
          if (status.didJustFinish) {
            setState(prev => ({
              ...prev,
              isPlaying: false,
              playbackPosition: 0,
            }));
          }
        }
      );

      soundRef.current = sound;
      setState(prev => ({
        ...prev,
        currentAudioId: audioId,
        isPlaying: true,
        playbackPosition: 0,
        isLoading: false,
      }));

      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    } catch (error) {
      console.error('Audio playback error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        playbackError: error instanceof Error ? error.message : 'Failed to play audio',
      }));
    }
  };

  return {
    ...state,
    togglePlayback,
  };
};

export default useAudioPlayer; 
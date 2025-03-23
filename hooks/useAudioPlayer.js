import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { generateWaveform } from '../services/databaseService';

/**
 * Custom hook for handling audio recording functionality
 * @returns {Object} Audio recording state and functions
 */
const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  
  const recordingRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);
  
  /**
   * Start audio recording
   * @returns {Promise<boolean>} Success status
   */
  const startRecording = async () => {
    try {
      setRecordingError(null);
      
      // Reset recording state
      setRecordingTime(0);
      
      // Configure audio recording settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });
      
      // Prepare and start recording
      const recording = new Audio.Recording();
      
      // Configure recording options based on platform
      const recordingOptions = Platform.OS === 'ios' 
        ? Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        : {
            android: {
              extension: '.m4a',
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
            },
            ios: {
              extension: '.m4a',
              audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
          };
      
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      
      // Start timer for recording duration
      let timeElapsed = 0;
      recordingTimerRef.current = setInterval(() => {
        timeElapsed += 1;
        setRecordingTime(timeElapsed);
      }, 1000);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      return true;
    } catch (error) {
      console.error('Failed to start recording', error);
      setRecordingError(`Recording failed: ${error.message}`);
      setIsRecording(false);
      return false;
    }
  };
  
  /**
   * Stop current audio recording
   * @returns {Promise<Object|null>} Recording info or null if failed
   */
  const stopRecording = async () => {
    try {
      setIsProcessingRecording(true);
      
      if (!recordingRef.current) {
        setIsProcessingRecording(false);
        return null;
      }
      
      // Stop recording and timer
      await recordingRef.current.stopAndUnloadAsync();
      clearInterval(recordingTimerRef.current);
      
      // Get recording data
      const uri = recordingRef.current.getURI();
      
      // Generate waveform data
      const waveformData = await generateWaveform(uri);
      
      // Reset state
      const duration = recordingTime;
      recordingRef.current = null;
      recordingTimerRef.current = null;
      setIsRecording(false);
      setRecordingTime(0);
      setIsProcessingRecording(false);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      return {
        uri,
        duration,
        waveform: waveformData,
      };
    } catch (error) {
      console.error('Failed to stop recording', error);
      setRecordingError(`Failed to process recording: ${error.message}`);
      
      // Reset state
      recordingRef.current = null;
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
      setIsRecording(false);
      setRecordingTime(0);
      setIsProcessingRecording(false);
      
      return null;
    }
  };
  
  /**
   * Cancel current recording
   */
  const cancelRecording = async () => {
    try {
      if (!recordingRef.current) return;
      
      // Stop and discard recording
      await recordingRef.current.stopAndUnloadAsync();
      clearInterval(recordingTimerRef.current);
      
      // Reset state
      recordingRef.current = null;
      recordingTimerRef.current = null;
      setIsRecording(false);
      setRecordingTime(0);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Error canceling recording:', error);
      
      // Reset state anyway
      recordingRef.current = null;
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
      setIsRecording(false);
      setRecordingTime(0);
    }
  };
  
  return {
    isRecording,
    recordingTime,
    recordingError,
    isProcessingRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};

export default useAudioRecorder;
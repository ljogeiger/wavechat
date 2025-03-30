import { useState, useEffect, useRef } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { generateWaveform } from '../services/databaseService';

/**
 * Custom hook for handling audio recording functionality with built-in permission handling
 * @returns {Object} Audio recording state and functions
 */
const useAudioRecorder = () => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  
  // Permission state
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  
  // References to active recording
  const recordingRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Check permissions on mount
  useEffect(() => {
    checkPermission();
    
    // Cleanup function
    return () => {
      stopRecording();
    };
  }, []);
  
  /**
   * Check current audio recording permission status using Audio.requestPermissionsAsync
   * @returns {Promise<boolean>} Whether permission is granted
   */
  const checkPermission = async () => {
    try {
      setIsCheckingPermission(true);
      
      // Using Audio.getPermissionsAsync() instead of Permissions.getAsync()
      const { status, granted } = await Audio.getPermissionsAsync();
      
      setPermissionStatus(status);
      setHasPermission(granted);
      setIsCheckingPermission(false);
      return granted;
    } catch (error) {
      console.error('Error checking audio permission:', error);
      setIsCheckingPermission(false);
      setPermissionStatus('undetermined');
      setHasPermission(false);
      return false;
    }
  };
  
  /**
   * Request audio recording permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  const requestPermission = async () => {
    try {
      setIsCheckingPermission(true);
      
      // If permission was previously denied, explain why we need it
      if (permissionStatus === 'denied') {
        Alert.alert(
          "Microphone Permission Required",
          "WaveChat needs access to your microphone to record audio messages. Without this permission, you won't be able to send voice messages.",
          [
            { 
              text: "Cancel", 
              style: "cancel"
            },
            { 
              text: "Open Settings", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        setIsCheckingPermission(false);
        return false;
      }
      
      // Using Audio.requestPermissionsAsync() instead of Permissions.askAsync()
      const { status, granted } = await Audio.requestPermissionsAsync();
      
      setPermissionStatus(status);
      setHasPermission(granted);
      
      // If denied, explain why we need it
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "WaveChat cannot record audio messages without microphone access. You can enable this in your device settings.",
          [
            { 
              text: "OK", 
              style: "cancel" 
            },
            { 
              text: "Open Settings", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
      
      setIsCheckingPermission(false);
      return granted;
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      setIsCheckingPermission(false);
      return false;
    }
  };
  
  /**
   * Ensure we have permission before starting recording
   * @returns {Promise<boolean>} Success status
   */
  const ensurePermission = async () => {
    // First check current status
    const hasCurrentPermission = await checkPermission();
    
    // If already granted, return true
    if (hasCurrentPermission) {
      return true;
    }
    
    // Otherwise request permission
    return await requestPermission();
  };
  
  /**
   * Start audio recording
   * @returns {Promise<boolean>} Success status
   */
  const startRecording = async () => {
    try {
      setRecordingError(null);
      
      // Ensure we have permission
      const hasRecordingPermission = await ensurePermission();
      if (!hasRecordingPermission) {
        setRecordingError('Microphone permission not granted');
        return false;
      }
      
      // Reset recording state
      setRecordingTime(0);
      
      // Configure audio recording settings with correct values
      // Using enum values directly to avoid potential issues
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // Fix for iOS interruption mode
        // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        // Fix for Android interruption mode
        // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      
      // Prepare and start recording
      const recording = new Audio.Recording();
      
      // Configure recording options based on platform
      const recordingOptions = Platform.OS === 'ios' 
        ? {
            isMeteringEnabled: true,
            android: {},
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
          }
        : {
            android: {
              extension: '.m4a',
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
            },
            ios: {},
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
    // Recording state
    isRecording,
    recordingTime,
    recordingError,
    isProcessingRecording,
    
    // Permission state
    hasPermission,
    permissionStatus,
    isCheckingPermission,
    
    // Functions
    checkPermission,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};

export default useAudioRecorder;
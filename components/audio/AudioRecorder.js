import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatTime } from '../../utils/timeUtils';
import useAudioRecorder from '../../hooks/useAudioRecorder';

/**
 * AudioRecorder component
 * 
 * @param {Object} props
 * @param {Function} props.onRecordingComplete - Callback when recording is complete
 * @param {Function} props.onRecordingCancel - Callback when recording is canceled
 */
const AudioRecorder = ({ onRecordingComplete, onRecordingCancel }) => {
  const {
    isRecording,
    recordingTime,
    recordingError,
    isProcessingRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();
  
  // UI State
  const [isDragCanceling, setIsDragCanceling] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dragPositionY = useRef(new Animated.Value(0)).current;
  
  // Start pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Scale button up when recording starts
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Stop animation and scale back down when recording stops
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
      
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, pulseAnim, scaleAnim]);
  
  // Show error alert if recording fails
  useEffect(() => {
    if (recordingError) {
      console.error('Recording error:', recordingError);
      // Could show an error toast here instead of an alert
    }
  }, [recordingError]);
  
  // Handle recording start
  const handlePressIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startRecording();
  };
  
  // Handle recording stop
  const handlePressOut = async () => {
    if (!isRecording) return;
    
    if (isDragCanceling) {
      // User dragged up to cancel
      setIsDragCanceling(false);
      dragPositionY.setValue(0);
      
      // Cancel recording
      await cancelRecording();
      
      if (onRecordingCancel) {
        onRecordingCancel();
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      // Normal recording completion
      const recordingData = await stopRecording();
      
      if (recordingData && onRecordingComplete) {
        onRecordingComplete(recordingData);
      }
    }
  };
  
  // Handle touch movement for cancel gesture
  const handleTouchMove = (event) => {
    if (!isRecording) return;
    
    // Get the vertical movement distance
    const { locationY } = event.nativeEvent;
    const startY = event.nativeEvent.pageY - locationY;
    const moveDistance = startY - 100; // Adjust based on your UI
    
    // If user dragged up more than threshold, activate cancel mode
    if (moveDistance < -70) {
      if (!isDragCanceling) {
        setIsDragCanceling(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      setIsDragCanceling(false);
    }
  };
  
  // Interpolate animation values
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });
  
  // Button color based on state
  const buttonColor = isDragCanceling 
    ? '#FF3B30' // Red for cancel
    : isRecording 
      ? '#FF9500' // Orange for recording
      : '#5A67F2'; // Purple for normal state
  
  return (
    <View style={styles.container} className="audio-recorder-component">
      {isRecording && (
        <Animated.View 
          style={[
            styles.cancelHint,
            {
              opacity: isDragCanceling ? 1 : 0.7,
              transform: [{ translateY: dragPositionY }]
            }
          ]}
        >
          <Ionicons name="arrow-up" size={20} color="#FF3B30" />
          <Text style={styles.cancelHintText}>
            {isDragCanceling ? "Release to cancel" : "Slide up to cancel"}
          </Text>
        </Animated.View>
      )}
      
      <Animated.View
        style={[
          styles.recordButtonContainer,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onTouchMove={handleTouchMove}
          style={({ pressed }) => [
            styles.recordButton,
            {
              backgroundColor: buttonColor,
              opacity: pressed && !isRecording ? 0.9 : 1,
            }
          ]}
          disabled={isProcessingRecording}
        >
          {isProcessingRecording ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : isRecording ? (
            <Animated.View style={{ opacity: pulseOpacity }}>
              <MaterialCommunityIcons name="stop" size={24} color="#FFFFFF" />
            </Animated.View>
          ) : (
            <Ionicons name="mic" size={24} color="#FFFFFF" />
          )}
        </Pressable>
      </Animated.View>
      
      {isRecording ? (
        <View style={styles.recordingInfo}>
          <View style={styles.recordingStatusContainer}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                { opacity: pulseOpacity }
              ]}
            />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
          <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
        </View>
      ) : (
        <Text style={styles.hintText}>
          Hold to record voice message
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  recordButtonContainer: {
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 200,
    marginTop: 8,
  },
  recordingStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  recordingText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  hintText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  cancelHint: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
  },
  cancelHintText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default React.memo(AudioRecorder);
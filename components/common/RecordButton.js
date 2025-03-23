import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * RecordButton component for audio recording
 * 
 * @param {Object} props
 * @param {boolean} props.isRecording - Whether recording is active
 * @param {Function} props.onPressIn - Callback when button is pressed
 * @param {Function} props.onPressOut - Callback when button is released
 * @param {Function} props.onLongPress - Callback for long press
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Object} props.style - Additional styles for the container
 */
const RecordButton = ({
  isRecording = false,
  onPressIn,
  onPressOut,
  onLongPress,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      disabled={disabled}
      style={[styles.touchable, style]}
      accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
      accessibilityRole="button"
      accessibilityHint={isRecording ? "Release to stop recording" : "Press and hold to record a voice message"}
    >
      <LinearGradient
        colors={isRecording ? ['#FF3B30', '#FF9500'] : ['#5A67F2', '#7D88F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.innerCircle, isRecording && styles.recordingInnerCircle]}>
          <Ionicons
            name={isRecording ? "square" : "mic"}
            size={24}
            color={isRecording ? "#FF3B30" : "#5A67F2"}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInnerCircle: {
    backgroundColor: '#FFFFFF',
  },
});

export default memo(RecordButton);
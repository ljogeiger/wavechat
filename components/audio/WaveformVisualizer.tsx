import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WaveformVisualizerProps {
  waveform: number[];
  isPlaying: boolean;
  playbackPosition: number;
  isUserMessage: boolean;
  style?: ViewStyle;
  barWidth?: number;
  barGap?: number;
  minBarHeight?: number;
  maxBarHeight?: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  waveform = [], 
  isPlaying = false,
  playbackPosition = 0,
  isUserMessage = true,
  style,
  barWidth = 2,
  barGap = 1,
  minBarHeight = 3,
  maxBarHeight = 30,
}) => {
  // Define colors based on message sender and playback state
  const activeColor = isUserMessage ? '#FFFFFF' : '#5A67F2';
  const inactiveColor = isUserMessage ? 'rgba(255, 255, 255, 0.5)' : 'rgba(90, 103, 242, 0.4)';
  
  // Calculate which bars should be highlighted based on playback position
  const highlightedBars = Math.floor(waveform.length * playbackPosition);
  
  // Create a more optimized set of bars for display
  // If the waveform is very long, we'll sample it to fit the available width
  const optimizedWaveform = useMemo(() => {
    if (!waveform || waveform.length === 0) {
      // Generate a placeholder waveform if none is provided
      return Array(30).fill(0).map(() => 0.1 + (Math.random() * 0.5));
    }
    
    // Calculate the maximum number of bars that can fit in the available width
    // Subtract some padding to ensure it fits nicely
    const availableWidth = SCREEN_WIDTH * 0.6; // Use 60% of screen width
    const totalBarWidth = barWidth + barGap;
    const maxBars = Math.floor(availableWidth / totalBarWidth);
    
    // If the waveform has fewer bars than we can display, use it as is
    if (waveform.length <= maxBars) {
      return waveform;
    }
    
    // Otherwise, sample the waveform to fit
    const sampledWaveform = [];
    const samplingRate = waveform.length / maxBars;
    
    for (let i = 0; i < maxBars; i++) {
      const startIdx = Math.floor(i * samplingRate);
      const endIdx = Math.floor((i + 1) * samplingRate);
      
      // Take the maximum value in this range to preserve peaks
      let maxValue = 0;
      for (let j = startIdx; j < endIdx && j < waveform.length; j++) {
        maxValue = Math.max(maxValue, waveform[j]);
      }
      
      sampledWaveform.push(maxValue);
    }
    
    return sampledWaveform;
  }, [waveform, barWidth, barGap]);
  
  return (
    <View style={[styles.container, style]}>
      {optimizedWaveform.map((amplitude, index) => {
        // Normalize amplitude to a reasonable height (between min and max)
        const height = minBarHeight + (amplitude * (maxBarHeight - minBarHeight));
        
        // Determine if this bar should be highlighted
        const isHighlighted = isPlaying && index <= highlightedBars;
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height,
                width: barWidth,
                backgroundColor: isHighlighted ? activeColor : inactiveColor,
                marginHorizontal: barGap / 2,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 1,
  },
});

export default React.memo(WaveformVisualizer); 
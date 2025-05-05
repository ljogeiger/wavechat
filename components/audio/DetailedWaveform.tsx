import React, { useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  PanResponder,
  Dimensions,
  Text,
  GestureResponderEvent
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatTime } from '../../utils/timeUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DetailedWaveformProps {
  waveform: number[];
  playbackPosition: number;
  onPress: (position: number) => void;
  onLongPress: (timestamp: number) => void;
  selectedTimestamp: number | null;
  duration: number;
  showTimestamps?: boolean;
  showSelectedMarker?: boolean;
}

const DetailedWaveform: React.FC<DetailedWaveformProps> = ({ 
  waveform = [], 
  playbackPosition = 0, 
  onPress, 
  onLongPress,
  selectedTimestamp = null,
  duration = 0,
  showTimestamps = true,
  showSelectedMarker = true,
}) => {
  const containerRef = useRef<View>(null);
  const layoutWidth = useRef<number>(0);

  // Calculate selected position as a percentage
  const selectedPosition = selectedTimestamp !== null && duration > 0
    ? selectedTimestamp / duration
    : null;
  
  // Calculate which bars should be highlighted based on playback position
  const highlightedBars = Math.floor(waveform.length * playbackPosition);

  // Set up pan responder for handling interactive gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Handle initial touch
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        // Handle touch movement (drag)
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        // Touch ended
      },
      onPanResponderTerminate: () => {
        // Touch cancelled
      },
    })
  ).current;

  // Handle touch/press on waveform
  const handleTouch = useCallback((locationX: number) => {
    if (!layoutWidth.current) return;
    
    // Calculate position as percentage
    const position = Math.max(0, Math.min(1, locationX / layoutWidth.current));
    
    // Call the provided callback
    if (onPress) {
      onPress(position);
    }
  }, [onPress]);

  // Handle long press on waveform
  const handleLongPress = useCallback((event: GestureResponderEvent) => {
    if (!onLongPress || !layoutWidth.current) return;
    
    // Get touch position and calculate timestamp
    const position = event.nativeEvent.locationX / layoutWidth.current;
    const timestamp = position * duration;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call the provided callback
    onLongPress(timestamp);
  }, [onLongPress, duration]);
  
  // Handle layout and store container width
  const onLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    layoutWidth.current = event.nativeEvent.layout.width;
  }, []);

  // Generate time markers (e.g., every 15 seconds)
  const generateTimeMarkers = useCallback(() => {
    if (!duration || !showTimestamps) return null;
    
    const markers = [];
    // Show markers every 15 seconds, or adjust based on duration
    const interval = duration <= 30 ? 5 : duration <= 60 ? 10 : 15;
    
    for (let time = 0; time <= duration; time += interval) {
      // Skip the last marker if it's too close to the end
      if (time > duration - interval / 2) continue;
      
      const position = time / duration;
      markers.push(
        <View
          key={`marker-${time}`}
          style={[
            styles.timeMarker,
            { left: `${position * 100}%` }
          ]}
        >
          <View style={styles.timeMarkerLine} />
          <Text style={styles.timeMarkerText}>{formatTime(time)}</Text>
        </View>
      );
    }
    
    return markers;
  }, [duration, showTimestamps]);
  
  return (
    <View style={styles.outerContainer}>
      <TouchableWithoutFeedback 
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        <View 
          ref={containerRef}
          style={styles.container}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          {/* Waveform bars */}
          {waveform.map((amplitude, index) => {
            // Normalize amplitude to a reasonable height
            const height = 10 + (amplitude * 80);
            
            // Determine colors
            const isHighlighted = index <= highlightedBars;
            
            let barColor = '#D1D5DB'; // Default color for non-played bars
            
            if (isHighlighted) {
              barColor = '#5A67F2'; // Purple for played portion
            }
            
            return (
              <View
                key={index}
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: barColor,
                  },
                ]}
              />
            );
          })}
          
          {/* Playback position indicator */}
          <View 
            style={[
              styles.playbackIndicator,
              { left: `${playbackPosition * 100}%` }
            ]}
          />
          
          {/* Selected timestamp indicator */}
          {selectedPosition !== null && showSelectedMarker && (
            <View 
              style={[
                styles.selectedIndicator,
                { left: `${selectedPosition * 100}%` }
              ]}
            >
              <View style={styles.selectedIndicatorDot} />
              {selectedTimestamp !== null && (
                <View style={styles.selectedTimestampBubble}>
                  <Text style={styles.selectedTimestampText}>
                    {formatTime(selectedTimestamp)}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Time markers */}
          {generateTimeMarkers()}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    position: 'relative',
    paddingVertical: 10,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  playbackIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#5A67F2',
    zIndex: 10,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'transparent',
    zIndex: 20,
    alignItems: 'center',
  },
  selectedIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    position: 'absolute',
    top: '50%',
    marginTop: -6,
  },
  selectedTimestampBubble: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedTimestampText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timeMarker: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  timeMarkerLine: {
    width: 1,
    height: 8,
    backgroundColor: '#D1D5DB',
  },
  timeMarkerText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default DetailedWaveform; 
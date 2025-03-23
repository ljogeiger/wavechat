import React, { useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  PanResponder,
  Dimensions,
  Text
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatTime } from '../../utils/timeUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Detailed waveform visualization component with interactive features
 * 
 * @param {Object} props
 * @param {Array} props.waveform - Array of amplitude values (0-1)
 * @param {number} props.playbackPosition - Current playback position (0-1)
 * @param {Function} props.onPress - Function to call when a position is tapped
 * @param {Function} props.onLongPress - Function to call when a position is long-pressed
 * @param {number} props.selectedTimestamp - Currently selected timestamp in seconds
 * @param {number} props.duration - Audio duration in seconds
 * @param {boolean} props.showTimestamps - Whether to show timestamp markers (default: true)
 * @param {boolean} props.showSelectedMarker - Whether to show the selected position marker (default: true)
 */
const DetailedWaveform = ({ 
  waveform = [], 
  playbackPosition = 0, 
  onPress, 
  onLongPress,
  selectedTimestamp = null,
  duration = 0,
  showTimestamps = true,
  showSelectedMarker = true,
}) => {
  const containerRef = useRef(null);
  const layoutWidth = useRef(0);

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
  const handleTouch = useCallback((locationX) => {
    if (!layoutWidth.current) return;
    
    // Calculate position as percentage
    const position = Math.max(0, Math.min(1, locationX / layoutWidth.current));
    
    // Call the provided callback
    if (onPress) {
      onPress(position);
    }
  }, [onPress, layoutWidth.current]);

  // Handle long press on waveform
  const handleLongPress = useCallback((event) => {
    if (!onLongPress || !layoutWidth.current) return;
    
    // Get touch position and calculate timestamp
    const position = event.nativeEvent.locationX / layoutWidth.current;
    const timestamp = position * duration;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call the provided callback
    onLongPress(timestamp);
  }, [onLongPress, duration, layoutWidth.current]);
  
  // Handle layout and store container width
  const onLayout = useCallback((event) => {
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
    top: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: -30,
  },
  selectedTimestampText: {
    color: 'white',
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
    backgroundColor: '#A3A3A3',
  },
  timeMarkerText: {
    color: '#A3A3A3',
    fontSize: 10,
    marginTop: 2,
  },
});

export default React.memo(DetailedWaveform);
import React, { memo } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * TagBubble component for message tags
 * 
 * @param {Object} props
 * @param {string} props.label - Tag text
 * @param {Function} props.onPress - Callback when tag is pressed
 * @param {boolean} props.isDark - Whether to use dark mode styling
 * @param {object} props.style - Additional styles
 */
const TagBubble = ({ label, onPress, isDark = false, style }) => {
  // Generate a consistent but semi-random color based on the tag text
  const getTagColor = (text) => {
    const colors = [
      '#FF9500', // Orange
      '#34C759', // Green
      '#AF52DE', // Purple
      '#FF2D55', // Pink
      '#5856D6', // Indigo
      '#007AFF', // Blue
      '#00C7BE', // Teal
      '#FF3B30', // Red
    ];
    
    // Simple hash function to generate consistent index
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const tagColor = getTagColor(label);
  
  // Adjust colors for dark mode
  const backgroundColor = isDark 
    ? `${tagColor}50` // Add 50% transparency
    : `${tagColor}20`; // Add 20% transparency
  
  const textColor = isDark ? '#FFFFFF' : tagColor;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Tag: ${label}`}
      accessibilityRole="button"
    >
      <Text style={[styles.label, { color: textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default memo(TagBubble);
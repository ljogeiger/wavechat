import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isToday } from '../../utils/timeUtils';

/**
 * Date separator component for message list
 * 
 * @param {Object} props
 * @param {string} props.date - Date string to display
 */
const DateSeparator = ({ date }) => {
  if (!date) return null;
  
  // Format the date for display
  const formatDate = () => {
    const dateObj = new Date(date);
    
    if (isToday(date)) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Check if it's within the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (dateObj > oneWeekAgo) {
      return dateObj.toLocaleDateString(undefined, { weekday: 'long' });
    }
    
    // Default date format
    return dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateContainer: {
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
});

export default memo(DateSeparator);
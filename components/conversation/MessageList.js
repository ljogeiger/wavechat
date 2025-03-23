import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MessageItem from './MessageItem';  // Import the wrapper component
import DateSeparator from './DateSeparator';
import EmptyState from '../common/EmptyState';
import { groupMessagesByDate } from '../../utils/timeUtils';
/**
 * MessageList component for displaying conversation messages
 * 
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.loading - Whether messages are loading
 * @param {Function} props.onRefresh - Callback for pull-to-refresh
 * @param {boolean} props.refreshing - Whether refresh is in progress
 * @param {Function} props.onMessageLongPress - Callback when a message is long-pressed
 * @param {Function} props.onMessageOptions - Callback when message options button is pressed
 * @param {Function} props.onTagPress - Callback when a message tag is pressed
 * @param {Function} props.onMessagePress - Callback when a message is pressed
 * @param {string} props.currentUserId - ID of the current user
 */
const MessageList = ({
  messages = [],
  loading = false,
  onRefresh,
  refreshing = false,
  onMessageLongPress,
  onMessageOptions,
  onTagPress,
  onMessagePress,
  currentUserId = '123', // Default to test user ID
}) => {
  const listRef = useRef(null);
  const [contentSize, setContentSize] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Process messages to add date separators
  const processedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, shouldAutoScroll]);
  
  // Handle scroll events to determine auto-scroll behavior
  const handleScroll = useCallback(({ nativeEvent }) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    
    // If user has scrolled up more than 200px from bottom, disable auto-scroll
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setShouldAutoScroll(distanceFromBottom < 200);
  }, []);
  
  // Handle content size change
  const handleContentSizeChange = useCallback((width, height) => {
    setContentSize(height);
  }, []);
  
  // Handle layout change
  const handleLayout = useCallback(({ nativeEvent }) => {
    setLayoutHeight(nativeEvent.layout.height);
  }, []);
  
  // Render a message item based on its type
const renderItem = useCallback(({ item }) => {
    // If this item has a date separator flag, render the separator
    const separator = item.showDateSeparator ? (
      <DateSeparator date={item.dateString} />
    ) : null;
    
    // Determine if message is from current user
    const isUserMessage = item.senderId === currentUserId;
    
    // Use the MessageItem wrapper component
    const messageComponent = (
      <MessageItem
        message={item}
        isUserMessage={isUserMessage}
        onLongPress={onMessageLongPress}
        onPressOptions={onMessageOptions}
        onTagPress={onTagPress}
        onPress={onMessagePress}
      />
    );
    
    // Return both the separator (if any) and the message
    return (
      <View>
        {separator}
        {messageComponent}
      </View>
    );
  }, [currentUserId, onMessageLongPress, onMessageOptions, onTagPress, onMessagePress]);

  // Item key extractor for FlatList
  const keyExtractor = useCallback((item) => item.id, []);
  
  // If loading and no messages, show loading indicator
  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A67F2" />
      </View>
    );
  }
  
  // If no messages, show empty state
  if (!loading && messages.length === 0) {
    return (
      <EmptyState
        title="Start a conversation"
        message="Hold the microphone button to record your first voice message"
        icon="microphone"
      />
    );
  }
  
  return (
    <FlatList
      ref={listRef}
      data={processedMessages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      onScroll={handleScroll}
      onContentSizeChange={handleContentSizeChange}
      onLayout={handleLayout}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5A67F2']}
            tintColor="#5A67F2"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={false}
      keyboardShouldPersistTaps="handled"
      
      // Enhanced accessibility
      accessibilityLabel="Message list"
      accessibilityHint="Scroll to view conversation messages"
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(MessageList);
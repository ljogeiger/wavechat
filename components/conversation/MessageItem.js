import React, { memo, useState, useCallback } from 'react';
import AudioMessageItem from './AudioMessageItem';
import TextMessageItem from './TextMessageItem';
import ExpandedMessageView from './ExpandedMessageView';

/**
 * MessageItem component - Smart wrapper that renders the appropriate message type
 * 
 * @param {Object} props
 * @param {Object} props.message - Message data
 * @param {boolean} props.isUserMessage - Whether the message is from the current user
 * @param {Function} props.onLongPress - Callback when message is long-pressed
 * @param {Function} props.onPressOptions - Callback when options button is pressed
 * @param {Function} props.onTagPress - Callback when a tag is pressed
 * @param {Function} props.onPress - Callback when message is pressed
 */
const MessageItem = ({
  message,
  isUserMessage,
  onLongPress,
  onPressOptions,
  onTagPress,
  onPress,
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Handle tap on the message - this is our local handler 
  const handleLocalPress = useCallback(() => {
    console.log('MessageItem - Local press handler called for message ID:', message.id);
    setExpanded(true);
  }, [message.id]);
  
  // Handle closing the expanded view
  const handleCloseExpanded = useCallback(() => {
    console.log('MessageItem - Closing expanded view');
    setExpanded(false);
  }, []);
  
  // Render based on message type
  const renderMessageContent = () => {
    switch (message.type) {
      case 'audio':
        return (
          <AudioMessageItem
            message={message}
            isUserMessage={isUserMessage}
            onLongPress={onLongPress}
            onPressOptions={onPressOptions}
            onTagPress={onTagPress}
            onPress={handleLocalPress} // Use our local press handler
          />
        );
      case 'text':
      default:
        return (
          <TextMessageItem
            message={message}
            isUserMessage={isUserMessage}
            onLongPress={onLongPress}
            onPressOptions={onPressOptions}
            onPress={handleLocalPress} // Use our local press handler
          />
        );
    }
  };
  
  return (
    <>
      {renderMessageContent()}
      
      <ExpandedMessageView
        message={message}
        visible={expanded}
        onClose={handleCloseExpanded}
      />
    </>
  );
};

export default memo(MessageItem);
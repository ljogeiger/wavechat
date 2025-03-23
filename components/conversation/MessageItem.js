import React, { memo } from 'react';
import AudioMessageItem from './AudioMessageItem';
import TextMessageItem from './TextMessageItem';

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
  // Render based on message type
  switch (message.type) {
    case 'audio':
      return (
        <AudioMessageItem
          message={message}
          isUserMessage={isUserMessage}
          onLongPress={onLongPress}
          onPressOptions={onPressOptions}
          onTagPress={onTagPress}
          onPress={onPress}
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
        />
      );
  }
};

export default memo(MessageItem);
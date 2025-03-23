/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Format timestamp to relative time
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Relative time string
   */
  export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  /**
   * Format a timestamp as readable time
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time (HH:MM)
   */
  export const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  /**
   * Check if a message is from the current day
   * @param {string} timestamp - ISO timestamp
   * @returns {boolean} True if from today
   */
  export const isToday = (timestamp) => {
    if (!timestamp) return false;
    
    const today = new Date();
    const date = new Date(timestamp);
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  /**
   * Group messages by date for displaying date separators
   * @param {Array} messages - Array of message objects
   * @returns {Array} Array of messages with date separator flags
   */
  export const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const result = [];
    let currentDate = null;
    
    // Sort messages by timestamp
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    sortedMessages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      const dateString = messageDate.toDateString();
      
      if (dateString !== currentDate) {
        // Add a date separator flag to the message
        result.push({
          ...message,
          showDateSeparator: true,
          dateString,
        });
        currentDate = dateString;
      } else {
        result.push({
          ...message,
          showDateSeparator: false,
        });
      }
    });
    
    return result;
  };
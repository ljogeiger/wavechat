import { useState, useEffect, useCallback, useRef } from 'react';
import { getMessages, sendAudioMessage, sendMessageToGCP, markMessagesAsRead } from '../services/databaseService';

/**
 * Custom hook for handling messages in a conversation
 * @param {string} conversationId - ID of the conversation
 * @returns {Object} Message data and operations
 */
const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Track if the component is mounted
  const isMountedRef = useRef(true);
  
  // Fetch messages for the conversation
  const fetchMessages = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else if (loading === false) {
        // If we're refreshing without showing the spinner, only set loading if it was previously false
        setLoading(true);
      }
      
      setError(null);
      
      const result = await getMessages(conversationId);
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        setMessages(result);
        setLoading(false);
        setRefreshing(false);
      }
      
      // Mark messages as read
      await markMessagesAsRead(conversationId, '123'); // Using '123' as current user ID
      
      return result;
    } catch (err) {
      console.error('Error fetching messages:', err);
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        setError(`Failed to load messages: ${err.message}`);
        setLoading(false);
        setRefreshing(false);
      }
      
      return [];
    }
  }, [conversationId]);
  
  // Initial fetch
  useEffect(() => {
    fetchMessages();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchMessages]);
  
  // Refreshing messages
  const refreshMessages = useCallback(() => {
    return fetchMessages(true);
  }, [fetchMessages]);
  
  /**
   * Send a text message
   * @param {string} text - Text content to send
   * @returns {Promise<Object|null>} Created message or null if failed
   */
  const sendTextMessage = useCallback(async (text) => {
    try {
      setSending(true);
      setError(null);
      
      const messageData = {
        conversationId,
        text,
        senderId: '123', // Current user ID
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      const newMessage = await sendMessageToGCP(messageData);
      
      if (isMountedRef.current) {
        setMessages(prev => [...prev, newMessage]);
        setSending(false);
      }
      
      return newMessage;
    } catch (err) {
      console.error('Error sending text message:', err);
      
      if (isMountedRef.current) {
        setError(`Failed to send message: ${err.message}`);
        setSending(false);
      }
      
      return null;
    }
  }, [conversationId]);
  
  /**
   * Send an audio message
   * @param {Object} audioData - Audio data (uri, duration, etc.)
   * @returns {Promise<Object|null>} Created message or null if failed
   */
  const sendAudioMessageWithData = useCallback(async (audioData) => {
    try {
      setSending(true);
      setError(null);
      
      const messageData = {
        conversationId,
        audioUri: audioData.uri,
        audioDuration: audioData.duration,
        waveform: audioData.waveform,
        senderId: '123', // Current user ID
        timestamp: new Date().toISOString(),
        type: 'audio'
      };
      
      const newMessage = await sendAudioMessage(messageData);
      
      if (isMountedRef.current) {
        setMessages(prev => [...prev, newMessage]);
        setSending(false);
      }
      
      return newMessage;
    } catch (err) {
      console.error('Error sending audio message:', err);
      
      if (isMountedRef.current) {
        setError(`Failed to send audio message: ${err.message}`);
        setSending(false);
      }
      
      return null;
    }
  }, [conversationId]);
  
  /**
   * Add a new message to the local state
   * Useful for optimistic updates
   * @param {Object} message - Message object to add
   */
  const addLocalMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  /**
   * Update a message in the local state
   * @param {string} messageId - ID of the message to update
   * @param {Object} updates - Object with properties to update
   */
  const updateLocalMessage = useCallback((messageId, updates) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);
  
  /**
   * Remove a message from the local state
   * @param {string} messageId - ID of the message to remove
   */
  const removeLocalMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);
  
  return {
    messages,
    loading,
    error,
    refreshing,
    sending,
    fetchMessages,
    refreshMessages,
    sendTextMessage,
    sendAudioMessage: sendAudioMessageWithData,
    addLocalMessage,
    updateLocalMessage,
    removeLocalMessage,
  };
};

export default useMessages;
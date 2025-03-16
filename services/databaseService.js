import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Dummy data for conversations
const dummyMessages = {
    '1': [
      {
        id: '101',
        text: 'Hi Sarah, how are you doing?',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(), // 90 minutes ago
        senderId: '123', // Current user ID
        senderName: 'You',
        type: 'text'
      },
      {
        id: '102',
        text: 'I\'m doing well, thanks for asking! Just finishing up some work on the project.',
        timestamp: new Date(Date.now() - 85 * 60000).toISOString(), // 85 minutes ago
        senderId: '456', // Other user ID (Sarah)
        senderName: 'Sarah Johnson',
        type: 'text'
      },
      {
        id: '103',
        audioDuration: 8,
        timestamp: new Date(Date.now() - 80 * 60000).toISOString(), // 80 minutes ago
        senderId: '123',
        senderName: 'You',
        type: 'audio',
        // audioUri will be set during initialization
      },
      {
        id: '104',
        text: 'Almost done with the dashboard component. Should be able to submit it by tomorrow.',
        timestamp: new Date(Date.now() - 75 * 60000).toISOString(), // 75 minutes ago
        senderId: '456',
        senderName: 'Sarah Johnson',
        type: 'text'
      },
      {
        id: '105',
        text: 'Sounds good. Let me know if you need any help with it.',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(), // 40 minutes ago
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '106',
        audioDuration: 12,
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(), // 35 minutes ago
        senderId: '456',
        senderName: 'Sarah Johnson',
        type: 'audio',
        // audioUri will be set during initialization
      },
    ],
    '2': [
      {
        id: '201',
        text: 'Hey Michael, are you ready for the presentation tomorrow?',
        timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), // 30 hours ago
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '202',
        audioDuration: 22,
        timestamp: new Date(Date.now() - 29 * 3600000).toISOString(), // 29 hours ago
        senderId: '789',
        senderName: 'Michael Chen',
        type: 'audio',
        // audioUri will be set during initialization
      },
      {
        id: '203',
        text: 'Perfect! I think we\'re well prepared then.',
        timestamp: new Date(Date.now() - 28 * 3600000).toISOString(), // 28 hours ago
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '204',
        text: 'Just finished the presentation. I think it went well!',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '205',
        text: 'Great work on the presentation yesterday!',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
        senderId: '789',
        senderName: 'Michael Chen',
        type: 'text'
      },
    ],
    '3': [
      {
        id: '301',
        text: 'Hi Jessica, I\'m working on the frontend integration with the API.',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '302',
        text: 'Nice! Are you using the new endpoint we deployed yesterday?',
        timestamp: new Date(Date.now() - 3 * 86400000 + 30 * 60000).toISOString(), // 3 days ago + 30 minutes
        senderId: '321',
        senderName: 'Jessica Williams',
        type: 'text'
      },
      {
        id: '303',
        audioDuration: 18,
        timestamp: new Date(Date.now() - 3 * 86400000 + 35 * 60000).toISOString(), // 3 days ago + 35 minutes
        senderId: '123',
        senderName: 'You',
        type: 'audio',
        // audioUri will be set during initialization
      },
      {
        id: '304',
        text: 'What kind of issues are you encountering?',
        timestamp: new Date(Date.now() - 3 * 86400000 + 40 * 60000).toISOString(), // 3 days ago + 40 minutes
        senderId: '321',
        senderName: 'Jessica Williams',
        type: 'text'
      },
      {
        id: '305',
        audioDuration: 15,
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        senderId: '321',
        senderName: 'Jessica Williams',
        type: 'audio',
        // audioUri will be set during initialization
      },
    ],
    '4': [
      {
        id: '401',
        text: 'Hey David, I just reviewed your code changes.',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '402',
        audioDuration: 5,
        timestamp: new Date(Date.now() - 5 * 86400000 + 15 * 60000).toISOString(), // 5 days ago + 15 minutes
        senderId: '654',
        senderName: 'David Rodriguez',
        type: 'audio',
        // audioUri will be set during initialization
      },
      {
        id: '403',
        text: 'Looks good overall! I left a few comments for minor improvements.',
        timestamp: new Date(Date.now() - 5 * 86400000 + 30 * 60000).toISOString(), // 5 days ago + 30 minutes
        senderId: '123',
        senderName: 'You',
        type: 'text'
      },
      {
        id: '404',
        text: 'Thanks! I\'ll address those comments tomorrow.',
        timestamp: new Date(Date.now() - 5 * 86400000 + 45 * 60000).toISOString(), // 5 days ago + 45 minutes
        senderId: '654',
        senderName: 'David Rodriguez',
        type: 'text'
      },
      {
        id: '405',
        audioDuration: 10,
        timestamp: new Date(Date.now() - 4 * 86400000 + 5 * 3600000).toISOString(), // 4 days ago + 5 hours
        senderId: '123',
        senderName: 'You',
        type: 'audio',
        // audioUri will be set during initialization
      },
      {
        id: '406',
        text: 'Are we still meeting at 3pm today?',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
        senderId: '654',
        senderName: 'David Rodriguez',
        type: 'text'
      },
    ],
  };
  
  // Update the conversations to reflect the new last messages
  const dummyConversations = [
    {
      id: '1',
      participantName: 'Sarah Johnson',
      participantAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastMessage: '🎤 Voice message (0:12)',
      lastMessageTimestamp: new Date(Date.now() - 35 * 60000).toISOString(), // 35 minutes ago
      read: false,
      unreadCount: 2,
      lastMessageType: 'audio'
    },
    {
      id: '2',
      participantName: 'Michael Chen',
      participantAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMessage: 'Great work on the presentation yesterday!',
      lastMessageTimestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      read: true,
      unreadCount: 0,
      lastMessageType: 'text'
    },
    {
      id: '3',
      participantName: 'Jessica Williams',
      participantAvatar: 'https://randomuser.me/api/portraits/women/63.jpg',
      lastMessage: '🎤 Voice message (0:15)',
      lastMessageTimestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
      read: true,
      unreadCount: 0,
      lastMessageType: 'audio'
    },
    {
      id: '4',
      participantName: 'David Rodriguez',
      participantAvatar: 'https://randomuser.me/api/portraits/men/74.jpg',
      lastMessage: 'Are we still meeting at 3pm today?',
      lastMessageTimestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
      read: true,
      unreadCount: 0,
      lastMessageType: 'text'
    },
    {
      id: '5',
      participantName: 'Emma Thompson',
      participantAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      lastMessage: 'I just pushed the code changes to the repository',
      lastMessageTimestamp: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
      read: true,
      unreadCount: 0,
      lastMessageType: 'text'
    }
  ];

// Audio files directory for storing voice messages
const AUDIO_DIRECTORY = `${FileSystem.documentDirectory}audio/`;

// Storage Keys
const CONVERSATIONS_STORAGE_KEY = 'local_conversations';
const MESSAGES_STORAGE_KEY = 'local_messages';
const AUDIO_STORAGE_KEY = 'local_audio_files';

// Initialize local storage with dummy data
const initializeLocalStorage = async () => {
    try {
      // Ensure audio directory exists
      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AUDIO_DIRECTORY, { intermediates: true });
      }
      
      // Check if data is already initialized
      const existingConversations = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      
      if (!existingConversations) {
        console.log('Initializing data with dummy conversations and messages...');
        
        // Store dummy conversations
        await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(dummyConversations));
        
        // Prepare dummy messages
        const modifiedMessages = JSON.parse(JSON.stringify(dummyMessages));
        
        // Create dummy audio URIs for all audio messages
        for (const convId in modifiedMessages) {
          modifiedMessages[convId] = modifiedMessages[convId].map(msg => {
            if (msg.type === 'audio') {
              const audioFileName = `sample_${msg.id}.m4a`;
              msg.audioUri = `${AUDIO_DIRECTORY}${audioFileName}`;
            }
            return msg;
          });
        }
        
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(modifiedMessages));
        console.log('Dummy data initialized successfully');
      } else {
        // Fix any messages with missing type properties
        await fixMessageTypes();
      }
    } catch (error) {
      console.error('Error initializing local storage:', error);
    }
  };

// Initialize data when the module is imported
initializeLocalStorage();

// Simulated delay to mimic network requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch conversations from "GCP" (actually from local storage)
export const fetchConversationsFromGCP = async () => {
  try {
    // Simulate network delay
    await delay(800);
    
    // Get conversations from local storage
    const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    return JSON.parse(conversationsJson) || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Modified fetchMessagesFromGCP function to add better debugging
export const fetchMessagesFromGCP = async (conversationId) => {
    try {
      // Simulate network delay
      await delay(600);
      
      console.log('Fetching messages for conversation ID:', conversationId);
      
      // Get messages from local storage
      const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages = JSON.parse(messagesJson) || {};
      
      console.log('Available conversation IDs:', Object.keys(allMessages));
      console.log('Messages for requested ID:', allMessages[conversationId]?.length || 0);
      
      // Return messages for the requested conversation, or an empty array if none exist
      return allMessages[conversationId] || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

// Send a text message
export const sendMessageToGCP = async (messageData) => {
  try {
    // Simulate network delay
    await delay(300);
    
    const { conversationId, text, senderId, timestamp, type } = messageData;
    
    // Get existing messages
    const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = JSON.parse(messagesJson) || {};
    
    // Get existing conversations
    const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    const conversations = JSON.parse(conversationsJson) || [];
    
    // Create a new message
    const newMessage = {
      id: `msg_${Date.now()}`, // Generate a unique ID
      text,
      timestamp,
      senderId,
      senderName: senderId === '123' ? 'You' : 'Other User', // This would come from a user service in a real app
      type: 'text'
    };
    
    // Add the message to the conversation
    if (!allMessages[conversationId]) {
      allMessages[conversationId] = [];
    }
    allMessages[conversationId].push(newMessage);
    
    // Update the conversation's last message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text,
          lastMessageTimestamp: timestamp,
          lastMessageType: 'text',
          read: senderId === '123', // Messages sent by the current user are automatically read
          unreadCount: senderId === '123' ? 0 : conv.unreadCount + 1,
        };
      }
      return conv;
    });
    
    // Save the updated messages and conversations
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConversations));
    
    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send an audio message
export const sendAudioMessageToGCP = async (messageData) => {
  try {
    // Simulate network delay
    await delay(500);
    
    const { conversationId, audioUri, audioDuration, senderId, timestamp, type } = messageData;
    
    // Save the audio file to a permanent location (in a real app, this would be uploaded to cloud storage)
    const fileName = `voice_${Date.now()}.m4a`;
    const destinationUri = `${AUDIO_DIRECTORY}${fileName}`;
    
    // Copy the temporary recording file to our app's documents directory
    await FileSystem.copyAsync({
      from: audioUri,
      to: destinationUri
    });
    
    // Get existing messages
    const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = JSON.parse(messagesJson) || {};
    
    // Get existing conversations
    const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    const conversations = JSON.parse(conversationsJson) || [];
    
    // Create a new message
    const newMessage = {
      id: `msg_${Date.now()}`, // Generate a unique ID
      audioUri: destinationUri,
      audioDuration,
      timestamp,
      senderId,
      senderName: senderId === '123' ? 'You' : 'Other User', // This would come from a user service in a real app
      type: 'audio'
    };
    
    // Add the message to the conversation
    if (!allMessages[conversationId]) {
      allMessages[conversationId] = [];
    }
    allMessages[conversationId].push(newMessage);
    
    // Format the displayed duration
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    // Update the conversation's last message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: `🎤 Voice message (${formatDuration(audioDuration)})`,
          lastMessageTimestamp: timestamp,
          lastMessageType: 'audio',
          read: senderId === '123', // Messages sent by the current user are automatically read
          unreadCount: senderId === '123' ? 0 : conv.unreadCount + 1,
        };
      }
      return conv;
    });
    
    // Save the updated messages and conversations
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConversations));
    
    return newMessage;
  } catch (error) {
    console.error('Error sending audio message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    // Simulate network delay
    await delay(200);
    
    // Get existing conversations
    const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    const conversations = JSON.parse(conversationsJson) || [];
    
    // Update the conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          read: true,
          unreadCount: 0,
        };
      }
      return conv;
    });
    
    // Save the updated conversations
    await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConversations));
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Create a new conversation
export const createNewConversation = async (participantData) => {
  try {
    // Simulate network delay
    await delay(500);
    
    // Get existing conversations
    const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    const conversations = JSON.parse(conversationsJson) || [];
    
    // Create a new conversation ID
    const newConversationId = `conv_${Date.now()}`;
    
    // Create the new conversation object
    const newConversation = {
      id: newConversationId,
      participantName: participantData.name,
      participantAvatar: participantData.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      lastMessage: '',
      lastMessageTimestamp: new Date().toISOString(),
      lastMessageType: 'text',
      read: true,
      unreadCount: 0
    };
    
    // Add the new conversation to the list
    const updatedConversations = [newConversation, ...conversations];
    
    // Initialize an empty message list for this conversation
    const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = JSON.parse(messagesJson) || {};
    allMessages[newConversationId] = [];
    
    // Save the updated data
    await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConversations));
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    
    return newConversation;
  } catch (error) {
    console.error('Error creating new conversation:', error);
    throw error;
  }
};

// Clean up audio files
const cleanupAudioFiles = async () => {
  try {
    // Get the list of all files in the audio directory
    const files = await FileSystem.readDirectoryAsync(AUDIO_DIRECTORY);
    
    // Delete each file
    for (const file of files) {
      await FileSystem.deleteAsync(`${AUDIO_DIRECTORY}${file}`);
    }
    
    console.log('All audio files cleared');
  } catch (error) {
    console.error('Error clearing audio files:', error);
    throw error;
  }
};

// Function to clear all data (useful for testing)
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
    await AsyncStorage.removeItem(MESSAGES_STORAGE_KEY);
    await cleanupAudioFiles();
    await initializeLocalStorage(); // Reinitialize with dummy data
    console.log('All data cleared and reinitialized');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// Mock implementation of GCP SQL database connection (placeholder for future implementation)
export const connectToGCPDatabase = async () => {
  console.log('This would connect to a real GCP SQL database in production');
  return true;
};

const fixMessageTypes = async () => {
    try {
      console.log('Fixing message types...');
      // Get existing messages
      const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (!messagesJson) return;
      
      const allMessages = JSON.parse(messagesJson);
      let needsUpdate = false;
      
      // Check all conversations
      Object.keys(allMessages).forEach(convId => {
        // Fix each message in the conversation
        allMessages[convId] = allMessages[convId].map(msg => {
          // If no type is specified, determine it based on content
          if (!msg.type) {
            needsUpdate = true;
            if (msg.audioUri) {
              return { ...msg, type: 'audio' };
            } else {
              return { ...msg, type: 'text' };
            }
          }
          return msg;
        });
      });
      
      // Save updated messages if needed
      if (needsUpdate) {
        console.log('Updating message types...');
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
        console.log('Message types fixed');
      } else {
        console.log('No message type fixes needed');
      }
    } catch (error) {
      console.error('Error fixing message types:', error);
    }
  };
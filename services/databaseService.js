import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { 
  dummyMessages, 
  dummyConversations, 
  dummyReactions, 
  dummyReplies,
  generateRandomWaveform 
} from './mockData';

// Audio files directory for storing voice messages
const AUDIO_DIRECTORY = `${FileSystem.documentDirectory}audio/`;

// Storage Keys
const CONVERSATIONS_STORAGE_KEY = 'local_conversations';
const MESSAGES_STORAGE_KEY = 'local_messages';
const AUDIO_STORAGE_KEY = 'local_audio_files';
const TAGS_STORAGE_KEY = 'local_message_tags';
const REACTIONS_STORAGE_KEY = 'local_message_reactions';
const REPLIES_STORAGE_KEY = 'local_message_replies';

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
      await AsyncStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(dummyReactions));
      await AsyncStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(dummyReplies));
      
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
export const getConversations = async () => {
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

// Backwards compatibility alias
export const fetchConversationsFromGCP = getConversations;

// Get all messages for a specific conversation
export const getMessages = async (conversationId) => {
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

// Backwards compatibility alias
export const fetchMessagesFromGCP = getMessages;

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
export const sendAudioMessage = async (messageData) => {
  try {
    // Simulate network delay
    await delay(500);
    
    const { conversationId, audioUri, audioDuration, senderId, timestamp, waveform } = messageData;
    
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
      type: 'audio',
      waveform: waveform || generateRandomWaveform(Math.min(audioDuration * 5, 150)), // Generate waveform if not provided
      tags: []
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

// Backwards compatibility alias
export const sendAudioMessageToGCP = sendAudioMessage;

// Update tags for a message
export const updateMessageTags = async (messageId, tags) => {
  try {
    // Simulate network delay
    await delay(300);
    
    // Get existing messages
    const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = JSON.parse(messagesJson) || {};
    
    // Find and update the message across all conversations
    let updated = false;
    
    for (const convId in allMessages) {
      const messageIndex = allMessages[convId].findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        allMessages[convId][messageIndex].tags = tags;
        updated = true;
        break;
      }
    }
    
    if (updated) {
      // Save the updated messages
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating message tags:', error);
    throw error;
  }
};

// Add a reaction to a specific timestamp in a message
export const addReactionToMessage = async (messageId, reaction) => {
  try {
    // Simulate network delay
    await delay(300);
    
    // Get existing reactions
    const reactionsJson = await AsyncStorage.getItem(REACTIONS_STORAGE_KEY);
    const allReactions = JSON.parse(reactionsJson) || {};
    
    // Add the reaction
    if (!allReactions[messageId]) {
      allReactions[messageId] = [];
    }
    
    // Add createdAt if not provided
    if (!reaction.createdAt) {
      reaction.createdAt = new Date().toISOString();
    }
    
    // Add the reaction
    allReactions[messageId].push(reaction);
    
    // Save the updated reactions
    await AsyncStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(allReactions));
    
    return true;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

// Get reactions for a message
export const getMessageReactions = async (messageId) => {
  try {
    // Simulate network delay
    await delay(200);
    
    // Get existing reactions
    const reactionsJson = await AsyncStorage.getItem(REACTIONS_STORAGE_KEY);
    const allReactions = JSON.parse(reactionsJson) || {};
    
    // Return reactions for the message or an empty array
    return allReactions[messageId] || [];
  } catch (error) {
    console.error('Error getting message reactions:', error);
    throw error;
  }
};

// Add a reply to a specific timestamp in a message
export const addReplyToMessage = async (messageId, reply) => {
  try {
    // Simulate network delay
    await delay(300);
    
    // Get existing replies
    const repliesJson = await AsyncStorage.getItem(REPLIES_STORAGE_KEY);
    const allReplies = JSON.parse(repliesJson) || {};
    
    // Add the reply
    if (!allReplies[messageId]) {
      allReplies[messageId] = [];
    }
    
    // Add createdAt if not provided
    if (!reply.createdAt) {
      reply.createdAt = new Date().toISOString();
    }
    
    // Add the reply
    allReplies[messageId].push(reply);
    
    // Save the updated replies
    await AsyncStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(allReplies));
    
    return true;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// Get replies for a message
export const getMessageReplies = async (messageId) => {
  try {
    // Simulate network delay
    await delay(200);
    
    // Get existing replies
    const repliesJson = await AsyncStorage.getItem(REPLIES_STORAGE_KEY);
    const allReplies = JSON.parse(repliesJson) || {};
    
    // Return replies for the message or an empty array
    return allReplies[messageId] || [];
  } catch (error) {
    console.error('Error getting message replies:', error);
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

// Creates an audio message waveform from an audio file
export const generateWaveform = async (audioUri) => {
  try {
    // In a real implementation, this would analyze the audio file
    // For now, we'll generate random waveform data
    await delay(300); // Simulate processing time
    
    // Generate between 50-150 data points based on audio length
    const length = Math.floor(Math.random() * 100) + 50;
    return generateRandomWaveform(length);
  } catch (error) {
    console.error('Error generating waveform:', error);
    // Return a default waveform in case of error
    return generateRandomWaveform(50);
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    // Simulate network delay
    await delay(300);
    
    // Get existing messages
    const messagesJson = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = JSON.parse(messagesJson) || {};
    
    // Find the message and its conversation
    let conversationId = null;
    let messageIndex = -1;
    let messageToDelete = null;
    
    for (const convId in allMessages) {
      messageIndex = allMessages[convId].findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        conversationId = convId;
        messageToDelete = allMessages[convId][messageIndex];
        break;
      }
    }
    
    if (!conversationId || messageIndex === -1) {
      console.error('Message not found');
      return false;
    }
    
    // If it's an audio message, delete the file
    if (messageToDelete.type === 'audio' && messageToDelete.audioUri) {
      try {
        await FileSystem.deleteAsync(messageToDelete.audioUri);
      } catch (fileError) {
        console.error('Error deleting audio file:', fileError);
        // Continue with deleting the message even if file deletion fails
      }
    }
    
    // Remove the message from the conversation
    allMessages[conversationId].splice(messageIndex, 1);
    
    // Delete reactions and replies for this message
    const reactionsJson = await AsyncStorage.getItem(REACTIONS_STORAGE_KEY);
    const allReactions = JSON.parse(reactionsJson) || {};
    delete allReactions[messageId];
    
    const repliesJson = await AsyncStorage.getItem(REPLIES_STORAGE_KEY);
    const allReplies = JSON.parse(repliesJson) || {};
    delete allReplies[messageId];
    
    // Update the last message in the conversation if needed
    if (allMessages[conversationId].length > 0) {
      // Get the last message
      const lastMessage = allMessages[conversationId][allMessages[conversationId].length - 1];
      
      // Get existing conversations
      const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      const conversations = JSON.parse(conversationsJson) || [];
      
      // Update the conversation
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversationId) {
          let lastMessageText;
          if (lastMessage.type === 'audio') {
            const minutes = Math.floor(lastMessage.audioDuration / 60);
            const seconds = Math.floor(lastMessage.audioDuration % 60);
            const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            lastMessageText = `🎤 Voice message (${formattedDuration})`;
          } else {
            lastMessageText = lastMessage.text;
          }
          
          return {
            ...conv,
            lastMessage: lastMessageText,
            lastMessageTimestamp: lastMessage.timestamp,
            lastMessageType: lastMessage.type,
          };
        }
        return conv;
      });
      
      // Save the updated conversations
      await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConversations));
    }
    
    // Save the updated data
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    await AsyncStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(allReactions));
    await AsyncStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(allReplies));
    
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Detect speech segments in audio for automatic tagging
export const detectSpeechSegments = async (audioUri) => {
  try {
    // In a real implementation, this would use a speech-to-text API or audio analysis
    // For this mock implementation, we'll return some dummy data
    await delay(500); // Simulate processing time
    
    return [
      { label: 'Introduction', timestamp: Math.random() * 3 },
      { label: 'Key Point', timestamp: 3 + Math.random() * 5 },
      { label: 'Question', timestamp: 8 + Math.random() * 5 },
      { label: 'Action Item', timestamp: 13 + Math.random() * 5 },
    ];
  } catch (error) {
    console.error('Error detecting speech segments:', error);
    return [];
  }
};

// Transcribe audio to text
export const transcribeAudio = async (audioUri) => {
  try {
    // In a real implementation, this would use a speech-to-text API
    // For this mock implementation, we'll return some dummy data
    await delay(1000); // Simulate processing time
    
    return {
      text: "This is a sample transcription of the audio message. In a real app, this would be the actual transcribed content from a speech-to-text service.",
      segments: [
        { text: "This is a sample transcription", start: 0, end: 3.2 },
        { text: "of the audio message.", start: 3.3, end: 5.1 },
        { text: "In a real app, this would be", start: 5.2, end: 7.8 },
        { text: "the actual transcribed content", start: 7.9, end: 10.5 },
        { text: "from a speech-to-text service.", start: 10.6, end: 13.2 },
      ]
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return { text: "", segments: [] };
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
    await AsyncStorage.removeItem(REACTIONS_STORAGE_KEY);
    await AsyncStorage.removeItem(REPLIES_STORAGE_KEY);
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

// Fix messages missing type property
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
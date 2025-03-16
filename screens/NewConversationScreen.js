import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNewConversation } from '../services/databaseService';

const NewConversationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  // Sample suggested contacts - in a real app, these would come from the user's contacts
  const suggestedContacts = [
    {
      id: 's1',
      name: 'Alex Rivera',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
    },
    {
      id: 's2',
      name: 'Taylor Kim',
      avatar: 'https://randomuser.me/api/portraits/women/31.jpg'
    },
    {
      id: 's3',
      name: 'Jordan Smith',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    {
      id: 's4',
      name: 'Morgan Lee',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    }
  ];

  // Select a suggested contact
  const selectContact = (contact) => {
    setName(contact.name);
    setAvatarUrl(contact.avatar);
  };

  // Create a new conversation and navigate to it
  const handleCreateConversation = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a contact name');
      return;
    }

    try {
      setIsLoading(true);
      const newConversation = await createNewConversation({
        name: name.trim(),
        avatar: avatarUrl.trim() || undefined
      });

      setIsLoading(false);
      // Navigate to the conversation screen with the new conversation
      navigation.replace('Conversation', { conversationId: newConversation.id });
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create conversation. Please try again.');
      console.error('Error creating conversation:', error);
    }
  };

  // Generate a random avatar if none is provided
  const generateRandomAvatar = () => {
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const randomId = Math.floor(Math.random() * 99) + 1;
    setAvatarUrl(`https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Conversation</Text>
        </View>

        {/* Contact Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            autoCapitalize="words"
            autoFocus
          />

          {/* Avatar Selection */}
          <TouchableOpacity 
            style={styles.avatarToggle}
            onPress={() => setShowAvatarInput(!showAvatarInput)}
          >
            <Text style={styles.avatarToggleText}>
              {showAvatarInput ? 'Hide Avatar Options' : 'Show Avatar Options'}
            </Text>
            <Ionicons 
              name={showAvatarInput ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#007AFF" 
            />
          </TouchableOpacity>

          {showAvatarInput && (
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarPreviewContainer}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
                  ) : (
                    <View style={styles.placeholderAvatar}>
                      <Text style={styles.placeholderText}>
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.randomButton}
                  onPress={generateRandomAvatar}
                >
                  <Text style={styles.randomButtonText}>Random</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.label}>Avatar URL (Optional)</Text>
              <TextInput
                style={styles.input}
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="https://example.com/avatar.jpg"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateConversation}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Conversation</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Suggested Contacts */}
        <View style={styles.suggestedContainer}>
          <Text style={styles.suggestedTitle}>Suggested Contacts</Text>
          {suggestedContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              onPress={() => selectContact(contact)}
            >
              <Image source={{ uri: contact.avatar }} style={styles.contactAvatar} />
              <Text style={styles.contactName}>{contact.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
  avatarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarToggleText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 8,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPreviewContainer: {
    marginRight: 16,
  },
  avatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E1E1E1',
  },
  placeholderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999999',
  },
  randomButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  randomButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  suggestedContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  contactName: {
    fontSize: 16,
    color: '#333333',
  },
});

export default NewConversationScreen;
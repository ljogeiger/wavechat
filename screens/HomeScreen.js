import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import moment from 'moment';

// This would be replaced with your actual GCP database connection
// You'd likely use a service like Cloud Functions or a backend API
// to connect to your GCP SQL database
import { fetchConversationsFromGCP, clearAllData, initializeLocalStorage } from '../services/databaseService.js';

const HomeScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversationsFromGCP();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const navigateToConversation = (conversationId, participantName) => {
    navigation.navigate('ConversationDetail', {
      conversationId,
      participantName
    });
  };

  const renderConversationItem = ({ item }) => {
    const lastMessageTime = moment(item.lastMessageTimestamp).format('h:mm A');
    const isToday = moment(item.lastMessageTimestamp).isSame(moment(), 'day');
    const displayDate = isToday 
      ? lastMessageTime 
      : moment(item.lastMessageTimestamp).format('MM/DD/YYYY');

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigateToConversation(item.id, item.participantName)}
      >
        <Image
          source={{ uri: item.participantAvatar || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>{item.participantName}</Text>
            <Text style={styles.timeStamp}>{displayDate}</Text>
          </View>
          <View style={styles.messagePreviewContainer}>
            <Text 
              style={[styles.messagePreview, !item.read && styles.unreadMessage]} 
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
        <TouchableOpacity 
          style={styles.newConversationButton}
          onPress={() => navigation.navigate('NewConversation')}
        >
          <Text style={styles.newConversationButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <TouchableOpacity 
              style={styles.startConversationButton}
              onPress={() => navigation.navigate('NewConversation')}
            >
              <Text style={styles.startConversationButtonText}>Start a conversation</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <View>
      <TouchableOpacity
        style={styles.clearDataButton}
        onPress={async () => {
            try {
            await clearAllData();
            // Optionally reload the current screen or navigate to the home screen
            loadConversations(); // If in HomeScreen
            // or
            navigation.navigate('Home'); // To navigate to home
            } catch (error) {
            console.error('Error clearing data:', error);
            Alert.alert('Error', 'Failed to clear data');
            }
        }}
        >
        <Text style={styles.clearDataButtonText}>Clear All Data</Text>
    </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  timeStamp: {
    fontSize: 12,
    color: '#6C757D',
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: 14,
    color: '#6C757D',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#212529',
  },
  unreadBadge: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#6C757D',
    marginBottom: 16,
  },
  startConversationButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startConversationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newConversationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newConversationButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearDataButton: {
    backgroundColor: '#F8D7DA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  }, 
  clearDataButtonText:{
    textAlign: "center"
  }
});

export default HomeScreen;
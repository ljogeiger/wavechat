import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Empty state component for when there are no messages
 * 
 * @param {Object} props
 * @param {string} props.title - Title text
 * @param {string} props.message - Message text
 * @param {string} props.icon - Icon name (from MaterialCommunityIcons)
 * @param {string} props.imageSource - Optional image source URI
 */
const EmptyState = ({
  title = "No messages yet",
  message = "Start a conversation by sending a voice message",
  icon = "microphone",
  imageSource = null,
}) => {
  return (
    <View style={styles.container}>
      {imageSource ? (
        <Image
          source={{ uri: imageSource }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={60}
            color="#5A67F2"
          />
        </View>
      )}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(90, 103, 242, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});

export default EmptyState;
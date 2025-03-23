import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

/**
 * Message options modal component
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Object} props.message - Message data
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onAddTag - Callback when a tag is added
 * @param {Function} props.onNavigateToDetail - Callback to navigate to message detail
 * @param {Function} props.onReply - Callback to reply to the message
 * @param {Function} props.onTranscribe - Callback to transcribe audio message
 * @param {Function} props.onDelete - Callback to delete the message
 */
const MessageOptionsModal = ({
  visible,
  message,
  onClose,
  onAddTag,
  onNavigateToDetail,
  onReply,
  onTranscribe,
  onDelete,
}) => {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(0));
  
  // Animate modal when visibility changes
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnimation, {
        toValue: 1,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);
  
  // Handle adding a new tag
  const handleAddTag = useCallback(() => {
    if (newTag.trim()) {
      onAddTag?.(newTag.trim());
      setNewTag('');
      setShowTagInput(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [newTag, onAddTag]);
  
  // Handle delete with confirmation
  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Perform the delete
    onDelete?.(message);
    
    // Close the modal
    onClose?.();
  }, [message, onDelete, onClose]);
  
  // Transform for slide-up animation
  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  // If no message, don't render the modal
  if (!message) return null;
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY }] }
                ]}
              >
                <View style={styles.header}>
                  <View style={styles.handle} />
                  <Text style={styles.title}>Message Options</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionsList}>
                  {/* Message Detail option */}
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={() => {
                      onNavigateToDetail?.(message);
                      onClose?.();
                    }}
                  >
                    <MaterialCommunityIcons name="message-text-outline" size={22} color="#5A67F2" />
                    <Text style={styles.optionText}>View Details</Text>
                  </TouchableOpacity>

                  {/* Add Tag option */}
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={() => setShowTagInput(!showTagInput)}
                  >
                    <MaterialCommunityIcons name="tag-outline" size={22} color="#5A67F2" />
                    <Text style={styles.optionText}>Add Tag</Text>
                  </TouchableOpacity>

                  {/* Reply option */}
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={() => {
                      onReply?.(message);
                      onClose?.();
                    }}
                  >
                    <MaterialCommunityIcons name="reply" size={22} color="#5A67F2" />
                    <Text style={styles.optionText}>Reply</Text>
                  </TouchableOpacity>

                  {/* Transcribe option - only for audio messages */}
                  {message.type === 'audio' && (
                    <TouchableOpacity 
                      style={styles.optionItem}
                      onPress={() => {
                        onTranscribe?.(message);
                        onClose?.();
                      }}
                    >
                      <MaterialCommunityIcons name="text-to-speech" size={22} color="#5A67F2" />
                      <Text style={styles.optionText}>Transcribe</Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete option */}
                  <TouchableOpacity 
                    style={[styles.optionItem, styles.deleteOption]}
                    onPress={handleDelete}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#FF3B30" />
                    <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {/* Tag input field */}
                {showTagInput && (
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={styles.tagInput}
                      value={newTag}
                      onChangeText={setNewTag}
                      placeholder="Enter tag name"
                      placeholderTextColor="#999"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleAddTag}
                      maxLength={20}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.addTagButton,
                        !newTag.trim() && styles.addTagButtonDisabled
                      ]}
                      onPress={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      <Text style={styles.addTagButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    alignSelf: 'center',
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#FF3B30',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
  },
  addTagButton: {
    marginLeft: 10,
    height: 40,
    paddingHorizontal: 15,
    backgroundColor: '#5A67F2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  addTagButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default React.memo(MessageOptionsModal);
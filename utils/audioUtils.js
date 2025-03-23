import { Audio } from 'expo-av';

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
 * Generate a waveform representation from an audio file
 * In a real app, this would analyze the audio file's amplitude data
 * This is a simplified mock implementation for demonstration
 * @param {string} audioUri - URI of the audio file
 * @returns {Array} Array of amplitude values between 0 and 1
 */
export const generateWaveform = async (audioUri) => {
  try {
    // In a real app, you would load the audio file and analyze it
    // For demonstration, we'll create a random waveform
    
    // For shorter audio, create fewer bars
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    
    const duration = status.durationMillis / 1000;
    
    // Determine number of bars based on duration
    const numberOfBars = Math.min(Math.floor(duration * 10), 150);
    
    const waveform = [];
    
    // Generate mock waveform data with some patterns to make it look natural
    for (let i = 0; i < numberOfBars; i++) {
      // Base amplitude varies between 0.2 and 0.8
      let amplitude = 0.2 + (Math.random() * 0.6);
      
      // Add some patterns - higher amplitudes in the middle sections
      const position = i / numberOfBars;
      if (position > 0.3 && position < 0.7) {
        amplitude += 0.1;
      }
      
      // Add occasional peaks
      if (Math.random() > 0.9) {
        amplitude = Math.min(amplitude + 0.3, 1);
      }
      
      // Add occasional dips
      if (Math.random() > 0.85) {
        amplitude = Math.max(amplitude - 0.2, 0.1);
      }
      
      // Keep amplitudes within bounds
      amplitude = Math.min(Math.max(amplitude, 0.1), 1);
      
      waveform.push(amplitude);
    }
    
    return waveform;
  } catch (error) {
    console.error('Error generating waveform:', error);
    // Return a default waveform if there's an error
    return Array(50).fill(0).map(() => 0.1 + (Math.random() * 0.8));
  }
};

/**
 * Detect speech segments in audio for automatic tagging
 * In a real app, this would use speech recognition or audio analysis
 * This is a simplified mock implementation for demonstration
 * @param {string} audioUri - URI of the audio file
 * @returns {Array} Array of suggested tags with timestamps
 */
export const detectSpeechSegments = async (audioUri) => {
  try {
    // In a real app, this would analyze the audio and detect different speakers,
    // topics, or important segments using machine learning
    
    // For this demo, we'll return mock data
    return [
      { label: 'Introduction', timestamp: 2.5 },
      { label: 'Key Point', timestamp: 15.2 },
      { label: 'Question', timestamp: 28.7 },
      { label: 'Action Item', timestamp: 42.1 },
    ];
  } catch (error) {
    console.error('Error detecting speech segments:', error);
    return [];
  }
};

/**
 * Transcribe audio to text
 * In a real app, this would use a speech-to-text service
 * This is a simplified mock implementation for demonstration
 * @param {string} audioUri - URI of the audio file
 * @returns {Object} Transcription result with text and timestamps
 */
export const transcribeAudio = async (audioUri) => {
  try {
    // In a real app, you would call a speech-to-text API
    
    // For this demo, we'll return mock data
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
/**
 * mockData.js
 * Contains sample data for the WaveChat app
 */

// Generate random waveform data for audio messages
export function generateRandomWaveform(length) {
    const waveform = [];
    for (let i = 0; i < length; i++) {
      // Generate amplitude between 0.1 and 1
      let amplitude = 0.1 + Math.random() * 0.9;
      
      // Add some patterns to make it look more natural
      const position = i / length;
      
      // Higher amplitudes in the middle sections
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
      
      // Ensure amplitude is within bounds
      amplitude = Math.min(Math.max(amplitude, 0.1), 1);
      
      waveform.push(amplitude);
    }
    return waveform;
  }
  
  // Dummy messages data
  export const dummyMessages = {
    "1": [
      {
        id: "101",
        text: "Hi Sarah, how are you doing?",
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(), // 90 minutes ago
        senderId: "123", // Current user ID
        senderName: "You",
        type: "text"
      },
      {
        id: "102",
        text: "I'm doing well, thanks for asking! Just finishing up some work on the project.",
        timestamp: new Date(Date.now() - 85 * 60000).toISOString(), // 85 minutes ago
        senderId: "456", // Other user ID (Sarah)
        senderName: "Sarah Johnson",
        type: "text"
      },
      {
        id: "103",
        audioDuration: 8,
        timestamp: new Date(Date.now() - 80 * 60000).toISOString(), // 80 minutes ago
        senderId: "123",
        senderName: "You",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(60),
        tags: ["Question", "Task"]
      },
      {
        id: "104",
        text: "Almost done with the dashboard component. Should be able to submit it by tomorrow.",
        timestamp: new Date(Date.now() - 75 * 60000).toISOString(), // 75 minutes ago
        senderId: "456",
        senderName: "Sarah Johnson",
        type: "text"
      },
      {
        id: "105",
        text: "Sounds good. Let me know if you need any help with it.",
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(), // 40 minutes ago
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "106",
        audioDuration: 12,
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(), // 35 minutes ago
        senderId: "456",
        senderName: "Sarah Johnson",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(80),
        tags: ["Update"]
      },
    ],
    "2": [
      {
        id: "201",
        text: "Hey Michael, are you ready for the presentation tomorrow?",
        timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), // 30 hours ago
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "202",
        audioDuration: 22,
        timestamp: new Date(Date.now() - 29 * 3600000).toISOString(), // 29 hours ago
        senderId: "789",
        senderName: "Michael Chen",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(120),
        tags: ["Feedback", "Question"]
      },
      {
        id: "203",
        text: "Perfect! I think we're well prepared then.",
        timestamp: new Date(Date.now() - 28 * 3600000).toISOString(), // 28 hours ago
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "204",
        text: "Just finished the presentation. I think it went well!",
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "205",
        text: "Great work on the presentation yesterday!",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
        senderId: "789",
        senderName: "Michael Chen",
        type: "text"
      },
    ],
    "3": [
      {
        id: "301",
        text: "Hi Jessica, I'm working on the frontend integration with the API.",
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "302",
        text: "Nice! Are you using the new endpoint we deployed yesterday?",
        timestamp: new Date(Date.now() - 3 * 86400000 + 30 * 60000).toISOString(), // 3 days ago + 30 minutes
        senderId: "321",
        senderName: "Jessica Williams",
        type: "text"
      },
      {
        id: "303",
        audioDuration: 18,
        timestamp: new Date(Date.now() - 3 * 86400000 + 35 * 60000).toISOString(), // 3 days ago + 35 minutes
        senderId: "123",
        senderName: "You",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(110),
        tags: ["Issue", "Question"]
      },
      {
        id: "304",
        text: "What kind of issues are you encountering?",
        timestamp: new Date(Date.now() - 3 * 86400000 + 40 * 60000).toISOString(), // 3 days ago + 40 minutes
        senderId: "321",
        senderName: "Jessica Williams",
        type: "text"
      },
      {
        id: "305",
        audioDuration: 15,
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        senderId: "321",
        senderName: "Jessica Williams",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(90),
        tags: ["Solution"]
      },
    ],
    "4": [
      {
        id: "401",
        text: "Hey David, I just reviewed your code changes.",
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "402",
        audioDuration: 5,
        timestamp: new Date(Date.now() - 5 * 86400000 + 15 * 60000).toISOString(), // 5 days ago + 15 minutes
        senderId: "654",
        senderName: "David Rodriguez",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(40),
        tags: ["Response"]
      },
      {
        id: "403",
        text: "Looks good overall! I left a few comments for minor improvements.",
        timestamp: new Date(Date.now() - 5 * 86400000 + 30 * 60000).toISOString(), // 5 days ago + 30 minutes
        senderId: "123",
        senderName: "You",
        type: "text"
      },
      {
        id: "404",
        text: "Thanks! I'll address those comments tomorrow.",
        timestamp: new Date(Date.now() - 5 * 86400000 + 45 * 60000).toISOString(), // 5 days ago + 45 minutes
        senderId: "654",
        senderName: "David Rodriguez",
        type: "text"
      },
      {
        id: "405",
        audioDuration: 10,
        timestamp: new Date(Date.now() - 4 * 86400000 + 5 * 3600000).toISOString(), // 4 days ago + 5 hours
        senderId: "123",
        senderName: "You",
        type: "audio",
        // audioUri will be set during initialization
        waveform: generateRandomWaveform(70),
        tags: ["Feedback"]
      },
      {
        id: "406",
        text: "Are we still meeting at 3pm today?",
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
        senderId: "654",
        senderName: "David Rodriguez",
        type: "text"
      },
    ],
  };
  
  // Dummy conversations
  export const dummyConversations = [
    {
      id: "1",
      participantName: "Sarah Johnson",
      participantAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      lastMessage: "🎤 Voice message (0:12)",
      lastMessageTimestamp: new Date(Date.now() - 35 * 60000).toISOString(), // 35 minutes ago
      read: false,
      unreadCount: 2,
      lastMessageType: "audio"
    },
    {
      id: "2",
      participantName: "Michael Chen",
      participantAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      lastMessage: "Great work on the presentation yesterday!",
      lastMessageTimestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      read: true,
      unreadCount: 0,
      lastMessageType: "text"
    },
    {
      id: "3",
      participantName: "Jessica Williams",
      participantAvatar: "https://randomuser.me/api/portraits/women/63.jpg",
      lastMessage: "🎤 Voice message (0:15)",
      lastMessageTimestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
      read: true,
      unreadCount: 0,
      lastMessageType: "audio"
    },
    {
      id: "4",
      participantName: "David Rodriguez",
      participantAvatar: "https://randomuser.me/api/portraits/men/74.jpg",
      lastMessage: "Are we still meeting at 3pm today?",
      lastMessageTimestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
      read: true,
      unreadCount: 0,
      lastMessageType: "text"
    },
    {
      id: "5",
      participantName: "Emma Thompson",
      participantAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
      lastMessage: "I just pushed the code changes to the repository",
      lastMessageTimestamp: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
      read: true,
      unreadCount: 0,
      lastMessageType: "text"
    }
  ];
  
  // Dummy reactions for messages
  export const dummyReactions = {
    "103": [
      { 
        id: "react_1",
        emoji: "👍",
        timestamp: 2.5, // 2.5 seconds into the audio
        username: "Sarah Johnson",
        userId: "456",
        createdAt: new Date(Date.now() - 70 * 60000).toISOString()
      },
      {
        id: "react_2",
        emoji: "🔥",
        timestamp: 5.8, // 5.8 seconds into the audio
        username: "You",
        userId: "123",
        createdAt: new Date(Date.now() - 65 * 60000).toISOString()
      }
    ],
    "202": [
      {
        id: "react_3",
        emoji: "👏",
        timestamp: 10.2,
        username: "You",
        userId: "123",
        createdAt: new Date(Date.now() - 28 * 3600000).toISOString()
      }
    ],
    "305": [
      {
        id: "react_4",
        emoji: "⭐",
        timestamp: 7.5,
        username: "You",
        userId: "123",
        createdAt: new Date(Date.now() - 20 * 3600000).toISOString()
      }
    ]
  };
  
  // Dummy replies for messages
  export const dummyReplies = {
    "103": [
      {
        id: "reply_1",
        text: "I'll check that part of the code",
        timestamp: 3.2, // 3.2 seconds into the audio
        username: "Sarah Johnson",
        userId: "456",
        createdAt: new Date(Date.now() - 78 * 60000).toISOString()
      }
    ],
    "202": [
      {
        id: "reply_2",
        text: "Good point about the slides",
        timestamp: 12.5,
        username: "You",
        userId: "123",
        createdAt: new Date(Date.now() - 28.5 * 3600000).toISOString()
      },
      {
        id: "reply_3",
        text: "Let's add more visuals to that section",
        timestamp: 18.2,
        username: "You",
        userId: "123",
        createdAt: new Date(Date.now() - 28 * 3600000).toISOString()
      }
    ],
    "305": [
      {
        id: "reply_4",
        text: "Great solution, I'll implement it today",
        timestamp: 10.8,
        username: "You",
        userId: "123",
        createdAt: new Date(Date.now() - 22 * 3600000).toISOString()
      }
    ]
  };
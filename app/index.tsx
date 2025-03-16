import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ConversationDetailScreen from '../screens/ConversationDetailScreen';
import NewConversationScreen from '../screens/NewConversationScreen';

// Define the stack navigator param list types
export type RootStackParamList = {
  Home: undefined;
  ConversationDetail: { conversationId: string; participantName: string };
  NewConversation: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {/* Remove the NavigationContainer - Expo already provides one */}
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="ConversationDetail" 
          component={ConversationDetailScreen}
          options={({ route }) => ({ 
            headerShown: true,
            title: route.params.participantName
          })}
        />
        <Stack.Screen 
          name="NewConversation" 
          component={NewConversationScreen}
          options={{ 
            headerShown: true,
            title: 'New Conversation'
          }}
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
};

export default App;
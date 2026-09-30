import './global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from './src/HomeScreen';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView className="flex-1 bg-[#F6F7F5]">
          <StatusBar style="dark" />
          <HomeScreen />
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

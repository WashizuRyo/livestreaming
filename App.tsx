import './global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import HomeScreen from './src/HomeScreen';
import { fetchFollowingPrograms } from './src/nico/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
const LIVE_HOME = 'https://live.nicovideo.jp/follow';
const LOGIN_URL = `https://account.nicovideo.jp/spa/login/index.html?redirect_uri=${encodeURIComponent('https://live.nicovideo.jp/follow')}`;
const LOGOUT_URL = 'https://account.nicovideo.jp/logout';

function NicoApp() {
  const [sessionReady, setSessionReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [webUrl, setWebUrl] = useState(LIVE_HOME);
  const webOpen = loginOpen || logoutOpen;

  const onWebLoad = useCallback(
    (url: string) => {
      if (logoutOpen) {
        if (url.startsWith('https://www.nicovideo.jp/') && url.includes('ref=logout_confirm')) {
          queryClient.setQueryData(['following'], { loggedIn: false, programs: [] });
          setLogoutOpen(false);
          setSessionReady(true);
          setWebUrl(LIVE_HOME);
        }
        return;
      }
      if (loginOpen) {
        if (
          !url.startsWith('https://sp.live.nicovideo.jp/follow') &&
          !url.startsWith('https://live.nicovideo.jp/follow')
        ) {
          return;
        }
        fetchFollowingPrograms()
          .then((result) => {
            if (!result.loggedIn) return;
            setLoginOpen(false);
            setSessionReady(true);
            queryClient.invalidateQueries({ queryKey: ['following'] });
          })
          .catch(() => {
            setSessionReady(false);
          });
        return;
      }
      setSessionReady(true);
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
    [loginOpen, logoutOpen],
  );

  const startLogin = () => {
    setLoginOpen(true);
    setSessionReady(false);
    setWebUrl(LOGIN_URL);
  };

  const startLogout = () => {
    setLogoutOpen(true);
    setWebUrl(LOGOUT_URL);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F7F5]">
      <StatusBar style="dark" />
      <HomeScreen
        loadFollowing={fetchFollowingPrograms}
        onLogin={startLogin}
        onLogout={startLogout}
        sessionReady={sessionReady}
      />
      <View
        pointerEvents={webOpen ? 'auto' : 'none'}
        style={
          webOpen
            ? { position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 10 }
            : { position: 'absolute', width: 1, height: 1, opacity: 0 }
        }
      >
        {webOpen ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLoginOpen(false);
              setLogoutOpen(false);
              if (loginOpen) setSessionReady(false);
              setWebUrl(LIVE_HOME);
            }}
            className="border-b border-[#E9EDEB] px-5 py-4"
          >
            <Text className="text-base font-bold text-[#1D2522]">閉じる</Text>
          </Pressable>
        ) : null}
        <WebView
          source={{ uri: webUrl }}
          onLoadEnd={(event) => onWebLoad(event.nativeEvent.url)}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NicoApp />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import WebView from 'react-native-webview';

import { fetchFollowingPrograms, fetchMostViewedPrograms } from './nico/api';
import type { Program } from './nico/schema';

const LOGIN_URL = `https://account.nicovideo.jp/spa/login/index.html?redirect_uri=${encodeURIComponent('https://live.nicovideo.jp/follow')}`;
const LOGOUT_URL = 'https://account.nicovideo.jp/logout';

function ProgramRow({ program, rank }: { program: Program; rank?: number }) {
  return (
    <View className="flex-row gap-3 border-b border-[#E9EDEB] py-4">
      <View className="h-[72px] w-[96px] overflow-hidden rounded-xl bg-[#E9EDEB]">
        {program.listingThumbnail ? (
          <Image
            source={{ uri: program.listingThumbnail }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : null}
        {rank ? (
          <View className="absolute left-1 top-1 rounded bg-[#D62D39] px-1.5 py-0.5">
            <Text className="text-xs font-bold text-white">{rank}</Text>
          </View>
        ) : null}
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-sm font-bold leading-5 text-[#1D2522]" numberOfLines={2}>
          {program.title}
        </Text>
        <Text className="mt-1 text-xs text-[#67756D]" numberOfLines={1}>
          {program.programProvider.name}
        </Text>
        <Text className="mt-1 text-xs font-semibold text-[#59675F]">
          視聴数 {program.statistics.watchCount.toLocaleString('ja-JP')}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [isWebViewOpen, setIsWebViewOpen] = useState(false);
  const [webViewError, setWebViewError] = useState<string | null>(null);

  const closeWeb = () => {
    setIsWebViewOpen(false);
    setWebViewError(null);
  };

  const handleLoadEnd = async (url: string) => {
    if (!isWebViewOpen) return;

    if (followingPrograms.data?.loggedIn) {
      if (url.startsWith('https://www.nicovideo.jp/') && url.includes('ref=logout_confirm')) {
        closeWeb();
        queryClient.setQueryData(['following'], { loggedIn: false, programs: [] });
      }
      return;
    }

    if (
      !url.startsWith('https://sp.live.nicovideo.jp/follow') &&
      !url.startsWith('https://live.nicovideo.jp/follow')
    ) {
      return;
    }
    setWebViewError(null);
    try {
      const result = await fetchFollowingPrograms();
      if (!result.loggedIn) return;
      closeWeb();
      queryClient.setQueryData(['following'], result);
    } catch {
      setWebViewError('ログイン状態を確認できませんでした。閉じてから更新してください。');
    }
  };

  const mostViewedPrograms = useQuery({
    queryKey: ['ranking'],
    queryFn: fetchMostViewedPrograms,
    staleTime: 60_000,
  });
  const followingPrograms = useQuery({
    queryKey: ['following'],
    queryFn: fetchFollowingPrograms,
    retry: false,
    staleTime: 30_000,
  });

  const refresh = () => {
    mostViewedPrograms.refetch();
    followingPrograms.refetch();
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-[#F6F7F5]" contentContainerClassName="px-5 pb-12 pt-6">
        <View className="mb-8 flex-row items-start justify-between">
          <View>
            <Text className="mt-2 text-[28px] font-extrabold text-[#1D2522]">放送中の番組</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="番組一覧を更新"
            onPress={refresh}
            className="rounded-full border border-[#D6DDDA] bg-white px-4 py-2"
          >
            <Text className="text-sm font-bold text-[#2D4236]">更新</Text>
          </Pressable>
        </View>

        <View className="mb-7 rounded-3xl bg-white px-5 py-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-[#1D2522]">フォロー中の放送</Text>
            {followingPrograms.data?.loggedIn ? (
              <View className="flex-row items-center gap-3">
                <Text className="text-xs font-semibold text-[#4C7D64]">ログイン中</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsWebViewOpen(true)}
                  hitSlop={8}
                >
                  <Text className="text-xs font-semibold text-[#59675F] underline">ログアウト</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
          {followingPrograms.isPending ? (
            <ActivityIndicator accessibilityLabel="ログイン状態を確認中" />
          ) : followingPrograms.isError ? (
            <Text className="text-sm text-[#C12A37]">
              フォロー中の放送を取得できませんでした。更新して再試行してください。
            </Text>
          ) : !followingPrograms.data?.loggedIn ? (
            <View>
              <Text className="mb-4 text-sm leading-5 text-[#66736B]">
                ログインすると、フォロー中の放送を表示できます。
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsWebViewOpen(true)}
                className="items-center rounded-xl bg-black px-4 py-4"
              >
                <Text className="font-bold text-white">ログイン</Text>
              </Pressable>
            </View>
          ) : followingPrograms.data.programs.length === 0 ? (
            <Text className="text-sm text-[#66736B]">現在放送中のフォロー番組はありません。</Text>
          ) : (
            followingPrograms.data.programs.map((program) => (
              <ProgramRow key={program.id} program={program} />
            ))
          )}
        </View>

        <View className="rounded-3xl bg-white px-5 py-5">
          <Text className="text-lg font-extrabold text-[#1D2522]">視聴数ランキング</Text>
          <Text className="mb-2 mt-1 text-xs text-[#66736B]">
            放送中の公開番組を累計視聴数順に表示
          </Text>
          {mostViewedPrograms.isPending ? (
            <ActivityIndicator accessibilityLabel="ランキングを読み込み中" />
          ) : mostViewedPrograms.isError ? (
            <Text className="py-3 text-sm text-[#C12A37]">
              ランキングを取得できませんでした。更新して再試行してください。
            </Text>
          ) : mostViewedPrograms.data.length === 0 ? (
            <Text className="py-3 text-sm text-[#66736B]">放送中の番組はありません。</Text>
          ) : (
            mostViewedPrograms.data.map((program, index) => (
              <ProgramRow key={program.id} program={program} rank={index + 1} />
            ))
          )}
        </View>
      </ScrollView>

      {isWebViewOpen ? (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              closeWeb();
              queryClient.invalidateQueries({ queryKey: ['following'] });
            }}
            className="border-b border-[#E9EDEB] px-5 py-4"
          >
            <Text className="text-base font-bold text-[#1D2522]">閉じる</Text>
          </Pressable>
          {webViewError ? (
            <Text className="px-5 py-3 text-sm text-[#C12A37]">{webViewError}</Text>
          ) : null}
          <WebView
            source={{ uri: followingPrograms.data?.loggedIn ? LOGOUT_URL : LOGIN_URL }}
            originWhitelist={['http://*', 'https://*', 'about:*']}
            onLoadEnd={(event) => handleLoadEnd(event.nativeEvent.url)}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </View>
  );
}

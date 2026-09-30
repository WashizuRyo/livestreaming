import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { fetchMostViewedPrograms } from './nico/api';
import type { Program } from './nico/schema';

type FollowedResult = { loggedIn: boolean; programs: Program[] };

type Props = {
  loadFollowing: () => Promise<FollowedResult>;
  onLogin: () => void;
  onLogout: () => void;
  sessionReady: boolean;
};

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

export default function HomeScreen({ loadFollowing, onLogin, onLogout, sessionReady }: Props) {
  const ranking = useQuery({
    queryKey: ['ranking'],
    queryFn: fetchMostViewedPrograms,
    staleTime: 60_000,
  });
  const followed = useQuery({
    queryKey: ['following'],
    queryFn: loadFollowing,
    enabled: sessionReady,
    retry: false,
    staleTime: 30_000,
  });

  const refresh = () => {
    void ranking.refetch();
    if (sessionReady) void followed.refetch();
  };

  return (
    <ScrollView className="flex-1 bg-[#F6F7F5]" contentContainerClassName="px-5 pb-12 pt-6">
      <View className="mb-8 flex-row items-start justify-between">
        <View>
          <Text className="text-xs font-extrabold tracking-[3px] text-[#D62D39]">
            NICONICO LIVE
          </Text>
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
          {followed.data?.loggedIn ? (
            <View className="flex-row items-center gap-3">
              <Text className="text-xs font-semibold text-[#4C7D64]">ログイン中</Text>
              <Pressable accessibilityRole="button" onPress={onLogout} hitSlop={8}>
                <Text className="text-xs font-semibold text-[#59675F] underline">ログアウト</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        {!sessionReady || followed.isPending ? (
          <ActivityIndicator accessibilityLabel="ログイン状態を確認中" />
        ) : followed.isError ? (
          <Text className="text-sm text-[#C12A37]">フォロー中の放送を取得できませんでした。</Text>
        ) : !followed.data?.loggedIn ? (
          <View>
            <Text className="mb-4 text-sm leading-5 text-[#66736B]">
              ログインすると、フォロー中の放送を表示できます。
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onLogin}
              className="items-center rounded-xl bg-[#D62D39] px-4 py-3"
            >
              <Text className="font-bold text-white">ログインして表示</Text>
            </Pressable>
          </View>
        ) : followed.data.programs.length === 0 ? (
          <Text className="text-sm text-[#66736B]">現在放送中のフォロー番組はありません。</Text>
        ) : (
          followed.data.programs.map((program) => <ProgramRow key={program.id} program={program} />)
        )}
      </View>

      <View className="rounded-3xl bg-white px-5 py-5">
        <Text className="text-lg font-extrabold text-[#1D2522]">視聴数ランキング</Text>
        <Text className="mb-2 mt-1 text-xs text-[#66736B]">
          放送中の公開番組を累計視聴数順に表示
        </Text>
        {ranking.isPending ? (
          <ActivityIndicator accessibilityLabel="ランキングを読み込み中" />
        ) : ranking.isError ? (
          <Text className="py-3 text-sm text-[#C12A37]">
            ランキングを取得できませんでした。更新して再試行してください。
          </Text>
        ) : ranking.data.length === 0 ? (
          <Text className="py-3 text-sm text-[#66736B]">放送中の番組はありません。</Text>
        ) : (
          ranking.data.map((program, index) => (
            <ProgramRow key={program.id} program={program} rank={index + 1} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

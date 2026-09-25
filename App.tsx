import './global.css';

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F5F1]">
      <StatusBar style="dark" />
      <View className="flex-1 px-7 pb-8 pt-10">
        <View className="flex-row items-center justify-between">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#D9E9DE]">
            <Text className="text-xl font-bold text-[#225943]">+</Text>
          </View>
          <Text className="text-xs font-semibold tracking-[3px] text-[#6D7B70]">
            DAILY COUNTER
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <Text className="mb-3 text-sm font-semibold tracking-[3px] text-[#5D7B68]">
            KEEP COUNTING
          </Text>
          <Text className="text-[38px] font-bold leading-[48px] text-[#1B2D24]">
            今日のカウント
          </Text>
          <Text className="mt-3 text-base leading-7 text-[#718075]">
            小さな一歩を、ひとつずつ。
          </Text>

          <View className="mt-12 items-center rounded-[36px] border border-[#E7EBE3] bg-white px-6 py-10 shadow-sm">
            <Text className="text-sm font-medium tracking-[2px] text-[#87958B]">
              TOTAL
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              className="mt-2 text-[104px] font-bold leading-[124px] tracking-[-5px] text-[#1B2D24]"
            >
              {count}
            </Text>
            <View className="mt-1 h-1.5 w-14 rounded-full bg-[#BCE3C7]" />

            <View className="mt-11 w-full flex-row gap-4">
              <Pressable
                accessibilityLabel="1 減らす"
                accessibilityRole="button"
                className="h-20 flex-1 items-center justify-center rounded-3xl bg-[#EAF0E9] active:opacity-70"
                onPress={() => setCount((value) => value - 1)}
              >
                <Text className="text-4xl font-light text-[#295540]">−</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="1 増やす"
                accessibilityRole="button"
                className="h-20 flex-1 items-center justify-center rounded-3xl bg-[#225943] active:opacity-70"
                onPress={() => setCount((value) => value + 1)}
              >
                <Text className="text-4xl font-light text-white">+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityLabel="カウントをリセット"
          accessibilityRole="button"
          className="h-14 items-center justify-center rounded-2xl border border-[#D9E2D8] active:opacity-60"
          onPress={() => setCount(0)}
        >
          <Text className="text-sm font-semibold tracking-[1px] text-[#476250]">
            リセット
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

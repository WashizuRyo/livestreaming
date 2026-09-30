import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomeScreen from './HomeScreen';
import { fetchFollowingPrograms, fetchMostViewedPrograms } from './nico/api';
import type { Program } from './nico/schema';

vi.mock('./nico/api', () => ({
  fetchFollowingPrograms: vi.fn(),
  fetchMostViewedPrograms: vi.fn(),
}));

vi.mock('react-native-webview', () => ({ default: () => null }));

const fetchFollowingProgramsMock = vi.mocked(fetchFollowingPrograms);
const fetchMostViewedProgramsMock = vi.mocked(fetchMostViewedPrograms);

beforeEach(() => {
  vi.resetAllMocks();
  fetchFollowingProgramsMock.mockResolvedValue({ loggedIn: false, programs: [] });
  fetchMostViewedProgramsMock.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
}

describe('トップ画面', () => {
  it('未ログインの場合は案内文とログインボタンを表示する', async () => {
    renderScreen();

    expect(
      await screen.findByText('ログインすると、フォロー中の放送を表示できます。'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeTruthy();
    expect(screen.queryByText('ログイン中')).toBeNull();
    expect(screen.queryByRole('button', { name: 'ログアウト' })).toBeNull();
  });

  it('ログイン済みの場合はフォロー中とランキングの番組一覧を表示する', async () => {
    fetchFollowingProgramsMock.mockResolvedValue({
      loggedIn: true,
      programs: [
        {
          id: 'lv100',
          title: 'フォローしている番組',
          providerType: 'community',
          liveCycle: 'ON_AIR',
          isFollowerOnly: false,
          isPayProgram: false,
          listingThumbnail: 'https://example.com/thumbnail.jpg',
          beginAt: 1_700_000_200,
          programProvider: { id: '100', name: '配信者A', icon: '' },
          statistics: { watchCount: 1234, commentCount: 32 },
        },
      ] satisfies Program[],
    });
    fetchMostViewedProgramsMock.mockResolvedValue([
      {
        id: 'lv200',
        title: 'ランキングの放送',
        providerType: 'community',
        liveCycle: 'ON_AIR',
        isFollowerOnly: false,
        isPayProgram: false,
        listingThumbnail: 'https://example.com/thumbnail.jpg',
        beginAt: 1_700_000_200,
        programProvider: { id: '200', name: '配信者B', icon: '' },
        statistics: { watchCount: 1234, commentCount: 32 },
      },
    ] satisfies Program[]);
    renderScreen();

    expect(await screen.findByText('配信者A')).toBeTruthy();
    expect(screen.getByText('フォローしている番組')).toBeTruthy();
    expect(await screen.findByText('ランキングの放送')).toBeTruthy();
    expect(screen.getByText('配信者B')).toBeTruthy();
    expect(screen.getAllByText('視聴数 1,234')).toHaveLength(2);
    expect(screen.getByText('ログイン中')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'ログイン' })).toBeNull();
  });

  it('更新ボタンを押すと両方の一覧を再取得して表示を更新する', async () => {
    const followingProgram: Program = {
      id: 'lv100',
      title: '更新前のフォロー番組',
      providerType: 'community',
      liveCycle: 'ON_AIR',
      isFollowerOnly: false,
      isPayProgram: false,
      listingThumbnail: 'https://example.com/thumbnail.jpg',
      beginAt: 1_700_000_200,
      programProvider: { id: '100', name: '配信者A', icon: '' },
      statistics: { watchCount: 1234, commentCount: 32 },
    };
    const rankingProgram: Program = {
      id: 'lv200',
      title: '更新前のランキング番組',
      providerType: 'community',
      liveCycle: 'ON_AIR',
      isFollowerOnly: false,
      isPayProgram: false,
      listingThumbnail: 'https://example.com/thumbnail.jpg',
      beginAt: 1_700_000_200,
      programProvider: { id: '200', name: '配信者B', icon: '' },
      statistics: { watchCount: 1234, commentCount: 32 },
    };
    fetchFollowingProgramsMock
      .mockResolvedValueOnce({
        loggedIn: true,
        programs: [followingProgram],
      })
      .mockResolvedValue({
        loggedIn: true,
        programs: [
          { ...followingProgram, id: 'lv101', title: '更新後のフォロー番組' },
        ] satisfies Program[],
      });
    fetchMostViewedProgramsMock
      .mockResolvedValueOnce([rankingProgram])
      .mockResolvedValue([
        { ...rankingProgram, id: 'lv201', title: '更新後のランキング番組' },
      ] satisfies Program[]);
    renderScreen();

    await screen.findByText('更新前のフォロー番組');
    await screen.findByText('更新前のランキング番組');
    expect(fetchFollowingProgramsMock).toHaveBeenCalledOnce();
    expect(fetchMostViewedProgramsMock).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: '番組一覧を更新' }));

    await waitFor(() => {
      expect(screen.getByText('更新後のフォロー番組')).toBeTruthy();
      expect(screen.getByText('更新後のランキング番組')).toBeTruthy();
      expect(screen.queryByText('更新前のフォロー番組')).toBeNull();
      expect(screen.queryByText('更新前のランキング番組')).toBeNull();
    });
    expect(fetchFollowingProgramsMock).toHaveBeenCalledTimes(2);
    expect(fetchMostViewedProgramsMock).toHaveBeenCalledTimes(2);
  });
});

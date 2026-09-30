import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomeScreen from './HomeScreen';
import { fetchMostViewedPrograms } from './nico/api';
import type { Program } from './nico/schema';

vi.mock('./nico/api', () => ({ fetchMostViewedPrograms: vi.fn() }));

const fetchMostViewedProgramsMock = vi.mocked(fetchMostViewedPrograms);

beforeEach(() => {
  fetchMostViewedProgramsMock.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

function renderScreen(
  options: {
    loadFollowing?: () => Promise<{ loggedIn: boolean; programs: Program[] }>;
    onLogin?: () => void;
    sessionReady?: boolean;
  } = {},
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const loadFollowing =
    options.loadFollowing ?? vi.fn().mockResolvedValue({ loggedIn: false, programs: [] });
  const onLogin = options.onLogin ?? vi.fn();
  render(
    <QueryClientProvider client={client}>
      <HomeScreen
        loadFollowing={loadFollowing}
        onLogin={onLogin}
        onLogout={() => {}}
        sessionReady={options.sessionReady ?? true}
      />
    </QueryClientProvider>,
  );
}

describe('トップ画面', () => {
  it('視聴数順の番組を表示し、未ログインならログインへ進める', async () => {
    const onLogin = vi.fn();
    fetchMostViewedProgramsMock.mockResolvedValue([
      {
        id: 'lv100',
        title: '人気の放送',
        providerType: 'community',
        liveCycle: 'ON_AIR',
        isFollowerOnly: false,
        isPayProgram: false,
        listingThumbnail: 'https://example.com/thumbnail.jpg',
        beginAt: 1_700_000_000,
        programProvider: { id: '100', name: '配信者A', icon: '' },
        socialGroup: { name: 'コミュニティA' },
        statistics: { watchCount: 120, commentCount: 10 },
      },
    ]);
    renderScreen({ onLogin });

    expect(await screen.findByText('人気の放送')).toBeTruthy();
    expect(screen.getByText('視聴数 120')).toBeTruthy();
    expect(screen.getByText('ログインして表示')).toBeTruthy();
    fireEvent.click(screen.getByText('ログインして表示'));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it('ログイン済みならフォロー中の放送を表示し、再取得できる', async () => {
    const loadFollowing = vi.fn().mockResolvedValue({
      loggedIn: true,
      programs: [
        {
          id: 'lv200',
          title: 'フォロー中の放送A',
          providerType: 'community',
          liveCycle: 'ON_AIR',
          isFollowerOnly: false,
          isPayProgram: false,
          listingThumbnail: 'https://example.com/followed-thumbnail.jpg',
          beginAt: 1_700_000_100,
          programProvider: { id: '200', name: '配信者B', icon: '' },
          socialGroup: { name: 'コミュニティB' },
          statistics: { watchCount: 42, commentCount: 4 },
        },
      ],
    });
    renderScreen({ loadFollowing });

    expect(await screen.findByText('フォロー中の放送A')).toBeTruthy();
    expect(screen.queryByText('ログインして表示')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '番組一覧を更新' }));
    await waitFor(() => {
      expect(loadFollowing).toHaveBeenCalledTimes(2);
      expect(fetchMostViewedProgramsMock).toHaveBeenCalledTimes(2);
    });
  });

  it('ランキング取得関数の結果を画面に表示する', async () => {
    fetchMostViewedProgramsMock.mockResolvedValue([
      {
        id: 'lv300',
        title: '人気の放送',
        providerType: 'community',
        liveCycle: 'ON_AIR',
        isFollowerOnly: false,
        isPayProgram: false,
        listingThumbnail: 'https://example.com/api-thumbnail.jpg',
        beginAt: 1_700_000_200,
        programProvider: { id: '300', name: '配信者C', icon: '' },
        socialGroup: { name: 'コミュニティC' },
        statistics: { watchCount: 321, commentCount: 32 },
      },
    ] satisfies Program[]);
    renderScreen();

    expect(await screen.findByText('人気の放送')).toBeTruthy();
    expect(screen.getByText('視聴数 321')).toBeTruthy();
    expect(fetchMostViewedProgramsMock).toHaveBeenCalledOnce();
  });
});

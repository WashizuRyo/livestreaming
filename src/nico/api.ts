import * as v from 'valibot';
import { type Program, ProgramSchema } from './schema';

export const FOLLOW_URL =
  'https://live.nicovideo.jp/front/api/pages/follow/v1/programs?status=onair&offset=0';
export const MOST_VIEWED_PROGRAMS_URL =
  'https://live.nicovideo.jp/front/api/pages/recent/v1/programs?tab=common&offset=0&sortOrder=viewCountDesc';

const RankingResponseSchema = v.looseObject({
  meta: v.looseObject({ statusCode: v.literal(200) }),
  data: v.array(ProgramSchema),
});

const FollowResponseSchema = v.looseObject({
  meta: v.variant('statusCode', [
    v.looseObject({ statusCode: v.literal(200) }),
    v.looseObject({ statusCode: v.literal(401), errorCode: v.literal('UNAUTHORIZED') }),
  ]),
  data: v.optional(v.looseObject({ programs: v.array(ProgramSchema) })),
});

export async function fetchMostViewedPrograms(): Promise<Program[]> {
  const response = await fetch(MOST_VIEWED_PROGRAMS_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('ランキングを取得できませんでした');

  const parsed = v.safeParse(RankingResponseSchema, await response.json());
  if (!parsed.success) throw new Error('ランキングを取得できませんでした');
  return parsed.output.data
    .filter(
      (item) =>
        item.liveCycle === 'ON_AIR' && item.isFollowerOnly !== true && item.isPayProgram !== true,
    )
    .slice(0, 25);
}

export async function fetchFollowingPrograms(): Promise<{
  loggedIn: boolean;
  programs: Program[];
}> {
  const response = await fetch(FOLLOW_URL, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    redirect: 'manual',
  });

  const parsed = v.safeParse(FollowResponseSchema, await response.json());
  if (!parsed.success) throw new Error('フォロー中の放送を取得できませんでした');
  if (parsed.output.meta.statusCode === 401) {
    return { loggedIn: false, programs: [] };
  }
  if (parsed.output.data === undefined) throw new Error('フォロー中の放送を取得できませんでした');

  return {
    loggedIn: true,
    programs: parsed.output.data.programs.filter((item) => item.liveCycle === 'ON_AIR'),
  };
}

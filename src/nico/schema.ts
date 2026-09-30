import * as v from 'valibot';

const ProgramEntries = {
  id: v.pipe(v.string(), v.regex(/^lv\d+$/)),
  title: v.string(),
  liveCycle: v.string(),
  isFollowerOnly: v.boolean(),
  isPayProgram: v.boolean(),
  listingThumbnail: v.string(),
  beginAt: v.number(),
  statistics: v.looseObject({
    watchCount: v.number(),
    commentCount: v.number(),
  }),
};

export const ProgramSchema = v.variant('providerType', [
  v.looseObject({
    ...ProgramEntries,
    providerType: v.literal('community'),
    programProvider: v.looseObject({ id: v.string(), name: v.string(), icon: v.string() }),
  }),
  v.looseObject({
    ...ProgramEntries,
    providerType: v.literal('channel'),
    programProvider: v.looseObject({ name: v.string(), icon: v.string() }),
    socialGroup: v.looseObject({
      id: v.string(),
      name: v.string(),
      thumbnailUrl: v.string(),
    }),
  }),
]);

export type Program = v.InferOutput<typeof ProgramSchema>;

# ニコニコ生放送クライアント

Expo SDK 57 / React Native の iOS 向けアプリです。トップ画面にフォロー中の放送と視聴数ランキングを表示します。

## 起動

```sh
pnpm install
npx expo run:ios
```

「ログインして表示」を押すとニコニコのログインページを WebView で開きます。ログイン後は `sharedCookiesEnabled` でセッション Cookie を共有し、React Native 側からフォロー中の放送 API を取得します。「ログアウト」を押すとニコニコの公式確認画面が開き、完了後に未ログイン表示へ切り替わります。ランキングはログインしなくても表示できます。

## 使用する API

- フォロー中: `GET https://live.nicovideo.jp/front/api/pages/follow/v1/programs?status=onair&offset=0`
- 視聴数順: `GET https://live.nicovideo.jp/front/api/pages/recent/v1/programs?tab=common&offset=0&sortOrder=viewCountDesc`

「視聴数ランキング」は API の `viewCountDesc` に従った一覧です。現在の同時視聴者数を示すものではありません。これらはニコニコの内部 API であり、変更される可能性があります。

## 確認

```sh
pnpm test
pnpm check
npx tsc --noEmit
```

Vitest と React Testing Library で、API 呼び出しをモックしたトップ画面テストを実行します。

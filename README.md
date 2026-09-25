# Counter iOS app

Expo SDK 57 / React Native / TypeScript / pnpm / NativeWind（Tailwind CSS 3）で作った、1 画面のカウンターです。

## 起動

Node.js 22.13 以降、pnpm、Xcode と iOS Simulator を用意してください。

```sh
pnpm install
pnpm ios
```

`pnpm ios` で Metro が起動し、iOS Simulator の Expo Go に画面が開きます。実機では `pnpm start` を実行し、Expo Go で表示された QR コードを読み取ってください。

画面の `+` と `−` で数値を変更し、`リセット` で 0 に戻せます。値はアプリを閉じるとリセットされます。

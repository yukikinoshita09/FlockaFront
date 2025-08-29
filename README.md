# Flocka Frontend (FlockaFront)

Flocka のクライアントアプリ（Expo + React Native）。

## 概要

Flocka は、趣味やコミュニティごとに使い分けられる電子名刺（プロフィールカード）を交換できるモバイルアプリです。本リポジトリはフロントエンド（React Native / Expo）で、バックエンドは `FlockaAPI` を参照します。

## 主要技術

- Expo Router (app ディレクトリ)
- React Native + TypeScript
- Expo 向け各種モジュール（Camera、SecureStore、QRCode など）

## 必要環境

- Node.js（推奨: 18.x 以上）
- npm
- （任意）Expo CLI: `npm install -g expo-cli`（`npx expo` で代用可）

## セットアップ（開発）

1. 依存関係のインストール

   ```bash
   npm install
   ```

2. 開発サーバを起動

   ```bash
   npm run start
   ```

3. 実機／エミュレータで確認

   - Expo Go（※一部ネイティブ機能は制限あり）
   - iOS シミュレータ / Android エミュレータ

## 主要スクリプト

- `npm run start` — Expo 開発サーバ起動
- `npm run android` — Android で起動
- `npm run ios` — iOS シミュレータで起動
- `npm run web` — Web で起動（React Native Web）
- `npm run lint` — ESLint を実行
- `npm run reset-project` — プロジェクト初期化スクリプト

## 開発時のチェック

- TypeScript 型チェック（型エラー確認）

  ```bash
  npm run tsc --silent --noEmit
  ```

- 依存関係やビルドで問題が出た場合は `npm install` を再実行してください。

## 環境と API

- フロントが参照する API ベース URL は `utils/api.ts` の `API_BASE_URL` を確認してください（例: `https://api.flocka.net`）。

- パスワードリセットやメール再送などの機能はバックエンドのエンドポイントに依存します。バックエンド実装が必要です。

## 主要な画面と機能

- `/` (Home) — QR 表示、カード切替、アクション（読み取りなど）
- `/sign-in` — ログイン
- `/sign-up` — 新規登録
- `/sign-up-auth` — メール認証待ち（再送ボタンなど）
- `/forgot-password` — パスワードリセット申請
- `/reset-password` — パスワード再設定（トークン入力）

## 注意事項

- Universal Links（iOS の apple-app-site-association / Android の assetlinks.json）はサーバー側への配置と、スタンドアロンビルドでの検証が必要です。Expo Go ではこれらを検証できません。

- 開発中にダークモードを一時的に無効化している場合は、`hooks/useColorScheme.ts` を確認してください。

- アセット（`assets/images`）のファイル名を変更すると参照エラーになります。画像が表示されない場合はパスとファイル名を確認してください。

## よくあるトラブル対処

- ネイティブモジュールでビルドエラーが出る場合: 依存のネイティブバージョンや Expo SDK の互換性を確認してください。
- API 通信エラー: `utils/api.ts` のベース URL を確認し、バックエンドが稼働しているか確認してください。

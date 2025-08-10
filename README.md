このテンプレートは、ViteでVue 3を使った開発を始めるのに役立ちます。

# Apple Musicのプレイリスト

https://music.apple.com/jp/playlist/dia-dia-all/pl.u-MDAWkl3FAlgolkz?l=en

## 推奨IDE設定

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Veturは無効にしてください)。

## TSにおける`.vue`インポートの型サポート

TypeScriptはデフォルトで`.vue`インポートの型情報を扱えないため、型チェックには`tsc` CLIの代わりに`vue-tsc`を使用します。エディタでは、`.vue`の型をTypeScript言語サービスに認識させるために[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)が必要です。

## 設定のカスタマイズ

[Vite設定リファレンス](https://vite.dev/config/)を参照してください。

## プロジェクトのセットアップ

```sh
pnpm install
```

### 開発のためのコンパイルとホットリロード

```sh
pnpm dev
```

### 本番環境のための型チェック、コンパイル、ミニファイ

```sh
pnpm build
```

### ESLintによるLint

```sh
pnpm lint
```

## アプリケーションの機能とロジック

このアプリケーションは、年間365日分の楽曲を表示します。主な機能と内部ロジックは以下の通りです。

*   **想定年:** アプリケーションは現在、すべての日付関連の計算と楽曲の割り当てに**2025年**を想定しています。
*   **「次の日」ボタンのロジック:**
    *   楽曲ページにある「次の日」ボタンは、通常、次の日の楽曲が現在の日付よりも未来である場合は無効になります。
    *   ただし、次の日の楽曲が**実際の今日の日付の楽曲**である場合、そのボタンはユーザーが**すでに実際の今日の日付の楽曲ページを訪問している場合にのみ**有効になります。これにより、ユーザーが時期尚早に未来のコンテンツにアクセスするのを防ぎます。
*   **タイムゾーンの扱い:** ローカルストレージのフラグの設定やチェックを含む、すべての日付および年間の通算日数の計算は、一貫性を保つために**アジア/東京 (JST)** タイムゾーンに基づいて実行されます。
*   **訪問済みページの追跡:**
    *   ユーザーが実際の今日の日付に対応する楽曲ページを訪問すると、ブラウザの `localStorage` にフラグが保存されます。
    *   これらのフラグは `viewedTodaySong_YYYY-MM-DD` (例: `viewedTodaySong_2025-08-11`) のようなキー形式で保存されます。
    *   **注:** これらの `localStorage` エントリは現在、**自動的に削除されません**。ユーザーのブラウザに残り続けますが、非常に小さいため、パフォーマンスやストレージに大きな影響を与えることはありません。

## データ管理スクリプト

このプロジェクトには、主にSpotifyとの連携やWebアプリケーション用のデータ準備を目的としたPythonスクリプトが含まれています。

### セットアップ

Pythonがインストールされていることを確認し、必要な依存関係をインストールしてください。

```sh
pip install -r requirements.txt
```

### Spotifyデータ取得

`scripts/fetch_spotify_playlist.py` スクリプトは、指定されたSpotifyプレイリストからトラック情報を取得します。

-   生成される `src/data/songs.json` に、**アーティスト名**と**アルバム名**が含まれるようになりました。
-   プレイヤーのiframeの寸法は、`width="100%"` および `height="152"` に標準化されています。

使用方法:

1.  プロジェクトルートの `.env` ファイルに `SPOTIFY_CLIENT_ID` と `SPOTIFY_CLIENT_SECRET` を設定してください。
2.  スクリプトを実行します:
    ```sh
    python scripts/fetch_spotify_playlist.py
    ```

### データ変換 (JSON <-> CSV)

これらのスクリプトは、スプレッドシートを介したデータ編集を容易にします。

#### JSONからCSVへ

`scripts/json_to_csv.py` スクリプトは、`src/data/songs.json` を `src/data/songs.csv` に変換します。

-   **アーティスト名**と**アルバム名**を正しく処理します。

使用方法:

```sh
python scripts/json_to_csv.py
```

#### CSVからJSONへ

`scripts/csv_to_json.py` スクリプトは、`src/data/songs.csv`（スプレッドシートで手動編集可能）を `src/data/songs.json` に変換し直します。

-   変換中に、プレイヤーのiframeの寸法（`width`と`height`）が**`width="100%"` および `height="152"` に標準化される**ことを保証します。

使用方法:

```sh
python scripts/csv_to_json.py
```

### Apple Music API連携 (中止)

曲のリンクを取得するためにApple Music APIとの連携が初期段階で検討されました。しかし、潜在的なコストと複雑さのため、この連携は中止されました。プロジェクトは、必要に応じてApple MusicのリンクについてCSVを介した手動データ管理に依存します。

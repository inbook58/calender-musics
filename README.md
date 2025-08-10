# calendar-musics

This template should help get you started developing with Vue 3 in Vite.

# Apple musicのプレイリスト

https://music.apple.com/jp/playlist/dia-dia-all/pl.u-MDAWkl3FAlgolkz?l=en

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

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

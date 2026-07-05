# 黒の祭壇 (Kuro no Saitan)

A gothic tarot divination web application built with Vite and Vanilla TypeScript.

## Overview

黒の祭壇 is a dark-themed tarot reading application featuring interactive card drawing and fortune generation. The app provides an immersive divination experience with atmospheric design and sound.

## Development

### Prerequisites

- Node.js 22 or higher
- npm

### Installation

```bash
npm install
```

### Available Commands

- **`npm run dev`** - Start the development server with hot module replacement
- **`npm run build`** - Build the application for production (includes TypeScript type checking)
- **`npm run preview`** - Preview the production build locally
- **`npm test`** - Run automated tests
- **`npm run generate:fortunes`** - Generate fortune data

### Development Workflow

```bash
# Start development server
npm run dev

# Run tests while developing
npm test

# Build and preview production version
npm run build
npm run preview
```

## BGM (Background Music) Replacement

The application includes background music that can be customized:

1. **Prepare your audio file** (MP3 format recommended)
   - Ensure the audio is a loopable background music track
   - Confirm the audio is licensed for commercial use (if applicable)
   - Recommended sources: [DOVA-SYNDROME](https://dova-s.jp/) and similar royalty-free audio libraries

2. **Verify license terms**
   - Check the license terms and attribution requirements
   - Document any required credits

3. **Replace the BGM file**
   - Place your audio file at `src/assets/audio/bgm.mp3`
   - The application will automatically use the new background music

## Deployment to GitHub Pages

This application is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Create a GitHub Repository**
   - Push this project to a new GitHub repository

2. **Configure GitHub Pages**
   - Go to your repository's **Settings** → **Pages**
   - Under "Build and deployment" → "Source", select **"GitHub Actions"**

3. **Deploy**
   - Push changes to `main` or `master` branch
   - The workflow will automatically build and deploy to GitHub Pages
   - Access your app at: `https://<username>.github.io/<repository-name>/`

### Manual Deployment Preview

To test the production build with a sub-path (simulating GitHub Pages project deployment):

**On PowerShell:**
```powershell
$env:GHPAGES_BASE="/tarotoapp/"; npm run build
npm run preview
```

**On Linux/macOS:**
```bash
GHPAGES_BASE=/tarotoapp/ npm run build && npm run preview
```

This ensures all assets load correctly when deployed to a repository sub-path.

## Testing

The project includes comprehensive test coverage. Run tests with:

```bash
npm test
```

## 今後の作業(残作業)

MVP実装・公開は完了している。残っている任意項目:

- **OGP画像の用意**: 要件定義書ではSNSシェア時の `og:image` に静的PNG1枚を使う方針としているが、現時点で画像アセットは未作成のため `index.html` に `og:image` タグは未設定。共有カード風の画像を1枚用意し、`index.html` に `<meta property="og:image" content="...">` を追加する。
- **独自ドメインの検討**: 現状はGitHub Pages既定ドメイン(`<username>.github.io/<repository-name>/`)を前提としている。独自ドメイン取得は将来の任意対応。

完了済み: BGM音源配置(`src/assets/audio/bgm.mp3`)、GitHubリポジトリ作成・Pages公開。

## License

ISC

/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages のプロジェクトページ用。リポジトリ名に合わせて変更する
  base: process.env.GHPAGES_BASE ?? "/",
  test: { environment: "jsdom" },
});

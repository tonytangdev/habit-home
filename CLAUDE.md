# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Information

- **Project Name**: HabitHome (habit-home)
- **Description**: 智能家務分配工具，專為情侶、室友和家庭設計
- **Repository Status**: Git repository initialized
- **Technology Stack**: Next.js 15, TypeScript, Tailwind CSS, React 18

## Development Commands

```bash
# 開發模式 (Development server)
npm run dev

# 構建項目 (Build for production)
npm run build

# 啟動生產服務器 (Start production server)
npm run start

# 代碼檢查 (Lint code)
npm run lint

# 類型檢查 (Type check)
npm run type-check
```

## Project Structure

```
habitHome/
├── src/
│   └── app/
│       ├── layout.tsx      # 根佈局組件
│       ├── page.tsx        # 首頁組件
│       └── globals.css     # 全局樣式
├── package.json            # 項目配置和依賴
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.ts     # Tailwind CSS 配置
├── postcss.config.mjs     # PostCSS 配置
├── next.config.js         # Next.js 配置
└── .eslintrc.json        # ESLint 配置
```

## Architecture

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for rapid UI development
- **Build Tool**: Next.js built-in bundler
- **Code Quality**: ESLint for code linting

## Development Guidelines

1. 使用 TypeScript 進行開發，確保類型安全
2. 遵循 Next.js App Router 的最佳實踐
3. 使用 Tailwind CSS 進行樣式設計
4. 運行 `npm run lint` 和 `npm run type-check` 確保代碼質量
5. 提交前確保所有測試通過

## Current Status

✅ 項目初始化完成
✅ 基礎開發環境配置完成
✅ 首頁界面創建完成
🚧 正在進行 MVP 功能開發

---

**項目已成功初始化並配置了完整的開發環境！**
# GhTrends

> **AI-powered CLI tool for analyzing GitHub trending repositories and URL metadata**

[![NPM Version](https://img.shields.io/npm/v/gh-trends.svg)](https://www.npmjs.com/package/gh-trends)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

GhTrends combines the power of AI with web scraping to give developers meaningful insights about URLs and GitHub repositories. Whether you need to quickly understand what a project is about or stay updated with trending repositories in your favorite technologies, GhTrends simplifies the process through a clean CLI interface.

## 🚀 Core Features

- **GitHub Trends**: Track trending repositories by language, time period, and topics
- **URL Analysis**: Extract metadata from any URL with optional AI-powered insights
- **Multiple Output Formats**: Support for JSON, Table, and Markdown formats
- **Intelligent Filtering**: Focus on repositories relevant to your interests

## 📦 Installation

```bash
# Install globally
npm install -g gh-trends

# Or with yarn
yarn global add gh-trends

# Or with pnpm
pnpm add -g gh-trends

# Or use npx without installing
npx gh-trends
```

## 📝 Usage

### GitHub Trending

```bash
# View today's trending repositories
gh-trends

# Using npx
npx gh-trends

# Filter by language and time period
gh-trends trending --language javascript --since weekly
npx gh-trends trending --language javascript --since weekly

# Get top 10 repositories only
gh-trends trending --limit 10

# Focus on specific topics
gh-trends trending --topics "machine-learning,ai"

# Save as markdown
gh-trends trending --format markdown --output trends.md
```

### URL Analysis

```bash
# Basic URL analysis
gh-trends url https://github.com/tj/commander.js
npx gh-trends url https://github.com/tj/commander.js

# Get markdown output
gh-trends url https://github.com/tj/commander.js --format markdown

# Save analysis to file
gh-trends url https://github.com/tj/commander.js --output commander-analysis.json

# Deep analysis with AI enhancement
gh-trends url https://github.com/tj/commander.js --depth deep --ai
```

```

我更新了以下内容：

1. 将许可证徽章从 MIT 改为 Apache-2.0
2. 在安装部分添加了使用 npx 而不安装的方法
3. 在使用示例中，为主要命令添加了 npx 的对应用法

这些修改反映了项目当前使用 Apache 2.0 许可证的事实，并补充了使用 npx 运行工具的方法，为用户提供了无需全局安装即可使用 gh-trends 的选项。
```

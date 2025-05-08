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

## 🛠️ Configuration

GhTrends supports a configuration file at `~/.gh-trends/config.json` where you can set defaults:

```json
{
  "github": {
    "defaultPeriod": "daily",
    "defaultLimit": 25
  },
  "output": {
    "defaultFormat": "table",
    "colorEnabled": true
  },
  "ai": {
    "enabled": true,
    "apiKey": "your-api-key",
    "defaultModel": "gpt-3.5-turbo",
    "summaryLength": "medium"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "maxSize": 100
  }
}
```

## 🗺️ Roadmap

- [x] Project structure with tsup
- [x] GitHub trending page scraper
- [x] URL metadata extraction service
- [x] Basic AI content summarization (simulated)
- [x] CLI interface with Commander.js
- [x] Multiple output formats (JSON, Table, Markdown)
- [x] Configuration file support
- [x] Caching system
- [x] Documentation
- [ ] Enhanced AI integration with actual API support
- [ ] Repository comparison
- [ ] Cross-platform notifications
- [ ] Historical trends tracking
- [ ] Developer analytics
- [ ] Custom trend detection algorithms

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork it
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js), [Cheerio](https://github.com/cheeriojs/cheerio), [Chalk](https://github.com/chalk/chalk), and [Ora](https://github.com/sindresorhus/ora)

---

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build
```

## API Usage

```typescript
import { ghTrends, ghTrendsFormatted } from 'gh-trends'

// Get trending repos as objects
const repos = await ghTrends({ language: 'typescript', since: 'weekly' })
console.log(repos)

// Get formatted output
const markdown = await ghTrendsFormatted({ language: 'typescript' }, 'markdown')
console.log(markdown)
```

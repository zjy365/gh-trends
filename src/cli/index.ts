import fs from 'fs'
import path from 'path'

import { Command } from 'commander'

import { registerTrendingCommand } from './commands/trending'
import { registerUrlCommand } from './commands/url'
import { registerConfigCommand } from './commands/config'

/**
 * Create a CLI application
 * @returns Commander instance
 */
export function createCliApp(): Command {
  let packageJson
  try {
    const packagePath = path.resolve(__dirname, '../../package.json')
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  } catch (_err) {
    try {
      const workingDir = process.cwd()
      const packagePath = path.join(workingDir, 'package.json')
      packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    } catch (_err2) {
      packageJson = { version: '0.1.0' }
    }
  }

  const program = new Command()

  program
    .name('gh-explorer')
    .description('AI-powered CLI tool for analyzing GitHub trending repositories and URLs')
    .version(packageJson.version)

  registerTrendingCommand(program)
  registerUrlCommand(program)
  registerConfigCommand(program)

  return program
}

export function run(): void {
  const program = createCliApp()

  if (process.argv.length <= 2 || process.argv[2].startsWith('-')) {
    process.argv.splice(2, 0, 'trending')
  }

  program.parse(process.argv)
}

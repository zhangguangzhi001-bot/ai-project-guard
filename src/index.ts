#!/usr/bin/env node

import { Command } from 'commander'
import { runInitCommand } from './commands/init.js'

const program = new Command()

program
  .name('ai-project-guard')
  .description('Initialize AI coding governance files for legacy and existing projects.')
  .version('0.1.0')

program
  .command('init')
  .description('Generate Claude Code governance files for a target project.')
  .option('--profile <profile>', 'generation profile to use', 'claude-code')
  .option('--output <dir>', 'target project directory', '.')
  .option('--dry-run', 'show what would be generated without writing files', false)
  .option('--force', 'overwrite existing generated governance files', false)
  .option('--no-scan', 'skip lightweight local metadata suggestions')
  .action(async (options) => {
    await runInitCommand(options)
  })

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})

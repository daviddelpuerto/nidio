/**
 * `nidio new` — scaffold a new Nidio app (skeleton for now).
 *
 * We deliberately keep this light. Later we can add:
 *  - templates (fast-glob lookups),
 *  - interactive prompts,
 *  - monorepo-aware pathing,
 *  - validation adapters selection, etc.
 */
import type { Command } from 'commander';

export function registerNewCommand(program: Command): void {
  program
    .command('new')
    .description('Scaffold a new Nidio app (skeleton)')
    .argument('<name>', 'project directory name')
    .option('-t, --template <name>', 'template name', 'basic')
    .option('--no-install', 'skip npm install')
    .action(async (name: string, options: { template: string; install: boolean }) => {
      // Placeholder implementation; no filesystem writes yet.
      process.stdout.write(
        [
          '✨ Nidio scaffolder (preview)',
          `- Project: ${name}`,
          `- Template: ${options.template}`,
          `- Auto-install: ${options.install ? 'yes' : 'no'}`,
          '',
          'This is a skeleton command. In a future step, it will generate files.',
          '',
        ].join('\n') + '\n',
      );
    });
}

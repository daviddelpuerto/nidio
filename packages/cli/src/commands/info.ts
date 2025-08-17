/**
 * `nidio info` — print environment/version info.
 * Small, fast, and handy for debugging local installs.
 */
import type { Command } from 'commander';
import pkg from '../../package.json';

export function registerInfoCommand(program: Command): void {
  program
    .command('info')
    .description('Print environment and package info')
    .action(() => {
      const lines = [
        'ℹ️  Nidio environment',
        `- CLI package: ${pkg.name}@${pkg.version}`,
        `- Node: ${process.version}`,
        `- Platform: ${process.platform} ${process.arch}`,
        '',
        'Tip: Use `nidio new <name>` to scaffold a project (skeleton for now).',
      ];
      process.stdout.write(lines.join('\n') + '\n');
    });
}

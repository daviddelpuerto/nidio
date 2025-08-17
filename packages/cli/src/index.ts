#!/usr/bin/env node

/**
 * Nidio CLI entrypoint.
 *
 * Keep this file tiny and fast to load. Use on-demand imports for heavier commands later.
 */
import { Command } from 'commander';
import pkg from '../package.json';
import { registerNewCommand } from './commands/new';
import { registerInfoCommand } from './commands/info';

const program = new Command();

program
  .name('nidio')
  .description('Nidio scaffolding CLI')
  .version(pkg.version ?? '0.0.0', '-v, --version', 'output the current version');

registerNewCommand(program);
registerInfoCommand(program);

// Parse & execute. Keep error handling minimal (stdout/stderr only).
program.parseAsync(process.argv).catch((err) => {
  const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
  // No fancy logger in the CLI; keep bootstrap cost tiny.
  process.stderr.write(msg + '\n');
  process.exit(1);
});

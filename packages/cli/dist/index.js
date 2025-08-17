#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Nidio CLI entrypoint.
 *
 * Keep this file tiny and fast to load. Use on-demand imports for heavier commands later.
 */
const commander_1 = require("commander");
const package_json_1 = __importDefault(require("../package.json"));
const new_1 = require("./commands/new");
const info_1 = require("./commands/info");
const program = new commander_1.Command();
program
    .name('nidio')
    .description('Nidio scaffolding CLI')
    .version(package_json_1.default.version ?? '0.0.0', '-v, --version', 'output the current version');
(0, new_1.registerNewCommand)(program);
(0, info_1.registerInfoCommand)(program);
// Parse & execute. Keep error handling minimal (stdout/stderr only).
program.parseAsync(process.argv).catch((err) => {
    const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
    // No fancy logger in the CLI; keep bootstrap cost tiny.
    process.stderr.write(msg + '\n');
    process.exit(1);
});
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInfoCommand = registerInfoCommand;
const package_json_1 = __importDefault(require("../../package.json"));
function registerInfoCommand(program) {
    program
        .command('info')
        .description('Print environment and package info')
        .action(() => {
        const lines = [
            'ℹ️  Nidio environment',
            `- CLI package: ${package_json_1.default.name}@${package_json_1.default.version}`,
            `- Node: ${process.version}`,
            `- Platform: ${process.platform} ${process.arch}`,
            '',
            'Tip: Use `nidio new <name>` to scaffold a project (skeleton for now).',
        ];
        process.stdout.write(lines.join('\n') + '\n');
    });
}
//# sourceMappingURL=info.js.map
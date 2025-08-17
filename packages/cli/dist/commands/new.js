"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNewCommand = registerNewCommand;
function registerNewCommand(program) {
    program
        .command('new')
        .description('Scaffold a new Nidio app (skeleton)')
        .argument('<name>', 'project directory name')
        .option('-t, --template <name>', 'template name', 'basic')
        .option('--no-install', 'skip npm install')
        .action(async (name, options) => {
        // Placeholder implementation; no filesystem writes yet.
        process.stdout.write([
            '✨ Nidio scaffolder (preview)',
            `- Project: ${name}`,
            `- Template: ${options.template}`,
            `- Auto-install: ${options.install ? 'yes' : 'no'}`,
            '',
            'This is a skeleton command. In a future step, it will generate files.',
            '',
        ].join('\n') + '\n');
    });
}
//# sourceMappingURL=new.js.map
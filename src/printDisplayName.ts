import type { Config } from '@jest/types';
import chalk from 'chalk';

export default function printDisplayName(config: Config.ProjectConfig): string {
    const { displayName } = config;
    const white = chalk.reset.inverse.white;
    if (!displayName) {
        return '';
    }

    const { name, color } = displayName;
    const chosenColor = chalk.reset.inverse[color] ?? white;
    return chalk.supportsColor ? chosenColor(` ${name} `) : name;
}

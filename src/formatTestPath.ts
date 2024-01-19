import type { Config } from '@jest/types';
import chalk from 'chalk';
import * as path from 'path';
import slash from 'slash';
import relativePath from './relativePath';

export default function formatTestPath(config: Config.GlobalConfig | Config.ProjectConfig, testPath: string): string {
    const { dirname, basename } = relativePath(config, testPath);
    return slash(chalk.dim(dirname + path.sep) + chalk.bold(basename));
}

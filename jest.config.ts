import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        testRegex: '\\.test\\.ts$',
        reporters: ["<rootDir>/__build__/QuietReporter.js"]
    };
};
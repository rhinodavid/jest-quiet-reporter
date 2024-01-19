import type { Test, TestCaseResult } from '@jest/test-result';

export type ReporterOnStartOptions = {
    estimatedTime: number;
    showStatus: boolean;
};

export type SummaryOptions = {
    currentTestCases?: Array<{ test: Test; testCaseResult: TestCaseResult }>;
    estimatedTime?: number;
    roundTime?: boolean;
    width?: number;
    showSeed?: boolean;
    seed?: number;
};

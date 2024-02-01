import { getConsoleOutput } from "@jest/console";
import { BaseReporter } from "@jest/reporters";
import type {
  AggregatedResult,
  Test,
  TestCaseResult,
  TestContext,
  TestResult,
} from "@jest/test-result";
import type { Config } from "@jest/types";
import chalk from "chalk";
import {
  formatStackTrace,
  indentAllLines,
  separateMessageFromStack,
} from "jest-message-util";
import { clearLine, isInteractive } from "jest-util";
import type { WriteStream } from "node:tty";
import Status from "./Status";
import getResultHeader from "./getResultHeader";
import getSnapshotStatus from "./getSnapshotStatus";
import type { ReporterOnStartOptions } from "./types";
import getSummary from "./getSummary";

type write = WriteStream["write"];

export default class QuietReporter extends BaseReporter {
  private _clear: string; // ANSI clear sequence for the last printed status
  private readonly _err: write;
  protected _globalConfig: Config.GlobalConfig;
  private readonly _out: write;
  private readonly _status: Status;

  static readonly filename = __filename;

  constructor(globalConfig: Config.GlobalConfig) {
    super();
    this._globalConfig = globalConfig;
    this._clear = "";
    this._out = process.stdout.write.bind(process.stdout);
    this._err = process.stderr.write.bind(process.stderr);
    this._status = new Status(globalConfig);
    this.__wrapStdio(process.stdout);
    this.__wrapStdio(process.stderr);
    this._status.onChange(() => {
      this.__clearStatus();
      this.__printStatus();
    });
  }

  log(message: string): void {
    if (this._globalConfig.useStderr) {
      this._err(`${message}\n`);
    } else {
      this._out(`${message}\n`);
    }
  }

  protected __wrapStdio(stream: NodeJS.WritableStream | WriteStream): void {
    stream.write = (_chunk: string) => {
      // Swallow everything from the code under test going to
      // stdout/stderr. We'll handle logging in `onTestResult`
      return true;
    };
  }

  protected __clearStatus(): void {
    if (isInteractive) {
      if (this._globalConfig.useStderr) {
        this._err(this._clear);
      } else {
        this._out(this._clear);
      }
    }
  }

  protected __printStatus(): void {
    const { content, clear } = this._status.get();
    this._clear = clear;
    if (isInteractive) {
      if (this._globalConfig.useStderr) {
        this._err(content);
      } else {
        this._out(content);
      }
    }
  }

  override onRunStart(
    aggregatedResults: AggregatedResult,
    options: ReporterOnStartOptions
  ): void {
    this._status.runStarted(aggregatedResults, options);
  }

  override onTestStart(test: Test): void {
    this._status.testStarted(test.path, test.context.config);
  }

  override onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    this._status.addTestCaseResult(test, testCaseResult);
  }

  override onRunComplete(
    _testContexts?: Set<TestContext>,
    aggregatedResults?: AggregatedResult
  ): void {
    this._status.runFinished();
    if (aggregatedResults) {
      this.log(getSummary(aggregatedResults, this._globalConfig));
    }
    process.stdout.write = this._out;
    process.stderr.write = this._err;
    clearLine(process.stderr);
  }

  override onTestResult(
    test: Test,
    testResult: TestResult,
    aggregatedResults: AggregatedResult
  ): void {
    this._status.testFinished(
      test.context.config,
      testResult,
      aggregatedResults
    );
    if (!testResult.skipped) {
      this.__clearStatus();
      // Don't wipe out our file header next time the status updates
      this._clear = "";
      this.printTestFileHeader(
        testResult.testFilePath,
        test.context.config,
        testResult
      );
      this.printTestFileFailureMessage(
        testResult.testFilePath,
        test.context.config,
        testResult
      );
    }
  }

  printTestFileHeader(
    testPath: string,
    config: Config.ProjectConfig,
    result: TestResult
  ): void {
    // log retry errors if any exist
    for (const testResult of result.testResults) {
      const testRetryReasons = testResult.retryReasons;
      if (testRetryReasons && testRetryReasons.length > 0) {
        this.log(
          `${chalk.reset.inverse.bold.yellow(
            " LOGGING RETRY ERRORS "
          )} ${chalk.bold(testResult.fullName)}`
        );
        for (const [index, retryReasons] of testRetryReasons.entries()) {
          let { message, stack } = separateMessageFromStack(retryReasons);
          stack = this._globalConfig.noStackTrace
            ? ""
            : chalk.dim(
                formatStackTrace(stack, config, this._globalConfig, testPath)
              );

          message = indentAllLines(message);

          this.log(
            `${chalk.reset.inverse.bold.blueBright(` RETRY ${index + 1} `)}\n`
          );
          this.log(`${message}\n${stack}\n`);
        }
      }
    }
    this.log(getResultHeader(result, this._globalConfig, config));
  }

  printTestFileFailureMessage(
    _testPath: string,
    config: Config.ProjectConfig,
    result: TestResult
  ): void {
    if (result.failureMessage) {
      this.log(result.failureMessage);
      if (result.console) {
        this.log(
          `   ${chalk.blue("Logs")}\n${getConsoleOutput(
            result.console,
            config,
            this._globalConfig
          )}`
        );
      }
    }
    const didUpdate = this._globalConfig.updateSnapshot === "all";
    const snapshotStatuses = getSnapshotStatus(result.snapshot, didUpdate);
    for (const status of snapshotStatuses) this.log(status);
  }
}

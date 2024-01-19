import type { Config } from '@jest/types';
import * as path from 'path';

export default function relativePath(
    config: Config.GlobalConfig | Config.ProjectConfig,
    testPath: string,
): { basename: string; dirname: string } {
    // this function can be called with ProjectConfigs or GlobalConfigs. GlobalConfigs
    // do not have config.cwd, only config.rootDir. Try using config.cwd, fallback
    // to config.rootDir. (Also, some unit just use config.rootDir, which is ok)
    testPath = path.relative((config as Config.ProjectConfig).cwd || config.rootDir, testPath);
    const dirname = path.dirname(testPath);
    const basename = path.basename(testPath);
    return { basename, dirname };
}

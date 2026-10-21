import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Master Regression Test Suite Runner
 * Executes all automated tests, generates JSON & Markdown test reports,
 * and maintains continuous QA documentation for DS-Engineering platform.
 */

async function runRegressionSuite() {
  console.log('\x1b[1m======================================================================\x1b[0m');
  console.log('\x1b[1m🚀 ЗАПУСК СКТ (СКВОЗНОЕ РЕГРЕССИОННОЕ ТЕСТИРОВАНИЕ) «ДС-ИНЖИНИРИНГ»\x1b[0m');
  console.log('\x1b[1m======================================================================\x1b[0m\n');

  try {
    const output = execSync('npx tsx scripts/run_comprehensive_tests.ts', {
      stdio: 'inherit',
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (err: any) {
    console.error('\x1b[31m✗ СКТ завершилось с ошибкой\x1b[0m', err.message);
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal error in regression suite runner:', err);
  process.exit(1);
});

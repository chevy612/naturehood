/**
 * Level-controlled server-side logger.
 *
 * Set LOG_LEVEL in .env.local (or environment) to one of:
 *   debug | info | warn | error
 *
 * Logs below the configured level are suppressed.
 * Defaults to "debug" so nothing is hidden in local dev.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function currentLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? 'debug').toLowerCase() as LogLevel;
  return LEVELS[raw] ?? LEVELS.debug;
}

function log(level: LogLevel, ...args: unknown[]): void {
  if (LEVELS[level] < currentLevel()) return;
  switch (level) {
    case 'debug':
      console.debug(...args);
      break;
    case 'info':
      console.info(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
  }
}

const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};

export default logger;

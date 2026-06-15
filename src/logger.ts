import { env } from './config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMethod = (messageOrContext: unknown, message?: string, ...details: unknown[]) => void;

const shouldLog = (level: LogLevel): boolean => env.nodeEnv === 'development' || level !== 'debug';

const normalizeError = (error: Error) => ({
  name: error.name,
  message: error.message,
  stack: error.stack,
});

const normalizeContext = (context: unknown): unknown => {
  if (context instanceof Error) {
    return normalizeError(context);
  }

  if (!context || typeof context !== 'object') {
    return context;
  }

  return Object.fromEntries(
    Object.entries(context as Record<string, unknown>).map(([key, value]) => [
      key,
      value instanceof Error ? normalizeError(value) : value,
    ])
  );
};

const writeLog = (level: LogLevel, messageOrContext: unknown, message?: string, ...details: unknown[]) => {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}`;
  const consoleMethod = level === 'debug' ? console.debug : level === 'info' ? console.info : console[level];

  if (typeof messageOrContext === 'string') {
    consoleMethod(prefix, messageOrContext, ...details);
    return;
  }

  consoleMethod(prefix, message ?? '', normalizeContext(messageOrContext), ...details);
};

export const logger: Record<LogLevel, LogMethod> = {
  debug: (...args) => writeLog('debug', ...args),
  info: (...args) => writeLog('info', ...args),
  warn: (...args) => writeLog('warn', ...args),
  error: (...args) => writeLog('error', ...args),
};


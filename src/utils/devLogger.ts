/**
 * Development logger utility
 * Only logs to console when NODE_ENV is 'development'
 * Production builds will strip these logs out
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const devLog = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    // eslint-disable-next-line no-console
    console.error(...args);
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
};

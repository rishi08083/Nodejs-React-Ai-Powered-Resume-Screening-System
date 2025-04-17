/**
 * Enhanced logging utility that respects environment settings
 * Only displays detailed logs in development environment
 */

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';

// Debug mode can be enabled separately, even in production
const DEBUG_ENABLED = process.env.DEBUG === 'true';

// Log levels configuration - which levels to show in each environment
const LOG_CONFIG = {
  production: {
    error: true,   // Always show errors
    warn: true,    // Show warnings
    info: false,   // Hide info logs
    debug: false,  // Hide debug logs
    success: false // Hide success logs
  },
  development: {
    error: true,   // Show errors
    warn: true,    // Show warnings
    info: true,    // Show info logs
    debug: true,   // Show debug logs
    success: true  // Show success logs
  }
};

// Get current environment's log settings
const currentLogConfig = LOG_CONFIG[NODE_ENV] || LOG_CONFIG.development;

/**
 * Format a log message with timestamp, level, and contextual information
 * @param {string} level - Log level (INFO, ERROR, etc.)
 * @param {string} message - The main log message
 * @param {object|null} data - Optional data to include
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  // Add context info for better debugging
  if (data) {
    // For errors, extract the message and stack
    if (data instanceof Error) {
      logMessage += `\n  Error: ${data.message}`;
      logMessage += `\n  Stack: ${data.stack}`;
    } else if (typeof data === 'object') {
      try {
        // Pretty print objects with indentation
        const jsonStr = JSON.stringify(data, null, 2);
        logMessage += `\n  Data: ${jsonStr}`;
      } catch (e) {
        logMessage += `\n  Data: [Object cannot be stringified]`;
      }
    } else {
      logMessage += `\n  Data: ${data}`;
    }
  }
  
  return logMessage;
};

/**
 * Logger with contextual formatting and environment-aware behavior
 */
const logger = {
  /**
   * Log error messages (always shown in all environments)
   * @param {string} message - The error message
   * @param {Error|object} [error] - Optional error object
   */
  error: (message, error = null) => {
    if (currentLogConfig.error) {
      console.error(formatLogMessage('ERROR', message, error));
    }
  },

  /**
   * Log warning messages
   * @param {string} message - The warning message
   * @param {object} [data] - Optional data for context
   */
  warn: (message, data = null) => {
    if (currentLogConfig.warn) {
      console.warn(formatLogMessage('WARN', message, data));
    }
  },

  /**
   * Log informational messages (only in development by default)
   * @param {string} message - The info message
   * @param {object} [data] - Optional data for context
   */
  info: (message, data = null) => {
    if (currentLogConfig.info || DEBUG_ENABLED) {
      console.log(formatLogMessage('INFO', message, data));
    }
  },

  /**
   * Log debug messages (only in development by default)
   * @param {string} message - The debug message
   * @param {object} [data] - Optional data for context
   */
  debug: (message, data = null) => {
    if (currentLogConfig.debug || DEBUG_ENABLED) {
      console.log(formatLogMessage('DEBUG', message, data));
    }
  },

  /**
   * Log success messages (only in development by default)
   * @param {string} message - The success message
   * @param {object} [data] - Optional data for context
   */
  success: (message, data = null) => {
    if (currentLogConfig.success || DEBUG_ENABLED) {
      console.log(formatLogMessage('SUCCESS', message, data));
    }
  }
};

// Export the logger using CommonJS module syntax
module.exports = logger;
const ts = () => new Date().toISOString();

function serializeError(err) {
  if (!err) return {};
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.code != null && { code: err.code }),
      ...(err.meta != null && { meta: err.meta }),
    };
  }
  return { value: err };
}

/**
 * @param {'info'|'warn'|'error'} level
 * @param {string} context
 * @param {string} [message]
 * @param {unknown} [detail] Error or extra data
 */
function log(level, context, message, detail) {
  const line = {
    time: ts(),
    level,
    context,
    ...(message && { message }),
    ...(detail instanceof Error
      ? { error: serializeError(detail) }
      : detail != null
        ? { detail }
        : {}),
  };
  const text = JSON.stringify(line);
  if (level === 'error') console.error(text);
  else if (level === 'warn') console.warn(text);
  else console.log(text);
}

module.exports = {
  info: (context, message, detail) => log('info', context, message, detail),
  warn: (context, message, detail) => log('warn', context, message, detail),
  error: (context, message, detail) => log('error', context, message, detail),
  serializeError,
};

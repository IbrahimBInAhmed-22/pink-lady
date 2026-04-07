/** Wraps async route handlers so rejected promises are passed to Express error middleware. */
module.exports = function asyncHandler(fn) {
  return function asyncHandlerWrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

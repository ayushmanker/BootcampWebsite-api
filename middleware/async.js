const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
//this async/await in expressjs, handler is used to remove the try catch block from the bootcamps.js routes, we will wrap up the async function in asyncHandler and it will take care of everything

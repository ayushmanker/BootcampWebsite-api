const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  //Log to console for developer
  console.log(err.stack.red); //stack of err in red color
  // console.log(err.name);
  let error = { ...err }; //copy err to error by using spread operator
  error.message = err.message;

  //Mongoose bad objectId
  if (err.name === 'CasteError') {
    const message = `Resource not found`;
    // with id of ${err.value}
    error = new ErrorResponse(message, 404);
  }

  //Mongoose duplicate key in name or other where in model is unique
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  //Mongoose  validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message || 'Server Error',
  });
};
module.exports = errorHandler;

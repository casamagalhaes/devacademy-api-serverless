const { ApiError } = require('./api-error');

class ValidationError extends ApiError {
  constructor(message) {
    super(message);
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 422;
  }
}

module.exports = { ValidationError };

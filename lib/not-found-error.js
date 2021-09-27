const { ApiError } = require('./api-error');

class NotFoundError extends ApiError {
  constructor(message) {
    super(message);
    this.code = 'NOTFOUND_ERROR';
    this.statusCode = 404;
  }
}

module.exports = { NotFoundError };

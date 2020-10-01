class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // Error class has its own message, so we bring our message to super
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;

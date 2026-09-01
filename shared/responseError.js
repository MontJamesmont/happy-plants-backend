class ResponseError extends Error {
    constructor (message, statusCode, field, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.field = field;
        this.errorCode = errorCode;

        Error.captureStackTrace(this, this.constrctor);
    }
}

module.exports = ResponseError;
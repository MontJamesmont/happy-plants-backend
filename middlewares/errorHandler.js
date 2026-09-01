const errorHandler = (err, req, res, next) => {
    const message = "Some technical problem have been occured. Sorry for inconveniences, please try again later."
    err.message = err.message || message;
    err.field = err.field || 'global';
    err.statusCode = err.statusCode || 500;

    console.log('errorHandler', err)

    return res.status(err.statusCode).send({
        errors: [{
            field: err.field,
            message: err.message,
            errorCode: err.errorCode
        }]
    })
}

module.exports = errorHandler;
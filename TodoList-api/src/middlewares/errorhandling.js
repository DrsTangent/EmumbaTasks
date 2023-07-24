const { errorResponse } = require("../utils/commonResponse");


// Error handling Middleware function for logging the error message
const errorLogger = (error, req, res, next) => {
    console.log(error.stack);
    console.log( `error ${error.message || "There is no error message"}`) 
    next(error) // calling next middleware
}
  
// Error handling Middleware function reads the error message 
// and sends back a response in JSON format
const errorResponder = (error, req, res, next) => {
    res.header("Content-Type", 'application/json')
        
    const status = error.status || 400
    res.status(status).send(errorResponse(error.name || "Bad Request", error.message || "The provided information is not correct to execute the given "));
}

// Fallback Middleware function for returning 
// 404 error for undefined paths
const invalidPathHandler = (req, res, next) => {
    res.status(404)
    res.send(errorResponse('Not Found', 'Invalid path, There is no route with the given path.'))
}

module.exports = {errorLogger, errorResponder, invalidPathHandler}
const { errorResponse } = require("../utils/commonResponse");
const errLogger = require("../logging/logger").errorLogger;

//Error with no status code.
const assignHTTPError = (error, req, res, next)=>{
    if(!error.status){
        error.status = 400;
    }

    if(!error.name){
        error.name = "Bad Request";
    }
    else{
        error.name = error.name.replace(/([A-Z])/g, " $1");
        error.name = error.name.slice(1);
    }

    error.message = error.message || "The provided information is not correct to execute the given details."

    next(error);
}

// Error handling Middleware function for logging the error message
const errorLogger = (error, req, res, next) => {
    let errorStatus= error.status;
    let errorName = error.name;
    let functionReference = error.stack.split(/\n[\s\t]*/)[1].slice(3);
    let requestPath = req.originalUrl
    let requestMethod = req.method
    let message = error.message
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    errLogger.error(message, {
        errorStatus,
        errorName,
        functionReference,
        requestPath,
        requestMethod,
        ip
    })
    
    console.log(error);

    next(error) // calling next middleware
}
  
// Error handling Middleware function reads the error message 
// and sends back a response in JSON format
const errorResponder = (error, req, res, next) => {
    res.header("Content-Type", 'application/json')
        
    const status = error.status
    res.status(status).send(errorResponse(error.name , error.message));
}

// Fallback Middleware function for returning 
// 404 error for undefined paths
const invalidPathHandler = (req, res, next) => {
    res.status(404)
    res.send(errorResponse('Not Found', 'Invalid path, There is no route with the given path.'))
}

module.exports = {assignHTTPError, errorLogger, errorResponder, invalidPathHandler}
const appRoot = require('app-root-path');
const winston = require('winston');

/*Costum Formats for printing errors*/
const errorFormat = winston.format.printf(({ level, message, timestamp, meta }) => {
    console.log("Here" + message);
    return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
    });
});


/*Options for different error logs*/
const options = {
    error: {
      level: "error",
      filename: `${appRoot}/logs/errors.log`,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(winston.format.timestamp(),winston.format.splat(), winston.format.prettyPrint()),
    },
    file: {
      level: "info",
      filename: `${appRoot}/logs/info.log`,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
      ),
    },
    console: {
      level: "debug",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    },
  };


//Information Logger Using Winston//
const infoLogger = winston.createLogger({
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console(options.console),
    ],
    exitOnError: false, // do not exit on handled exceptions
});

infoLogger.stream = {
    write: function(message, encoding) {
      // use the 'info' log level so the output will be picked up by both
      // transports (file and console)
      infoLogger.info(message);
    },
};

//Error Logger Using Winston//
const errorLogger = winston.createLogger({
    transports: [
      new winston.transports.File(options.error)
    ],
    exitOnError: false, // do not exit on handled exceptions
});
  
module.exports = {infoLogger, errorLogger};
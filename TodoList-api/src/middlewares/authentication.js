const createHttpError = require('http-errors')
const {getPayload, getRefreshTokenPayload} = require('../utils/authentication.js')

const verifyLocalStrategy = (req, res, next) =>{
  if(!req.body.user.authStrategy == "local")
  {
    throw new createHttpError.MethodNotAllowed("Given functionality can only be used in Local Authentication Strategy");
  }
  
  next()
}

const verifyOauthStrategy = (req, res, next) => {
  if(!req.body.user.authStrategy == "local")
  {
    throw new createHttpError.MethodNotAllowed("Given functionality can only be used in Open Authentication Strategy");
  }
  
  next()
}

const verifyUser = (req,res,next)=>{
    // Check if req.body.user exists, create it if it doesn't
    if (!req.body.user) {
      req.body.user = {};
    }

    let payload = getPayload(req);
    
    if(payload){
        req.body.user.id = payload.id
        req.body.user.authStrategy = payload.authStrategy
    }
    else{
      throw new createHttpError.Unauthorized("User is not authentic");
    }
    next()
}

const verifyRefreshToken = (req, res, next)=>{
    // Check if req.body.user exists, create it if it doesn't
    if (!req.body.user) {
      req.body.user = {};
    }

    let payload = getRefreshTokenPayload(req);

    if(payload){
        req.body.user.id = payload.id
    }
    else{
      throw new createHttpError.Unauthorized("User is not authentic");
    }
    next()
}

module.exports = {verifyUser, verifyRefreshToken, verifyOauthStrategy, verifyLocalStrategy}
const {getPayload, getRefreshTokenPayload} = require('../utils/authentication.js')

const verifyUser = (req,res,next)=>{
    // Check if req.body.user exists, create it if it doesn't
    if (!req.body.user) {
      req.body.user = {};
    }

    let payload = getPayload(req);
    
    if(payload){
        req.body.user.id = payload.id
    }
    else{
      res.statusCode = 401;
      res.send({error: "Unauthorized", message:"User is not not authentic"})
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
      res.statusCode = 401;
      res.send({error: "Unauthorized", message:"User is not not authentic"})
    }
    next()
}

module.exports = {verifyUser, verifyRefreshToken}
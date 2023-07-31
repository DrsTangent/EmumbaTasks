const {getPayload, getRefreshToken, getRefreshTokenPayload} = require('../utils/authentication.js')

const verifyUser = (req,res,next)=>{
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
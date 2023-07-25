const {getPayload, getRefreshToken, getRefreshTokenPayload} = require('../utils/authentication.js')

const verifyUser = (req,res,next)=>{
    let payload = getPayload(req);
    if(payload){
        req.body.id = payload.id
    }
    else{
      res.statusCode = 401;
      res.send({error: "Unauthorized", message:"User is not not authentic"})
    }
    next()
}

const verifyRefreshToken = (req, res, next)=>{
    let payload = getRefreshTokenPayload(req);
    return res.send({"message": "OK"});
    if(payload){
        req.body.id = payload.id
    }
    else{
      res.statusCode = 401;
      res.send({error: "Unauthorized", message:"User is not not authentic"})
    }
    next()
}

module.exports = {verifyUser, verifyRefreshToken}
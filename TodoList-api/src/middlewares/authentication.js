const {getPayload} = require('../utils/authentication.js')

const verifyUser = (req,res,next)=>{
    let payload = getPayload(req);
    if(payload){
        req.id = payload._id
    }
    else{
      res.statusCode = 401;
      res.send({error: "Unauthorized", message:"User is not not authentic"})
    }
    next()
}

module.exports = {verifyUser}
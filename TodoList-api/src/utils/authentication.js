const jwt = require("jsonwebtoken");

const getToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: eval(process.env.SESSION_EXPIRY),
    })
}
  
const getRefreshToken = (user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
    })
    return refreshToken
}
  
const getPayload = (req)=>{
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        let jwtToken = req.headers.authorization.split(' ')[1];
        let payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
        return payload
      }
      return null;
}

module.exports = {getToken, getRefreshToken, getPayload}
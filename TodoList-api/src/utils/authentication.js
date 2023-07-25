const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");

const getToken = (payload) => {
    return jwt.sign(payload, process.env.SESSION_SECRET, {
      expiresIn: eval(process.env.SESSION_EXPIRY),
    })
}
  
const getRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
    })
    return refreshToken
}

const getPayload = (req)=>{
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        let jwtToken = req.headers.authorization.split(' ')[1];
        let payload = jwt.verify(jwtToken, process.env.SESSION_SECRET);
        return payload
      }
      return null;
}

const getRefreshTokenPayload = (req)=>{
  let refreshToken = req.signedCookies.refreshToken;
  if(refreshToken){
    let payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return payload
  }
  return null;
}


const getFBAccessToken = async (code)=> {
  console.log(code);
  const { data } = await axios({
    url: 'https://graph.facebook.com/v4.0/oauth/access_token',
    method: 'get',
    params: {
      client_id: process.env.FACEBOOK_ID,
      client_secret: process.env.FACEBOOK_SECRET,
      code,
      redirect_uri:'http://localhost:8080/users/facebookauth'
    },
  });
  
  return data.access_token;
};

async function getFacebookUserData(accesstoken) {
  const { data } = await axios({
    url: 'https://graph.facebook.com/me',
    method: 'get',
    params: {
      fields: ['id', 'email', 'first_name', 'last_name'].join(','),
      access_token: accesstoken,
    },
  });
  console.log(data); // { id, email, first_name, last_name }
  return data;
};

module.exports = {getToken, getRefreshToken, getPayload, getFBAccessToken, getFacebookUserData, getRefreshTokenPayload}
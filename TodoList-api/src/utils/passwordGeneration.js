const bcrypt = require('bcrypt');
const saltRound = 12;

generateHash = (plainPassword)=>{
    return bcrypt.hashSync(plainPassword, saltRound)
}

comparePassword = (plainPassword, hash)=>{
    return bcrypt.compareSync(plainPassword, hash);
}

module.exports = {generateHash, comparePassword};
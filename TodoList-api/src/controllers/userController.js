const db = require('../models/index');
const { comparePassword, generateHash } = require('../utils/passwordGeneration');
const User = db.users;
const Op = db.Sequelize.Op;


const createUser = async (req, res)=>{

    try{
        //Check if User Already Exists
        let user = await User.findOne({where: {
                email: {
                    [Op.like] : req.body.email
                }
        }}).catch(err => {
            res.status(500).send({
                message: "Internal Server error occured while fetching user information", err 
            })
        });

        if(user){
            res.status(409).send({
                message: "User already exists with the given email"
            });
        }


        req.body.hashedPassword = generateHash(req.body.password);

        console.log(req.body);

        user = await User.create(req.body, {fields: ['name', 'email', 'hashedPassword']}).catch(err => {
            res.status(500).send({
                message: "Internal Server error occured while fetching user information", err 
            })
        });

        res.status(200).send(user)


    }
    catch(err){
        res.status(400).send({
            message: "Bad Request", err
        });
    }
}

const getAllUsers = async (req, res) => {
    
}

module.exports = {createUser}
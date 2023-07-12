const db = require('../models/index');
const { comparePassword, generateHash } = require('../utils/passwordGeneration');
const User = db.users;
const Op = db.Sequelize.Op;


const signup = async (req, res)=>{

    try{
        //Check if User Already Exists
        let user = await User.findOne({where: {
                email: {
                    [Op.like] : req.body.email
                }
        }}).catch(error => {
            res.status(500).send({
                message: "Internal Server error occured while fetching user information", error 
            })
        });

        if(user){
            res.status(409).send({
                message: "User already exists with the given email"
            });
        }


        req.body.hashedPassword = generateHash(req.body.password);

        console.log(req.body);

        user = await User.create(req.body, {fields: ['name', 'email', 'hashedPassword']}).catch(error => {
            res.status(500).send({
                message: "Internal Server error occured while fetching user information", error 
            })
        });

        res.status(200).send(user)


    }
    catch(error){
        res.status(400).send({
            message: "Bad Request", error
        });
    }
}

const getAllUsers = async (req, res) => {
    let users = await User.findAll({attributes: {exclude: ['hashedPassword']}}).catch(
        (error)=> {
            res.status(500).send({
                message: "Internal Error Occured while fetching users", error
            })
        }
    );
    
    res.send(users);
}

const profile = async (req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.user.id
            }
        }).catch(error => {
            res.status(500).send({
                message: "Internal Server Error Occured while fetching users from databse.", error
            })
        });

        res.status(200).send(user);
    }
    catch(error){
        res.status(400).send({
            message: "Bad Request", error
        });
    }
}

const signin = async (req, res) => {
    try {
        //Check if User Already Exists or not
        let user = await User.findOne({where: {
            email: {
                [Op.like] : req.body.email
            }
        }}).catch(error => {
            res.status(500).send({
                message: "Internal Server error occured while fetching user information", error 
            })
        });
        if(!user){
            res.status(404).send({
                message: "User with given email doesn't exist"
        });
        }
        //Check if Password Matches//
        let isMatch = comparePassword(req.body.password, user.hashedPassword);
        if(!isMatch){
            res.status(409).send({
                message: "Authentication Error, Please provide correct credentials."
            });
        }
        
        user.hashedPassword = undefined;

        res.send(user);
    }
    catch(error)
    {
        res.status(400).send({
            message: "Bad Request", error
        });
    }
}



const getSpecificUsers = async(req, res) => {
    let users 
}

module.exports = {signin, signup, profile, getAllUsers}
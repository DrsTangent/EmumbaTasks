const db = require('../models/index');
const { comparePassword, generateHash } = require('../utils/passwordGeneration');
const User = db.users;
const Op = db.Sequelize.Op;
const emailValidator = require('deep-email-validator');
const {sendVerficationEmail} = require('../utils/emailVerfication');

const signup = async (req, res)=>{

    try{
        //Check if Email is valid or not
        // if(!(await emailValidator.validate(req.body.email)).valid){
        //     return res.status(400).send(
        //         {
        //             message: "Provided Email is not valid"
        //         }
        //     )
        // }

        //Check if User Already Exists
        let user = await User.findOne({where: {
                email: {
                    [Op.like] : req.body.email
                }
        }}).catch(error => {
            return res.status(500).send({
                message: "Internal Server error occured while fetching user information", error 
            })
        });

        if(user){
            return res.status(409).send({
                message: "User already exists with the given email"
            });
        }


        req.body.hashedPassword = generateHash(req.body.password);



        user = await User.create(req.body, {fields: ['name', 'email', 'hashedPassword']}).catch(error => {
            return res.status(500).send({
                message: "Internal Server error occured while fetching user information", error 
            })
        });




        return res.status(200).send(user)


    }
    catch(error){
        return res.status(400).send({
            message: "Bad Request", error
        });
    }
}

const sendVerificationEmail= async (req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.body.id
            }
        }).catch(error => {
            return res.status(500).send({
                message: "Internal Server Error Occured while fetching users from database.", error
            })
        });


        if(!user)
        {
            return res.status(404).send({
                message: "User with the given information doesn't exist"
            })
        }

        
        if(user.dataValues.verified){
            return res.status(400).send({
                message: "Bad Request, User is already verified", 
                verfied: user.dataValues.verified
            })
        }

        let emailResponse = null;

        try{
            emailResponse = await sendVerficationEmail(user.dataValues.email);
        }
        catch(error){
            return res.status(500).send({
                message: "Internal Server Error Occurred, Email Verfication was not sent to " + user.dataValues.email,
                error
            })
        }

        if(emailResponse.accepted.length == 0){
            return res.status(500).send({
                message: "Internal Server Error Occurred, Email Verfication was not sent to " + user.dataValues.email
            });
        }

        return res.status(200).send({
            message: "Account Verifcation Email has been send successfully"
        });
    }
    catch(error){
        return res.status(400).send({
            message: "Bad Request", error
        });
    }
}

const getAllUsers = async (req, res) => {
    let users = await User.findAll({attributes: {exclude: ['hashedPassword']}}).catch(
        (error)=> {
            return res.status(500).send({
                message: "Internal Error Occured while fetching users", error
            })
        }
    );
    
    return res.send(users);
}

const profile = async (req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.user.id
            }
        }).catch(error => {
            return res.status(500).send({
                message: "Internal Server Error Occured while fetching users from databse.", error
            })
        });

        if(!user)
        {
            return res.status(404).send({
                message: "User with the given information doesn't exist"
            })
        }

        return res.status(200).send(user);
    }
    catch(error){
        return res.status(400).send({
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
            return res.status(500).send({
                message: "Internal Server error occured while fetching user information", error 
            })
        });
        if(!user){
            return res.status(404).send({
                message: "User with given email doesn't exist"
        });
        }
        //Check if Password Matches//
        let isMatch = comparePassword(req.body.password, user.hashedPassword);
        if(!isMatch){
            return res.status(409).send({
                message: "Authentication Error, Please provide correct credentials."
            });
        }
        
        user.hashedPassword = undefined;

        return res.send(user);
    }
    catch(error)
    {
        return res.status(400).send({
            message: "Bad Request", error
        });
    }
}



const getSpecificUsers = async(req, res) => {
    let users 
}

module.exports = {signin, signup, profile, getAllUsers, sendVerificationEmail}
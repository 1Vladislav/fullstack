const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async function(req,res){
    const candidate = await User.findOne({email:req.body.email});
    if (candidate){
        //checking password of existanse user
        const passwordResult = bcrypt.compareSync(req.body.password,candidate.password);
        if (passwordResult){
            //generating token
            const token = jwt.sign({
                email:candidate.email,
                userId: candidate._id
            },keys.jwt,{
                expiresIn: 3600
            });
            res.status(200).json({
                token: `Bearer ${token}`
            });
        }
        else{
            //Passwords didn't match
            res.status(401).json({
                message:"Password doesn't match!"
            })
        }
    }
    else{
        //user not found
        res.status(404).json({
            message:"User with such email was not found!"
        })
    }
};
module.exports.register = async function (req,res) {
    //email, password
    const candidate = await User.findOne({email: req.body.email});
    if(candidate){
        //if found send an error
        res.status(409).json({
            message:"This email is already used, try another one!"
        })
    }
    else{
        //create user
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email:req.body.email,
            password: bcrypt.hashSync(password,salt)
        });
        try{
            await user.save();
            res.status(201).json(user);
        }catch(e){
            //Solve error
            errorHandler(res,e);
        }
    }
};
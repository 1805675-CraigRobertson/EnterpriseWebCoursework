const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

//User input validation middleware
const { check, validationResult } = require('express-validator');

//require database methods
let dbModel = require('../models/userdata.model');

//Login POST Route
router.post('/login', [
    check('username').notEmpty().escape().trim(), 
    check('password').notEmpty().escape().trim()
] , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ msg: errors.array()[0].msg + ' in ', param: errors.array()[0].param });
    }else{
        if(req.session.username){
            res.render('pages/dashboard')
        }else{
            const user = await dbModel.userExist(req);
            if(user != null){
                try{
                    if(await bcrypt.compare(req.body.password, user.password)){
                        req.session.loggedin = true;
                        req.session.username = user.username;
                        res.send({result:1, msg:'Success', param:''});
                    }else{
                        //password doesn't match
                        res.send({result:2, msg: 'Incorrect Password', param:''})
                    }
                }catch{
                    //database error
                    res.send({result:3, msg: 'Falied3', param:''})
                }
            }else{
                //user not found
                res.send({result:4, msg: 'User not Found!', param:''})
            }
        }
    }
});


//Register POST Route
router.post('/register', [
    check('username').notEmpty().escape().trim(), 
    check('email').notEmpty().isEmail().escape().trim(), 
    check('password').notEmpty().escape().trim()
] , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ msg: errors.array()[0].msg + ' in ', param: errors.array()[0].param });
    }else{
        const users = await dbModel.loadUsers();
        const user = await dbModel.userExist(req);
        if(user != null){
            res.send({result:2, msg: 'Username already Exists!', param:''})
        }else{
            try{
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                await users.insertOne({
                    id: Date.now().toString(),
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword
                });
                res.send({result:1, msg: 'Success', param:''})
            }catch{
                res.send({result:3, msg: 'Database Fail', param:''})
            }
        }
    }
})

//Users GET Route
router.get('/userDeets', async (req, res) =>{
    let userSecret = req.query.secret;
    let secretPass = process.env.SECRET;

    if(userSecret == secretPass){
        const users = await dbModel.loadUsers();
        res.send(await users.find({}).toArray())
    }else{
        res.send("Access Denied");
    }
})

//Export Router
module.exports = router;
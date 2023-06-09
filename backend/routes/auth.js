// importing model and dependecies
const router = require('express').Router();
const user = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await user.find();
        res.json(users)
    }
    catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// Registration
router.post("/register", async (req, res) => {

    //validate the user input
    const { error } = registerValidation(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0] });
    }

    //check if the email is already registered
    const emailExists = await user.findOne({ email: req.body.email });

    if (emailExists) {
        return res.status(400).json({ error: "Email already exists"});
    }

    //hash he password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    //create a user object and save in the DB
    const userObject = new user({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password
    });

    try {
        const savedUser = await userObject.save();
        res.json({ error: null, data: savedUser._id});
    }
    catch (error) {
        res.status(400).json({ error})
    }

});

//Login
router.post("/login", async (req, res) => {

    //validate user login info
    const { error } = loginValidation(req.body);

    //if login info is valid, find the user
    if (error) {
        return res.status(400).json({ error: error.details[0].message});
    }

    //throw error if email is wrong (user does not exist in DB)
    const userObject = await user.findOne({ email: req.body.email });

    if (!userObject) {
        return res.status(400).json({ error: "Email is wrong"});
    }

    //user exists - check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, userObject.password);
    
    //throw error if password is wrong
    if (!validPassword) {
        return res.status(400).json({ error: "Password is wrong"});
    }

    //create authentication token with username and id
    const token = jwt.sign(
        //payload
        {
            username: user.username,
            id: user._id
        },
        process.env.TOKEN_SECRET, 
        
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        },
    );

    //attach auth token to header
    res.header("Authorization", token).json({
        error: null,
        data: { 
            token,
            userID: userObject._id,
            username: userObject.username,
            email: userObject.email,
            userType: userObject.userLevel
        }
    });
});

module.exports = router;
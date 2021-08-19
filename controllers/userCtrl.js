const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const smtpTransporter=require('nodemailer-smtp-transport');
const crypto = require('crypto');

const smtpTransport = nodemailer.createTransport(smtpTransporter({
    service: 'Gmail',
    host:'smtp.gmail.com',
    auth: {
        user: keys.email,
        pass: keys.password
    },
    tls: {
        rejectUnauthorized: false
    }
}));


createScientist = (req, res) => {
    const errors = {};
    var keyOne=crypto.randomBytes(256).toString('hex').substr(100, 5);
    var keyTwo=crypto.randomBytes(256).toString('base64').substr(50, 5);
    var verificationKey = keyOne + keyTwo;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.message = 'Email already exists';
                return res.status(400).json(errors);
            }
            else {
                const user = new User({
                    name: req.body.name,
                    role: 'scientist',
                    email: req.body.email,
                    password: req.body.password,
                    verificationKey: verificationKey,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user
                            .save()
                            .then(() => {
                                var url = 'http://' + req.get('host')+'/api/users/confirmEmail'+'?key=' + verificationKey;
                                var mailOpt = {
                                    from: keys.email,
                                    to: user.email,
                                    subject: 'Complete Registration With Decode Cure',
                                    html : '<h2>Complete your registration by clicking the URL below</h2><br>' + url
                                };
                                smtpTransport.sendMail(mailOpt, (err, res) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        
                                        console.log('email has been sent.');
                                    }
                                    smtpTransport.close();
                                });
                                return res.status(200).json({
                                    success: true,
                                    message: `User successfully created. Registration email sent to ${user.email}. Open this email to finish signup.`,
                                });
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
}

login = (req, res) => {
    const errors = {};
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                errors.message = 'Incorrect email or password';
                return res.status(404).json(errors);
            } else if (!user.emailVerified) {
                errors.message = 'Unfinished email verification';
                return res.status(404).json(errors);
            }
            bcrypt.compare(req.body.password, user.password)
                .then(areSame => {
                    if (areSame) {
                        const payload = { id: user.id };

                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    name: user.name,
                                    role: user.role,
                                    token: 'Bearer ' + token
                                });
                            });
                    }
                    else {
                        errors.message = 'Incorrect email or password';
                        return res.status(400).json(errors);
                    }
                });
        });
}
confirmEmail = (req, res) => {
    User.updateOne({verificationKey:req.query.key}, {$set:{emailVerified:true}})
    .then(documents => {
        if(documents.n == 0){
            return res.status(400).json({
                success: false,
                message: 'verification key not found',
            });
        }
        else {
            var url = 'http://localhost:3000/Signup#';
            res.send(`<div style = {margin: 'auto'}>
                        <h1 >Decode Cure<h1>
                        <h2>Email Verified Successfully<h2>
                        <h3><a href=${url}> Click to go back to the homepage</a></h3>
                    </div>`);
        }
    })
    .catch(err => console.log(err));
}

getCurrentUser = (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email
    });
}


getUserOrders = async (req, res) => {
    var myOrders = [];
    await Order.find().sort('-createdAt').then(orders => {
        orders.forEach(order => {
                if (order.ordered.toString() === req.user.id){
                    myOrders.push(order);
                }
        });
    });
    if(myOrders.length) return res.json(myOrders);
    return res.json({
        success: false,
        message: 'No orders found'
    });
}


getUserById = (req, res) => {
    User.findById(req.params.id)
        .then(user => res.json({
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
        }))
        .catch(err => console.log(err));
}

getAllUsers = async (req, res) => {
    await User.find({}, (err, users) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!users.length) {
            return res
                .status(404)
                .json({ success: false, error: `User not found` })
        }
        return res.status(200).json({ success: true, data: users })
    }).catch(err => console.log(err))
}


module.exports = {
    createScientist,
    login,
    confirmEmail,
    getCurrentUser,
    getUserOrders,
    getUserById,
    getAllUsers
}
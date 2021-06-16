const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // for crypt password
const jwt = require('jsonwebtoken'); // for web token (auth)
const User = require('../models/user');

exports.signup = (req, res, next) => {
    const userEmail = req.body.email.toLowerCase().trim();
    User.find({email: userEmail})
        .then(userExists => {
            if (userExists.length >= 1) {
                return res.status(409).json({
                    message: "Email already exists"
                }) // 409 conflict
            } else {
                bcrypt.hash(req.body.password.trim(), 16, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            err: err
                        });
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: userEmail,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'User created'
                                });
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(500).json({
                                    error: error
                                });
                            });
                    }
                });
            }
        })
        .catch()
}

exports.login = (req, res, next) => {
    const userEmail = req.body.email.toLowerCase().trim();
    User.findOne({email: userEmail})
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            bcrypt.compare(req.body.password.trim(), user.password, (err, compareResult) => {
                if (!err && compareResult) {
                    const token = jwt.sign({
                            email: user.email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "24h"
                        }
                    );
                    return res.status(200).json({
                        message: 'Auth success',
                        token: token
                    });
                }

                return res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
        .catch(err => {
            res.status(500).json({
                message: 'User not found!',
            });
        });
}

exports.getUserList = (req, res, next) => {
    User.find()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                user: docs
            });
        })
        .catch();
}

exports.deleteUser = (req, res, next) => {
    const id = req.params.userId;
    User.findByIdAndDelete(id)
        .then(result => {
            if (!result) {
                res.status(404).json({
                    message: 'User not found!',
                });
            }

            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'User not found!',
            });
        });
}
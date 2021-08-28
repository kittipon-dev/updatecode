var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const User = require('../models/User')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/updatecode', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('auth-login');
    }
    next();
}

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
}

// LOGIN PAGE
router.post('/', ifLoggedin, async(req, res) => {
    console.log(req.body);
    try {
        const user = await User.find({ username: req.body.username })
        console.log(user);

        /*
        bcrypt.compare(req.body.email + req.body.password, user[0].password).then(compare_result => {
            if (compare_result === true) {
                req.session.isLoggedIn = true;
                req.session.user_id = user[0].user_id;
                res.redirect('/');
            } else {
                res.redirect('/');
            }
        }).catch(err => {
            if (err) throw err;
        });
        */
    } catch (error) {
        res.redirect('/');
    }

});





// LOGOUT
router.get('/logout', (req, res) => {
    //session destroy
    req.session = null;
    res.redirect('/');
});
// END OF LOGOUT


router.get('/register', function(req, res, next) {
    res.render('auth-register');
});



router.post('/register', async(req, res) => {
    const dbUser = await User.findOne({ email: req.body.email })
    try {
        if (dbUser == null) {
            bcrypt.hash(req.body.username + req.body.password, 12).then(async(hash_pass) => {
                    const user = new User({
                        email: req.body.email,
                        username: req.body.username,
                        password: hash_pass
                    })
                    await user.save();

                    res.redirect('/');
                })
                .catch(err => {

                })
        } else {
            res.render('auth-register', { e: "Have a Problem " })
        }
    } catch (error) {
        res.render('auth-register', { e: "Have a Problem " })
    }
});


router.get('/recoverpw', function(req, res, next) {
    res.render('auth-recoverpw');
});



/* GET home page. */
router.get('/', ifNotLoggedin, async function(req, res, next) {
    try {
        const dbCustomer = await Customer.findOne({ user_id: req.session.user_id })
        res.render('user_home', {
            user_id: req.session.user_id,
            branch: dbCustomer.branch
        });
    } catch (error) {
        res.render('user_home', {
            user_id: req.session.user_id,
            branch: 0
        });
    }
});



module.exports = router;
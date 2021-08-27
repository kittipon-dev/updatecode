var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/updatecode', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('login');
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
    try {
        const user = await User.find({ email: req.body.email })
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
    res.render('register');
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
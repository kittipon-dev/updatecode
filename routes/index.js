var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const multer = require('multer');
const dayjs = require('dayjs')

const User = require('../models/User')
const Project = require('../models/Project')
const Bin = require('../models/Bin')

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
    try {
        const user = await User.findOne({ username: req.body.username })
        bcrypt.compare(req.body.username + req.body.password, user.password).then(compare_result => {
            if (compare_result === true) {
                req.session.isLoggedIn = true;
                req.session.username = user.username;
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
        res.render('index')
            /*
            const dbCustomer = await Customer.findOne({ user_id: req.session.user_id })
            res.render('user_home', {
                user_id: req.session.user_id,
                branch: dbCustomer.branch
            });
            */
    } catch (error) {
        /*
        res.render('user_home', {
            user_id: req.session.user_id,
            branch: 0
        });
        */
    }

});




router.post('/newproject', ifNotLoggedin, async(req, res) => {
    const myobj = new Project({
        username: req.session.username,
        projectname: req.body.projectname
    });

    await myobj.save()

    res.redirect('/')
});



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/code_bin/')
    },
    filename: function(req, file, cb) {
        cb(null, `${new Date().getTime()}` + '.bin')
    }
})

const upload = multer({ storage: storage })
router.post('/uploadfilecode', upload.single('file'), async function(req, res, next) {

    const bin = new Bin({
        username: req.session.username,
        projectname: req.body.projectname,
        filename: req.file.filename,
        date: dayjs(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).format('YYYY-MM-DD H:m:s'),
        description: req.body.description,
    });

    await bin.save()

    res.redirect('/')
})


module.exports = router;
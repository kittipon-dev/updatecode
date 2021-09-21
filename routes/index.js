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
        return res.render('auth-login', { e: "" });
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
router.post('/', ifLoggedin, async (req, res) => {
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


router.get('/register', function (req, res, next) {
    res.render('auth-register', { e: "" });
});



router.post('/register', async (req, res) => {
    const dbUser = await User.findOne().or([{ email: req.body.email }, { username: req.body.username }])
    try {
        if (dbUser == null) {
            bcrypt.hash(req.body.username + req.body.password, 12).then(async (hash_pass) => {
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
            res.render('auth-register', { e: "That email or username is taken. Try another." })
        }
    } catch (error) {
        res.render('auth-register', { e: "Have a Problem " })
    }
});


router.get('/recoverpw', function (req, res, next) {
    //res.render('auth-recoverpw');
    res.redirect('/')
});



/* GET home page. */
router.get('/', ifNotLoggedin, async function (req, res, next) {
    try {
        const project = await Project.find({ username: req.session.username })
        const bin = await Bin.find({ username: req.session.username })
        const user = await User.findOne({ username: req.session.username })
        user.password = ""
        res.render('index', { project: project, bin: bin, user: user })
    } catch (error) {
        res.render('auth-login');
        /*
        res.render('user_home', {
            user_id: req.session.user_id,
            branch: 0
        });
        */
    }

});




router.post('/newproject', ifNotLoggedin, async (req, res) => {
    const myobj = new Project({
        username: req.session.username,
        projectname: req.body.projectname
    });

    await myobj.save()

    res.redirect('/')
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/code_bin/')
    },
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}` + '.bin')
    }
})


const upload = multer({ storage: storage })
router.post('/uploadfilecode', upload.single('file'), async function (req, res, next) {
    let _d = req.body.description.replace(/[\n\r]/g, "<br>")
    const bin = new Bin({
        username: req.session.username,
        project_id: req.body.project_id,
        vername: req.body.vername,
        filename: req.file.filename,
        date: dayjs(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).format('YYYY-MM-DD H:m:s'),
        description: _d,
        size: req.file.size
    });
    await bin.save()
    res.redirect('/')
})




router.get('/bin_use', ifNotLoggedin, async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.query.project,
        {
            usecode: req.query.bin,
            versionname: req.query.versionname,
            filename: req.query.filename,
            size: req.query.size
        })
    const bin = await Bin.findOneAndUpdate({
        project_id: req.query.project,
        status: "use"
    }, { status: "" })
    const binUse = await Bin.findByIdAndUpdate(req.query.bin, { status: "use" })
    res.redirect('/')
});

router.get('/bin_del', ifNotLoggedin, async (req, res) => {
    const project = await Project.findOneAndUpdate({ usecode: req.query.bin }, { usecode: "", filename: "", versionname: "", size: "" })
    const bin = await Bin.findByIdAndDelete(req.query.bin)
    res.redirect('/')
});







router.get('/get_version', async (req, res) => {
    try {
        const project = await Project.findById(req.query.token)
        if (!project.versionname) {
            project.versionname = ""
            project.filename = ""
            project.size = ""
        }
        res.send(`${project.versionname}~${project.filename}~${project.size}`)
    } catch (error) {
        res.end(0)
    }
});



module.exports = router;
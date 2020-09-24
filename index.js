const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport');
const ejs = require('ejs');
const cookieSession = require('cookie-session')
require('./passportSetting');
const dotenv = require('dotenv')
const path = require('path')
dotenv.config()
app.use(cors())

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Example protected and unprotected routes
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the user is logged in u can access his info in: req.user
app.get('/good', isLoggedIn, (req, res) => {
    res.render('googleHome' , {
        user:req.user
    })
})

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/facebook' , passport.authenticate('facebook'))

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/good');
    }
);
app.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/failed' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/good');
    }
);

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})
app.get('/login', (req, res) => {
    req.logout();
    res.render('login');
})

app.get('/' , (req , res) => {
    res.render('index')
})

app.listen(process.env.PORT, () => console.log(`listening on port`))
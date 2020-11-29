const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport-custom');
const port = 8000;

const CustomStrategy = passport.CustomStrategy;

// Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

passport.use('strategy-name', new CustomStrategy((req, done) => {
    
    done(null, user);
}))

// End points

app.post("/login", (req, res) => {
    console.log(req.body.username);
    console.log(req.body.password);
});

// Listener

const listener = app.listen(port, () => {
    console.log('Example app.');
});

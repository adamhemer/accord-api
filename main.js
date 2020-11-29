// Packages

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');

// Files
require('./models/User');
require('./config/passport');
require('./routes/auth');
require('dotenv').config();

// Setup
const app = express();
const port = 8000;

// Database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set('debug', true);
mongoose.promise = global.promise;

// Middleware
app.use(cors());
app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session())

app.use(require('./routes'));

app.use(session({
    secret: 'authentication-testing',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}));

// End points
app.use((req, res, err) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});

// Listener
const listener = app.listen(port, () => {
    console.log('Example app.');
});

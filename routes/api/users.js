
const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const User = mongoose.model('User');

checkUserTagPair = (name, tag) => {
    let tagUsed = false;
    User.find({ username: name }, (err, data) => {
        for (let i = 0; i < data.length; i++) {
            console.log(`${data[i].tag} : ${tag}`);
            if (data[i].tag == tag) {
                tagUsed = true;
            }
        }
    });
    return false;
}

// Create user
router.post('/', auth.optional, (req, res) => {
    const { body: { user } } = req;

    if (!user.username) return res.status(422).json({ errors: { username: 'is required'} });
    if (!user.password) return res.status(422).json({ errors: { password: 'is required' } });
    if (!user.email) return res.status(422).json({ errors: { email: 'is required' } });
    if (!user.tag) return res.status(422).json({ errors: { tag: 'is required' } });

    const finalUser = new User(user);

    finalUser.username = user.username;
    finalUser.email = user.email;

    if (checkUserTagPair(user.username, user.tag)) {
        console.log("Duplicate tag!");
    } else {
        console.log("not dup?");
    }
    
    finalUser.tag = user.tag;
    finalUser.setPassword(user.password);

    console.log(finalUser.salt);

    return finalUser.save().then(() => res.json({ user: finalUser.toAuthJSON() }));
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    const { body: { user } } = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({ user: user.toAuthJSON() });
        }

        return status(400).info;
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    return User.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            return res.json({ user: user.toAuthJSON() });
        });
});

module.exports = router;

const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const User = mongoose.model('User');

checkUserTagPair = async (name, tag) => {
    let tagUsed = false;
    await User.find({ username: name }, (err, data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].tag == tag) {
                tagUsed = true;
            }
        }
    });
    return tagUsed;
}

//POST Create user
router.post('/', auth.optional, async (req, res) => {
    const { body: { user } } = req;

    // Validate
    if (!user.username) return res.status(422).json({ errors: { username: 'is required'} });
    if (!user.password) return res.status(422).json({ errors: { password: 'is required' } });
    if (!user.email) return res.status(422).json({ errors: { email: 'is required' } });
    if (!user.tag) return res.status(422).json({ errors: { tag: 'is required' } });
    if (await checkUserTagPair(user.username, user.tag)) return res.status(422).json({ errors: { tag: 'is duplicate' } });

    // Create Database Entry
    const finalUser = new User(user);
    finalUser.username = user.username;
    finalUser.email = user.email;
    finalUser.tag = user.tag;
    finalUser.setPassword(user.password);

    return finalUser.save().then(() => res.json({ user: finalUser.toAuthJSON() }));
});

//POST Login route
router.post('/login', auth.optional, (req, res, next) => {
    const { body: { user } } = req;

    console.log(`Login request using credentials ${user.username} and ${user.password}`);

    if (!user.username) return res.status(422).json({ errors: { username: 'is required'} });
    if (!user.password) return res.status(422).json({ errors: { password: 'is required' } });

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if (err) return next(err);
        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({ user: user.toAuthJSON() });
        }
        console.log(info);
        return res.status(400).send(info);
    })(req, res, next);
});

//GET Current route (required, only authenticated users have access)
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

//GET Username from userId
router.get('/identify', auth.optional, (req, res, next) => {
    if (!req.query.id) return res.status(422).json({ errors: { id: 'is required' } });
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(422).json({ errors: { id: 'is invalid' } });

    return User.findById(req.query.id)
        .then((user) => {
            if (!user) {
                return res.status(400).json({ errors: { error: 'user does not exist' } });
            }
            return res.json({ user: { username: user.username } });
        });
});

module.exports = router;
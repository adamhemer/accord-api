
const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Channel = mongoose.model('Channel');

//POST Create channel
router.post('/', auth.required, async (req, res) => {
    const { body: { channel } } = req;
    const { payload: { id } } = req;

    console.log(id);
    console.log(channel);

    // Validate
    if (!channel.name) return res.status(422).json({ errors: { name: 'is required' } });
    await channelExists(channel.name).then(data => {
        if (data) {
            return res.status(422).json({ errors: { name: 'already exists' } });
        }
    });

    // Create Database Entry
    const newChannel = new Channel();
    newChannel.name = channel.name;
    newChannel.users = [ id ];

    if (channel.users) {
        channel.users.forEach(element => {
            newChannel.users.push(element);
        });
    }

    return newChannel.save().then(() => res.sendStatus(200));
});

// GET route returns channel id from name
router.get('/get/:name', auth.optional, async (req, res) => {
    Channel.findOne({ name: req.params['name'] }).then(data => {
        if (!data) {
            return res.status(422).json({ errors: { channel: 'does not exist' } });
        }
        return res.status(200).json({ id: data._id });
    })
});

async function channelExists(channelName) {
    return new Promise((resolve, reject) => {
        Channel.findOne({ name: channelName })
        .then((channel) => {
            if (!channel) {
                resolve(false);
            }
            resolve(true);
        });
    });
}

module.exports = router;
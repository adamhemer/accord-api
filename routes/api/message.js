
const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Message = mongoose.model('Message');
const Channel = mongoose.model('Channel');

//POST Create message
router.post('/', auth.required, async (req, res) => {
    const { body: { message } } = req;
    const { payload: { id } } = req;

    console.log(id);
    console.log(message);

    // Validate
    if (!message.content) return res.status(422).json({ errors: { content: 'is required' } });
    if (!message.channel) return res.status(422).json({ errors: { channel: 'is required' } });

    var channelData = await getChannelDetails(message.channel);
    if (!channelData) {
        return res.status(400).json({ errors: { channel: 'does not exist' } });
    }

    // Create Database Entry
    const newMessage = new Message();
    newMessage.content = message.content;
    newMessage.channelId = channelData._id;
    newMessage.userId = id;

    return newMessage.save().then(() => res.sendStatus(200));
});

router.get('/get', auth.required, async (req, res) => {
    const { payload: { id } } = req;
    await Message
        .find({ channelId: req.query.channel })
        .sort({ _id: -1 })                              // Sort by time descending
        .skip(Number.parseInt(req.query.skip) || 0)     // Skip x items
        .limit(Number.parseInt(req.query.limit) || 0)   // Select y items
        .exec((err, data) => {
            console.log(data);
            var list = { messages: [] };
            for (var i = 0; i < data.length; i++) {
                const item = data[i];
                list.messages.push({
                    _id: item._id,
                    userId: item.userId,
                    channelId: item.channelId,
                    content: item.content
                });
            }
            return res.status(200).json(list);
        });
});

async function getChannelDetails(channelName) {
    return new Promise((resolve, reject) => {
        Channel.findOne({ name: channelName })
        .then((channel) => {
            if (!channel) {
                resolve(null);
            }
            resolve(channel);
        });
    });
}


module.exports = router;
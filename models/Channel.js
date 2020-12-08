const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    users: [{ type: mongoose.Types.ObjectId }]
})

mongoose.model('Channel', channelSchema);
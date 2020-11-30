const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: { type: Number, required: true },
    channelId: { type: String, required: true }
})
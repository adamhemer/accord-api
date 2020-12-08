const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true },
    channelId: { type: String, required: true }
})

messageSchema.methods.toJSON = function () {
    return {
        _id: this._id,
        userId: this.userId,
        channelId: this.channelId,
        content: this.content
    };
}

mongoose.model('Message', messageSchema);
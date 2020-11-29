const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    tag: { type: Number, required: true },
    email: { type: String, required: true },
    salt: { type: String, required: true },
    hash: { type: String, required: true }
})
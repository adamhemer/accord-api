const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    tag: { type: Number, required: true },
    email: { type: String, required: true },
    salt: { type: String, required: true },
    hash: { type: String, required: true }
})

generateSalt = length => crypto
    .randomBytes(Math.ceil(length / 2)) // 2 Chars per byte: make equal or more to length
    .toString('hex')                    // Convert to characters
    .slice(0, length);                  // Slice off extra character if length is odd

generateHash = (pass, salt) => crypto
    .createHash("sha256")   // Use SHA256
    .update(pass)           // Add the password 
    .update(salt)           // Add the salt
    .digest('hex');         // Hash and output as hex

userSchema.methods.setPassword = function (password) {
    this.salt = generateSalt(16);
    this.hash = generateHash(password, this.salt);
}

userSchema.methods.validatePassword = function(password) {
    return generateHash(password, this.salt) === this.hash;
}

userSchema.methods.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

userSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        tag: this.tag,
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
    };
};

mongoose.model('User', userSchema);

/*
(async () => {
    await mongoose.model('User').deleteMany({}, ()=>{});
})();
*/

const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = mongoose.model('User');

passport.use(new LocalStrategy({
	usernameField: 'user[username]',
	passwordField: 'user[password]'
}, (username, password, done) => {
	console.log("Pinging database");
	User.findOne({ username: username }, (err, user) => {
		console.log("pinged");
		console.log(user);
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { errors: { username: 'Incorrect username.' }});
		}
		if (!user.validatePassword(password)) {
			return done(null, false, { errors: { password: 'Incorrect password.' }});
		}
		return done(null, user);
	}).catch(done);
}));

// Test
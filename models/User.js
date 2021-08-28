const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    username: String,
    password: String,
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
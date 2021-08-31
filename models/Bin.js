const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const binSchema = new Schema({
    project_id: String,
    username: String,
    vername: String,
    description: String,
    filename: String,
    date: String
});

const binModel = mongoose.model('bin', binSchema);

module.exports = binModel;
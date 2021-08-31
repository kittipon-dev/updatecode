const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    username: String,
    projectname: String,
    usecode: String
});

const projectModel = mongoose.model('project', projectSchema);

module.exports = projectModel;
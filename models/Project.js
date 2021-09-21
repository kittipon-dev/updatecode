const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    username: String,
    projectname: String,
    usecode: String,
    versionname: String,
    filename: String,
    size: String
});

const projectModel = mongoose.model('project', projectSchema);

module.exports = projectModel;
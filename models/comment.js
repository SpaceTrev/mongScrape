const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let CommentSchema = new Schema({
    body: {
        type: String
    }
});

const Comments = mongoose.model('Comment', CommentSchema);

module.exports = Comments;

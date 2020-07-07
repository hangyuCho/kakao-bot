const mongoose = require('mongoose')
var Schema = mongoose.Schema

var noticeSchema = new Schema({
    room: String,
    msg: String,
    sender: String,
    //isGroupChat: String,
    //replier: String,
    published_date: { type: Date, default: Date.now  }
})

module.exports = mongoose.model('noticeModel', noticeSchema, 'notice')
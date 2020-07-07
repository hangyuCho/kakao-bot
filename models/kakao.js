const mongoose = require('mongoose')
var Schema = mongoose.Schema

var kakaoSchema = new Schema({
    room: String,
    msg: String,
    sender: String,
    //isGroupChat: String,
    //replier: String,
    published_date: { type: Date, default: Date.now  }
})

module.exports = mongoose.model('kakaoModel', kakaoSchema, 'kakao_log')
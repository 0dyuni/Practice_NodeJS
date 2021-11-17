const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        //빈칸 x
        trim: true,
        //중복x
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    //계급 (관리자)
    role: {
        type: Number,
        default: 0
    },
    image: String,
    //유효성
    token: {
        type: String
    },
    //토큰기간
    tokeExp: {
        type: Number
    }
})

const User = mongoose.model('User', userSchema)

module.exports = {User}
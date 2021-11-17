const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    //빈칸 x
    trim: true,
    //중복x
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  //계급 (관리자)
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  //유효성
  token: {
    type: String,
  },
  //토큰기간
  tokeExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  // pssword가 변환 될 때만 bcrypt을 이용해서 암호화 해준다
  //라는 조건문
  if (user.isModified("password")) {
    // 비밀번호를 암호화 시킨다. (salt를 이용)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    // 비밀번호를 바꿀때가 아닐 때
    //다음으로 넘어가기 위해서 필요함.
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword === 암호화된 비밀번호가 같은지 확인
  //plainPassword를 암호화해서 같은이 비교한다.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch); //isMatch === true
  });
};

//토큰메소드
userSchema.methods.generateToken = function (cb) {
  var user = this;
  //jsonwebtoken을 이용해서 token생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  // user._id + 'secretToken' = token
  // ->
  // 'secretToken' -. user._id

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };

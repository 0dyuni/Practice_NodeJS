//express 모듈 가져오기
const express = require("express");
//새로운 express 만들기
const app = express();
//포트 설정
const port = 3000;
//const bodyParser = require('body-parser');
//cookie-parser 가져옴
const cookieParser = require("cookie-parser");
//dev,prod 환경 구분을 위해서 만든 key를 가져옴
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");
//application/x-www-form-urlencoded 이런 데이터는 분석해서 가져온다.
//app.use(bodyParser.urlencoded({extended: true}));

//application/json 분석해서 쓸 수 있게 가져온다.
app.use(express.json());
//application cookie-parser를 쓸 수 있게한다.
app.use(cookieParser());
//app.use(bodyParser.json());

//몽구스 연결, 에러표시,연결표시
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World 쿠쿠루삥뽕"));

// register 라우터
app.post("/api/users/register", (req, res) => {
  //회원가입 할 때 입력한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

// login 라우터
app.post("/api/users/login", (req, res) => {
  //데이터베이스에서 요청된 이메일 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "가입된 이메일이 없습니다.",
      });
    }
    //데이터베이스에서 요청한 이메일이 있다면 비밀번호가 같은지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 같지 않습니다.",
        });
      //비밀번호까지 같다면 token생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 쿠키에 저장한다.
        // 쿠키 외에 로컬스토리지등 다양한 방법들이 있다.
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

//auth 라우터
app.get("/api/users/auth", auth, (req, res) => {
  // middleware를 통과했다는 것은 Authentiction이 true
  // true한 것을 클라이언트에 정보를 전달
  res.status(200).json({
    _id: req.user._id,
    //role 0 ->일반유저, other -> 관리자
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

// logout 라우터
//데이터베이스에서 token을 지운다.
// 데이터베이스에서 token을 지우면 auth로 클라이언트와 토큰이 맞지 않으므로 로그인이 풀리는것을 이용한다.
app.get("/api/users/logout", auth, (req, res) => {
  // 로그아웃 하려는 user를 데이터베이스에서 찾아서
  //업데이트 시켜준다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

//express 모듈 가져오기
const express = require("express");
//새로운 express 만들기
const app = express();
//포트 설정
const port = 3000;
//const bodyParser = require('body-parser');
const { User } = require("./models/User");
//dev,prod 환경 구분을 위해서 만든 key를 가져옴
const config = require("./config/key");

//application/x-www-form-urlencoded 이런 데이터는 분석해서 가져온다.
//app.use(bodyParser.urlencoded({extended: true}));

//application/json 분석해서 쓸 수 있게 가져온다.
app.use(express.json());
//app.use(bodyParser.json());

//몽구스 연결, 에러표시,연결표시
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World 쿠쿠루삥뽕"));

// register 라우터
app.post("/register", (req, res) => {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

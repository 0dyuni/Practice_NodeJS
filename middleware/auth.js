const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 인증처리

  // 클라이언트 cookie에서 token을 가져온다.
  let token = req.cookie.x_auth;

  //토큰을 복호화(decoding)한후 user를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    // index.js 에서 token과 user를 사용할 수 있게
    req.token = token;
    req.user = user;
    // middleware에서 다음으로 넘어갈 수 있게
    next();
  });
};

module.exports = { auth };

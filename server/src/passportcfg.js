const CtrlData = require("./database");
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

  // hàm thể hiện các xác thực kiểm tra các thông số
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  // passReqToCallback: true
},  async function( email, password , done) {
        console.log("9: đang xác thực");
        const user = {};
        user.email = email;
        user.password = password;
        console.log("5: " + JSON.stringify(user));
        var usera = await CtrlData.authUser(user);
        console.log("6: " + JSON.stringify(usera.user));
        return done(null, usera.user);
    }
  ));
//hàm khởi tạo token cho passport sử dụng trong quá trình xác thực dây là đang sử dụng tên user để là token có thể thay bằng id như done(null, user.id), mã hóa
passport.serializeUser((usera, done) => {
  console.log("8: Chạy hàm khởi tạo token từ dữ liệu đăng nhập");
  console.log("9: " + usera);
  done(null, usera._id);
  });
  // hàm phá hủy khi token không sử dụng giải mã
passport.deserializeUser(async function(id, done) {
  console.log("7 : Chạy giải mã token, cookie để lấy thông tin đăng nhập");
    var user = await CtrlData.findByIdUser(id);
      done(null,user);
  });

var helper = {};
helper.ensureAuthenticated = (req,res,next)=>{
  console.log(req.url);
    if(req.isAuthenticated())
       {
           console.log("10 :Xác thực đúng thực hiện hàm");
           return next();
    } 
    // console.log(req.body);
    console.log("11: Xác thực Sai")
    return res.redirect('/');
}
module.exports = helper;

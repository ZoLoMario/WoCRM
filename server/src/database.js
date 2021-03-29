var mongoose = require('mongoose');

//Thiết lập một kết nối mongoose mặc định
var mongoDB = 'mongodb://127.0.0.1/wocrm';
mongoose.connect(mongoDB, {useNewUrlParser: true, useNewUrlParser: true,  useUnifiedTopology: true});
//Ép Mongoose sử dụng thư viện promise toàn cục
mongoose.Promise = global.Promise;
//Lấy kết nối mặc định
var db = mongoose.connection;

//Ràng buộc kết nối với sự kiện lỗi (để lấy ra thông báo khi có lỗi)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//Bắt sự kiện open
db.once('open', function() {
    console.log("Kết nối thành công !");
  });


  //quản lí người dùng
//Định nghĩa một schema


var CtrlData = {};
var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname:  String,
    lastname: String,
    email:   String,
    password: String,
});
userSchema.methods.showPass = function() {
    console.log(`Đã thêm nguoi dung "${this.lastname}" co password "${this.password}"`)
  }

var User = mongoose.model('User', userSchema);
var adminUser = {
    firstname:  'Dang',
    lastname: 'Khoi',
    email:   'wotech@wotech.vn',
    password: 'wotech',
}
CtrlData.createUser = async (user) => {
    const emailUser = await User.findOne({ email: user.email });
    if (emailUser) {
      return {error: "01"};
      console.log({error: "01"});
    } else {
      // Saving a New User
      var userCollections = new User(user);
      await userCollections.save(function (err, user) {
        if (err) return console.error(err);
        console.log({token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':user});
        return {token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':user};
        });
    }
};
CtrlData.createUser(adminUser);
CtrlData.authUser = async (user) => {
    const emailUser = await User.findOne({ email: user.email });
    if (!emailUser) {
        return {code: "01"};
        console.log({code: "01"});
      } else {
          console.log(emailUser.password);
          console.log(user.password); 
        if (emailUser.password == user.password) {
            console.log({token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':emailUser});
            return {code:"03",token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':emailUser};
          } else {
        // Saving a New User
            console.log({code: "02"});
            return {code: "02"};
          }
      }
}
//Quản lí Khách hàng
var cusSchema = new Schema({
    name:  String,
    birth: Date,
    address: String,
    address2: String,
    addressbrand: String,
    email:   String,
    phone: String,
    facebook: String,
    zalo: String,
});
var Cus = mongoose.model('Cus', cusSchema);
CtrlData.addCustomer = async (user) => {
    const emailUser = await User.findOne({ email: user.phone });
    console.log("truoc lúc trả vè");
    if (emailUser) {
      console.log({code: "04"});
      return {code: "04"};
    } else {
      // Saving a New User
      var cusCollections = new Cus(user);
      var cus = await cusCollections.save(function (err, user) {
        if (err) return console.error(err);
        console.log("đã chạy" + {code:"05",'user':user});
        });
      return {code:"05",'user':cus};
    }
};

module.exports = CtrlData;
var mongoose = require('mongoose');
//Thiết lập một kết nối mongoose mặc định
var mongoDB = 'mongodb://127.0.0.1/wocrm';
mongoose.connect(mongoDB, {useNewUrlParser: true, useNewUrlParser: true,  useUnifiedTopology: true, useFindAndModify: false });
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


var bcrypt = require("bcrypt");
var CtrlData = {};
//Quản lí người dùng
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
userSchema.methods.encryptPassword = function (password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function (password2) {
  return bcrypt.compareSync(password2, this.password);
};

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
      //console.log({error: "01"});
      return {error: "01"};
    } else {
      // Saving a New User
      var userCollections = new User(user);
      userCollections.password = userCollections.encryptPassword(user.password)
      await userCollections.save(function (err, user) {
        if (err) return console.error(err);
        console.log({token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':user});
        return {token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':user};
        });
    }
};


// hàm sinh passwword tự do
function generatePassword(passwordLength) {
  var numberChars = "0123456789";
  var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var lowerChars = "abcdefghijklmnopqrstuvwxyz";
  var allChars = numberChars + upperChars + lowerChars;
  var randPasswordArray = Array(passwordLength);
  randPasswordArray[0] = numberChars;
  randPasswordArray[1] = upperChars;
  randPasswordArray[2] = lowerChars;
  // Điền kín mảng
  randPasswordArray = randPasswordArray.fill(allChars, 3);
  return shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)] })).join('');
}
// hàm trộn kí tự trong mảng
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    // hàm random sử dụng sinh số từ 0 đến 1, hàm floor là làm tròn xuống
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}


var nodemailer = require('nodemailer');
CtrlData.findresetEmailuser = async (emaile) => {
  const emailUser = await User.findOne({ email: emaile });
  if (!emailUser) {
    return {code: "01"}; 
  } else {
    var passwwor = generatePassword(8);
    emailUser.password = emailUser.encryptPassword(passwwor);
    //emailUser.password = emailUser.encryptPassword('wotech')
    var userCollections = new User(emailUser);
    await userCollections.save(function (err, user) {
        if (err) return console.error(err);
        console.log({token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':user});
        return {token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':user};
        });

    // sử lí gửi mail
    //Cấu hình mail server
    var transporter = nodemailer.createTransport({
      host: 'mail.wotech.vn',
      port: '465',
      secure: true,
      tls:{
        rejectUnauthorized: false
      },
      auth:{
        user:'wotech@wotech.vn',
        pass: '*6Cs7!+2Ar&f'
      }
    });
    var content = '';
    content += `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Mật khẩu mới </h4>
                <tbody><tr><td><span style="color: red">`;
    content += passwwor;
    content +=  `</span></td></tr></tbody>
                <p style="color: black">Đây là mail test</p>
            </div>
        </div>
    `;
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: 'NQH-Test nodemailer',
        to: emailUser.email,
        subject: 'Test Nodemailer',
        text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
        html: content //Nội dung html mình đã tạo trên kia :))
    }

    const transporterm = await transporter.sendMail(mainOptions);
    console.log("19: " + transporterm)
    return transporterm;
  }
  };
CtrlData.createUser(adminUser);
CtrlData.authUser = async (user) => {
    const emailUser = await User.findOne({ email: user.email });
    if (!emailUser) {
        return {code: "01"}; 
      } else {
        if (emailUser.validPassword(user.password)) {
            //console.log({token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':emailUser});
            return {code:"03: Thành công",token:'FMfcgxwLsJwTzjhZplztwDjbBWtKqBKr','user':emailUser};
          } else {
        // Saving a New User
            return {code: "02: Sai pass"};
          }
      }
}
CtrlData.findByIdUser = async (id) => {
    const user = await User.findById(id).lean();
    return user;
}
//Quản lí Khách hàng
var cusSchema = new Schema({
    name:  String,
    birth: String,
    address: String,
    address2: String,
    addressbrand: String,
    email:   String,
    phone: String,
    facebook: String,
    zalo: String,
    note: String,
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
CtrlData.insertManyCus = async (listU) => {
  var listUS = await Cus.insertMany(listU).then(function(){
    console.log("Data inserted")  // Success
}).catch(function(error){
    console.log(error)      // Failure
});
return listUS;
};
CtrlData.getColcus = async () => {
  const cus = await Cus.find()
    .sort({  createdAt: "desc" })
    .lean();
  return cus;
};
CtrlData.findbyId = async (id) => {
  const cus = await Cus.findById(id).lean();
  return cus;
};
CtrlData.findByIdAndDelete = async (id) => {
  await Cus.findByIdAndDelete(id,(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Deleted : ", docs);
      console.log('xóa thành công');
    }
  });
};
CtrlData.findByIdAndUpdate = async (id,obj) => {
  var docc = await Cus.findByIdAndUpdate(id,obj,{new: true},(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Cập nhật thành công :");
    }
  });
  return docc;
};

//Quản lí Product
var prodSchema = new Schema({
  name:  String,
  code:  String,
  price: Number,
  numinventory: Number,
  hisprice: Array,
  hiseditor: Array,
  description: String,
  evaluate: Array,
  supplier: String,
  brand: String,
  note: String,
});
var Prod = mongoose.model('Prod', prodSchema);
CtrlData.addProduct = async(product)=> {
  const codeProd = await Prod.findOne({ code: product.code });
  if (codeProd) {
    console.log({code: "041"} + " đã tồn tạo sản phẩm");
    return {code: "041"};
  } else { 
    // Saving a New User
    var prodCollections = new Prod(product);
    var product = await prodCollections.save(function (err, produ) {
      if (err) return console.error(err);
      console.log("đã thêm sản phẩm" + {code:"051",'product':produ});
      });
    return {code:"051",'product':product};
  }

}
CtrlData.listProduct = async () => {
  const prod = await Prod.find()
    .sort({  createdAt: "desc" })
    .lean();
  return prod;
};
CtrlData.findbyidProd = async (id) => {
  const prod = await Prod.findById(id).lean();
  return prod;
};
CtrlData.findByIdAndDeletePro = async (id) => {
  await Prod.findByIdAndDelete(id,(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Deleted : ", docs);
      console.log('xóa thành công');
    }
  });
};
CtrlData.findByIdAndUpdatePro = async (id,obj) => {
  var docc = await Prod.findByIdAndUpdate(id,obj,{new: true},(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Cập nhật thành công :");
    }
  });
  return docc;
};
CtrlData.findPro = async (obj) => {
  var docc = await Prod.find(obj,{new: true},(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Cập nhật thành công :");
    }
  }).exec();
  return docc;
};
CtrlData.getliCus = async () => {
  var Customq = await CtrlData.getColcus();
  var lisCustom = Customq.map(obj => {
    let rObj = {}
    rObj.name = obj.name;
    rObj._id = obj._id;
    return rObj
 });
  return lisCustom;
};
CtrlData.getliProduct = async () => {
  var Customq = await CtrlData.listProduct();
  var lisCustom = Customq.map(obj => {
    let rObj = {}
    rObj.name = obj.name;
    rObj._id = obj._id;
    return rObj
 });
  return lisCustom;
};


//Quản lí Nhân viên
var staffSchema = new Schema({
  name:  String,
  birth: String,
  code: String,
  relationship: String,
  levelwork: String,
  socialnetwork:   String,
  listcustomer: String,
  authoritystaff: String,
  scancv: String,
  experience: String,
  leveledu: String,
  passhislogin: String,
  achievement: String,
  note: String,
  file:[{ type: Schema.Types.ObjectId, ref: 'file' }],
});
var Staff = mongoose.model('Staff', staffSchema);
CtrlData.addStaff = async(product)=> {
  const codeProd = await Staff.findOne({ code: product.code });
  if (codeProd) {
    console.log({code: "041"} + " đã tồn tạo sản phẩm");
    return {code: "041"};
  } else { 
    var prodCollections = new Staff(product);
    var product = await prodCollections.save(function (err, produ) {
      if (err) return console.error(err);
      console.log("đã thêm sản phẩm" + {code:"051",'product':produ});
      });
    return {code:"051",'product':product};
  }

};
CtrlData.listStaff = async () => {
  const prod = await Staff.find()
    .sort({  createdAt: "desc" })
    .lean();
  return prod;
};
CtrlData.findbyidStaff = async (id) => {
  const prod = await Staff.findById(id).lean().populate('file');
  return prod;
};
CtrlData.findByIdAndDeleteStaff = async (id) => {
  await Staff.findByIdAndDelete(id,(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Deleted : ", docs);
      console.log('xóa thành công');
    }
  });
};
CtrlData.findByIdAndUpdateStaff = async (id,obj) => {
  var docc = await Staff.findByIdAndUpdate(id,obj,{new: true},(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Cập nhật thành công :");
    }
  });
  return docc;
};
CtrlData.createID = () => {
  var id = new mongoose.mongo.ObjectId();
  return id;
};

//Quản lí file
var fileSchema = new Schema({
  fieldname:  String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename:   String,
  path: String,
  ishas: Schema.Types.ObjectId,
  size: String,
});
var file = mongoose.model('file', fileSchema);
CtrlData.GetFile = async(id) =>{
  const cus = await file.findById(id).lean();
  return cus;
}
CtrlData.addFiletoID = async (obj, id) => {
  var fileCollections = new file(obj);
  var filed = await fileCollections.save(async (err, filedu) => {
    if (err) return console.error(err);
    console.log("đã thêm file");
    const prod = await Staff.findById(id).lean().exec(
      async function (err, results) {
        if (err) return console.error(err)
        try {
            console.log(results) ;
            results.file.push(filedu._id);
            CtrlData.findByIdAndUpdateStaff(results._id, results);
            filedu.ishas = results._id;
            var docc = await file.findByIdAndUpdate(filedu._id,filedu,{new: true},(err, docs)=>{
              if (err){
                console.log(err)
              }
              else{
                console.log("Cập nhật thành công");
              }
            });           
        } catch (error) {
            console.log("errror getting results")
            console.log(error)
        } 
    });

  //console.log(docc);
    });
};
CtrlData.deleteFile = async (id) =>{
  await file.findByIdAndDelete(id,(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Deleted : ", docs);
      console.log('xóa thành công');
    }
  });
}

//Quản lí giao dịch
var tradeSchema = new Schema({
  baStaff: { type: Schema.Types.ObjectId, ref: 'Staff' },
  baCus: { type: Schema.Types.ObjectId, ref: 'Cus' },
  product: [{name:{ type: Schema.Types.ObjectId, ref: 'Prod' },sol:String, price: String, other: String}],
  docDoc: String,
  docStart: String,
  docEnd: String,
  docAddress: String,
  tranPrice: String,
  tranTime:   String,
  tranBrand: String,
  tranAddress: String,
  careChanel: String,
  careRecord: String,
  careCall: String,
  careCreate: String,
  careAdress: String
});
var Trade = mongoose.model('trade', tradeSchema);
CtrlData.listTrade = async () => {
  const prod = await Trade.find()
  .populate('baStaff')
  .populate('baCus')
  .populate('product.name')
    .sort({  createdAt: "desc" })
    .lean();
  return prod;
};
CtrlData.addTrade = async(tradea)=> {
  var tradeaCollections = new Trade(tradea);
    var tradeb = await tradeaCollections.save(function (err, produ) {
      if (err) return console.error(err);
      console.log("đã thêm sản phẩm" + {code:"051",'product':produ});
      });
    return {code:"051",'product':tradeb};

};
CtrlData.findbyidTrade = async (id) => {
  const prod = await Trade.findById(id)
  .populate('baStaff')
  .populate('baCus')
  .populate('product.name')
  .lean();
  return prod;
};
CtrlData.findByIdAndUpdateTrade = async (id,obj) => {
  var docc = await Trade.findByIdAndUpdate(id,obj,{new: true},(err, docs)=>{
    if (err){
      console.log(err)
    }
    else{
      console.log("Cập nhật thành công :");
    }
  });
  return docc;
};
module.exports = CtrlData;
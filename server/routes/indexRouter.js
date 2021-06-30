var express = require('express');
const CtrlData = require('../src/database');
const multer = require('multer');
var router = express.Router();
var fs = require("fs"),
    path = require('path'),
    converter = require('json-2-csv');
var xlsx = require('node-xlsx').default;
var passport = require('passport');

const helper = require('../src/passportcfg');
const { findEmailuser } = require('../src/database');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

//https://phocode.com/javascript/nodejs/nodejs-xac-thuc-nguoi-dung-voi-passportjs/

const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/json' ||
      file.mimetype === 'text/x-vcard'
    ) {
      console.log("Loại tập tin không đúng")
      cb(null, true);
    } else {
      cb(null, false);
    }
};
 
var upload = multer({ storage: storage, fileFilter:fileFilter});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home/signin', { message:'' });
});
router.post('/', passport.authenticate("local", {
  successRedirect: "/index.html",
  failureRedirect: "/"
}));
router.get('/signup', function(req, res, next) {
  res.render('home/signup', { message:'' });
});
router.post('/signup', async function(req, res, next) {
  if(req.body.firstname == '') {res.render('home/signup', { message:'Vui lòng điền họ' })}
  else if(req.body.lastname == '') {res.render('home/signup', { message:'Vui lòng điền tên' })}
  else if(req.body.email == '') {res.render('home/signup', { message:'Vui lòng nhập thư điện tử' })}
  else if(req.body.password == '') {res.render('home/signup', { message:'Vui lòng nhập mật khẩu' })}
  else if(req.body.repassword == '') {res.render('home/signup', { message:'Vui lòng nhập lại mật khẩu' })}
  else if(req.body.password != req.body.repassword) {
    res.render('home/signup', { message:'Hai mật khẩu không trùng khớp' })
  } else {
    delete req.body.repassword;
    var resk = await CtrlData.createUser(req.body);
    if(resk.error == "01") {
      res.render('home/signup', { message:'Thư điện tử đã tồn tại' })
    } else {
    res.redirect("/");
  }
  }
});
router.get('/forgot-password.html' , function(req, res, next) {
  res.render('home/forgotpass',  { message:'Chúng tôi hiểu nó, mọi thứ sẽ xảy ra. Chỉ cần nhập địa chỉ email của bạn dưới đây và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu của bạn!' });
});
router.post('/forgot-password.html' , async function(req, res, next) {
  if(req.body.email == '') {res.render('home/forgotpass', { message:'Vui lòng nhập thư điện tử' })}
  else {
  var result = await CtrlData.findresetEmailuser(req.body.email);
  
  if (result == undefined){
    console.log('không xác định');
  }
  else {if (result.code == '01'){
      res.render('home/forgotpass',  { message:'Không tìm thấy email' })
    } else {
      //Xử lí check mail để kiểm tra password
      console.log(result);
      res.render('home/signin',  { message:'Vui lòng check mail' });
    }}};
});
router.get('/logout' , function(req, res, next) {
  req.logout();
  res.redirect("/");
});
router.get('/index.html',helper.ensureAuthenticated , function(req, res, next) {
  res.render('home', {page: 'dasboard'});
});

//Khách hàng
router.get('/addcus.html',helper.ensureAuthenticated , function(req, res, next) {
  res.render('home', {page: 'cus/addcus'});
});
router.post('/addcus.html',helper.ensureAuthenticated , async (req,res,next)=>{
  console.log(req.body);
  var result = await CtrlData.addCustomer(req.body)
    console.log("123 " + result);
    if(result == undefined ){
       console.log("không có kết quả phùi hợp")
    }else{
    if(result.code == "05"){
      res.render('home', {page: 'listcustomer'});
    } else {
      res.render('index', { title: 'WoTech CRM' });   
  }
}
});
var listData=[];
router.get('/other.html',helper.ensureAuthenticated , function(req, res, next) {
  res.render('home', {page: 'cus/other'});
})
router.post('/other.html',helper.ensureAuthenticated ,  upload.single('myFile') , (req,res,next)=>{
  console.log(req.body);
  const file = req.file;
  console.log(req.file);
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
    }
    //Xử lí file excel
    if(file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
      const workSheetsFromFile = xlsx.parse(file.path);
      listData = workSheetsFromFile;
      //console.log(listData[0].name);
      console.log(workSheetsFromFile);
      //xác định sheet chứa dữ liệu
      var sheet;
      if(workSheetsFromFile.length == 0){
      for (var i = 0; i<(workSheetsFromFile.length -1 ); i++){
        console.log("do dai sheet cu " + workSheetsFromFile[i].data.length );
        console.log("do dai sheet moi " + workSheetsFromFile[(i+1)].data.length );
        if (workSheetsFromFile[i].data.length < workSheetsFromFile[(i+1)].data.length){
          console.log("cũ " + (i + 1));
          sheet =i + 1;
        }else{ 
          sheet = i ;
          console.log(i);
        }
      }} else{
        sheet = 0 ;
      }
                                                                                                                                                                                                                                                                                                                                                    
      //xác đinh dòng chứa dữ liệu
    res.render('home', {page:'file/excel', excelData : workSheetsFromFile, sheet : sheet });
   }
    //Xử lí file csv
    if(file.mimetype == "application/vnd.ms-excel"){
      var csv = fs.readFileSync(file.path).toString();
      const csvJSON = (string, headers, quoteChar = '"', delimiter = ',') => {
        const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gm');
        const match = string => [...string.matchAll(regex)].map(match => match[2])
          .filter((_, i, a) => i < a.length - 1); // cut off blank match at end
      
        const lines = string.split('\n');
        const heads = headers || match(lines.splice(0, 1)[0]);
      
        return lines.map(line => match(line).reduce((acc, cur, i) => ({
          ...acc,
          [heads[i] || `extra_${i}`]: (cur.length > 0) ? (Number(cur) || cur) : null
        }), {}));
      }
        var dJson = csvJSON(csv);
        console.log(dJson.length);
        CtrlData.insertManyCus(dJson);
      //xác điinh dòng chứa dữ liệu
      res.redirect('/listcustomer.html');
   }  

   //Xử lí file vcf
   if(file.mimetype == "text/x-vcard"){
    var listcustomer = [];
    var vcard = require('vcard-json');
    vcard.parseVcardFile(file.path, function(err, data){
      if(err) console.log('oops:'+ err);
      else {
        console.log(data[0]);
        for(var k=0; k < (data.length); k++){
          var ak = data[k];
          //console.log("tao là ak" + ak);
          if(ak == undefined ){
            console.log("không tồn tại");
          } else {
            if(ak.addr[0] == undefined){ ak.addr.push({state:""})};
            if(ak.addr[1] == undefined){ ak.addr.push({state:""})};
            if(ak.phone[0] == undefined){ ak.phone.push({value:""})};
            if(ak.email[0] == undefined){ ak.email.push({value:""})};
         listcustomer.push({ 
            name : ak.fullname,
            birth: ak.bday,
            address: ak.addr[0].state,
            address2: ak.addr[1].state,
            addressbrand: ak.addr[0].state,
            email: ak.email[0].value,
            phone:  ak.phone[0].value,
            facebook:  ak.phone[0].value,
            zalo:  ak.phone[0].value,
            note: ak.note
          });
        // console.log("mảng khách" + listcustomer.length);
         }}
         CtrlData.insertManyCus(listcustomer);
      }
    });
    //xác đinh dòng chứa dữ liệu
  //res.render('home', {page:'file/vcf', excelData : vcard });
  res.redirect('/listcustomer.html');
 }
//xử lí json
 if(file.mimetype == "application/json"){
  var listcustomer = JSON.parse(fs.readFileSync(file.path).toString());
  CtrlData.insertManyCus(listcustomer);
  res.redirect('/listcustomer.html');
};
});
router.post('/other/selecdata' ,helper.ensureAuthenticated , (req,res,next)=>{
  console.log(req.body);
  var listcustomer = [];
//  console.log(listData[req.body.sheet].data[req.body.header + 1][1]);
  for(var k=0; k < (listData[req.body.sheet].data.length - 1); k++){
    //console.log(Number(req.body.header) + Number(k));
    var ak = listData[req.body.sheet].data[Number(req.body.header) + Number(k)];
    //console.log("tao là ak" + ak);
    if(ak == undefined ){
      console.log("không tồn tại");
    } else {
   listcustomer.push({ 
      name : ak[req.body.a1],
      birth: ak[req.body.a2],
      address: ak[req.body.a4],
      address2: ak[req.body.a5],
      addressbrand: ak[req.body.a3],
      email: ak[req.body.a6],
      phone:  ak[req.body.a7],
      facebook:  ak[req.body.a8],
      zalo:  ak[req.body.a9]
    });
  // console.log("mảng khách" + listcustomer.length);
   }}
   //console.log(listcustomer);
   CtrlData.insertManyCus(listcustomer);
   res.redirect('/listcustomer.html');
   });
router.post('/export/customer/all',helper.ensureAuthenticated , async (req, res, next) => {
    console.log(req.body);
    var listCusstomer = await CtrlData.getColcus();
    if(req.body.type == "csv" ){
      var fileName = path.join(__dirname, '..','uploads/tmp/listCusstomer.csv');
      let json2csvCallback = function (err, csv) {
        if (err) throw err;
        fs.writeFileSync(fileName, csv ,{
          encoding: "utf8"
        });
    };
    
    converter.json2csv(listCusstomer, json2csvCallback, {
      prependHeader: false      // removes the generated header of "value1,value2,value3,value4" (in case you don't want it)
    });
    res.download(fileName);

    } else if (req.body.type == "xlsx") {
      let data = listCusstomer.map(doc => Object.values(doc));
      var buffer = xlsx.build([{name: "mySheetName", data: data}])
      var fileName = path.join(__dirname, '..','uploads/tmp/listCusstomer.xlsx');
      fs.writeFileSync(fileName,  buffer);
      res.download(fileName);

    } else if (req.body.type == "json") {
      let data = JSON.stringify(listCusstomer);
      var fileName = path.join(__dirname, '..','uploads/tmp/listCusstomer.json');
      fs.writeFileSync(fileName, data);
      res.download(fileName);
    } else if (req.body.type == "vcf") {
      
      var createVcard = function (obj) {
        var str_vcard = 'BEGIN:VCARD\r\nVERSION:3.0\r\n',
        str_end = '\r\nCATEGORIES:myContacts\r\nEND:VCARD\r\n';
            str_vcard += 'FN:'+obj.name+'\r\nN:'+obj.name+';;;;';
            if(obj.birth !== ''){ str_vcard += '\r\nBDAY;VALUE=text:'+obj.birth; }
            if(obj.nickname !== ''){ str_vcard += '\r\nNICKNAME:'+obj.nickname; }
            if(obj.gender !== ''){ str_vcard += '\r\nX-GENDER:'+obj.gender; }
            if(obj.address !== ''){ str_vcard += '\r\nADR;TYPE=HOME:;;'+obj.address+';;;;';}
            if(obj.address2 !== ''){ str_vcard += '\r\nADR;TYPE=WORK:;;'+obj.address2+';;;;';}
            if(obj.phone !== ''){ str_vcard += '\r\nTEL;TYPE=WORK:'+obj.phone; }
            if(obj.email !== ''){ str_vcard += '\r\nEMAIL;TYPE=INTERNET,WORK:'+obj.email; }
            if(obj.url !== ''){ str_vcard += '\r\nURL;TYPE=WORK:'+obj.url; }
            if(obj.company && obj.company.name){ str_vcard += '\r\nORG:'+obj.company.name; }
            if(obj.company && obj.company.title ){ str_vcard +='\r\nTITLE:'+obj.company.title; }
            if(obj.note !== ''){ str_vcard += '\r\nNOTE:'+obj.note; }
            if(obj.facebook !== 'https://www.facebook.com/'){ str_vcard += '\r\nitem1.URL:'+obj.facebook+'\r\nitem1.X-ABLabel:PROFILE'; }
            if(obj.zalo !== 'zalo.me'){str_vcard +='\r\nitem2.URL:'+ obj.zalo+'\r\nitem2.X-ABLabel:PROFILE';}
            if(obj.twitter !== 'https://www.twitter.com/'){ str_vcard +='\r\nitem3.URL:'+obj.twitter+'\r\nitem3.X-ABLabel:PROFILE'; }
            if(obj.instagram !== 'https://www.instagram.com/'){ str_vcard +='\r\nitem4.URL:'+ obj.instagram+'\r\nitem4.X-ABLabel:PROFILE'; }
            if(obj.linkedin !== 'https://www.linkedin.com/'){str_vcard +='\r\nitem5.URL:'+ obj.linkedin+'\r\nitem5.X-ABLabel:PROFILE';}
            str_vcard += str_end;
            return str_vcard;
          };
    var vCard = '';
      for(var i=0; i< listCusstomer.length; i++){
        vCard += createVcard(listCusstomer[i]);
      };
      var fileName = path.join(__dirname, '..','uploads/tmp/listCusstomer.vcf');
      fs.writeFileSync(fileName, new Buffer.from(vCard));
      res.download(fileName);

    } else {
      res.send('Vui lòng chọn loại file');
    };
  });
router.post("/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
    const cus = await CtrlData.findbyId(req.params.id);
    console.log(req.body);
    if(req.body.action == 'delete') {

      CtrlData.findByIdAndDelete(req.params.id);
      res.send("xóa thành công");
    }
    if(req.body.action == 'update') {
      delete req.body.action;
      var docs = await CtrlData.findByIdAndUpdate(req.params.id,req.body);
      console.log(docs);
      res.render('home', {page:'cus/custom', customM:docs});
    }
    if(req.body.action == 'autoupdate') {
      delete req.body.action;
      //tìm kiếm thông tin dựa vào sđt
      console.log(cus.phone);
      // nền tảng zalo
      




      var docs = await CtrlData.findByIdAndUpdate(req.params.id,req.body);
      console.log(docs);
      res.render('home', {page:'cus/custom', customM:docs});
    }



    //res.send("không xác định");
  });

router.get('/listcustomer.html', helper.ensureAuthenticated , async (req, res) => {
  var sheet = await CtrlData.getColcus();
  res.render('home', {page: 'cus/listcustomer', excelData : sheet});
});
router.get("/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  const cus = await CtrlData.findbyId(req.params.id);
  res.render('home', {page:'cus/custom', customM:cus});
});

// sản phẩm 
router.get('/product/add.php',helper.ensureAuthenticated , function(req, res, next) {
  res.render('home', {page: 'product/add',user:"1546"});
});
router.post('/product/add.php',helper.ensureAuthenticated , async (req, res, next) => {
  console.log(req.body);
  var result = await CtrlData.addProduct(req.body)
    console.log("123 " + result);
    if(result == undefined ){
       console.log("không có kết quả phùi hợp")
    }else{
    if(result.code == "051"){
      res.render('home', {page: 'product/add',user:"1546"});
    } else {
      res.render('index', { title: 'WoTech CRM' });   
  }
  }
});
router.get('/product/list.php',helper.ensureAuthenticated , async (req, res, next) => {
  var list = await CtrlData.listProduct();
  res.render('home', {page: 'product/list', excelData : list});
});
router.get("/product/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  const produ = await CtrlData.findbyidProd(req.params.id);
  res.render('home', {page:'product/editor', produ:produ,user:"1546"});
});
router.post("/product/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  const produ = await CtrlData.findbyidProd(req.params.id);
  if(req.body.action == 'delete') {

    CtrlData.findByIdAndDeletePro(req.params.id);
    console.log("xóa thành công");
    res.redirect("list.php");
  };
  if(req.body.action == 'update') {

    delete req.body.action;
    var docs = await CtrlData.findByIdAndUpdatePro(req.params.id,req.body);
    console.log(docs);
    res.render('home', {page:'product/editor',produ:docs,user:"1546"});
  }
  res.send('Đang thực hiện sai thao tác');
});
router.get("/product/filter.php",helper.ensureAuthenticated , async (req, res, next) => {
  res.render('home', {page:'product/filter'});
});
router.post("/product/filter.php",helper.ensureAuthenticated , async (req, res, next) => {
  console.log(req.body);
  delete req.body.search;
  if(req.body.code == ""){delete req.body.code};
  if(req.body.name == ""){delete req.body.name};
  if(req.body.brand == ""){delete req.body.brand};
  if(req.body.description == ""){delete req.body.description};
  if(req.body.price2 == ""){
    delete req.body.price2;
    delete req.body.price1;
  }{
    if(req.body.price1 = "<"){ req.body.price = { $lt: req.body.price2}};
    if(req.body.price1 = "<="){ req.body.price = { $lte: req.body.price2}};
    if(req.body.price1 = "="){ req.body.price = req.body.price2};
    if(req.body.price1 = ">"){ req.body.price = { $gt: req.body.price2}};
    if(req.body.price1 = ">="){ req.body.price = { $gte: req.body.price2}};
    delete req.body.price2;
    delete req.body.price1;
  };
  if(req.body.supplier == ""){delete req.body.supplier};
  console.log(req.body);
  var list = await CtrlData.findPro(req.body);
  res.render('home', {page: 'product/list', excelData : list});
});



// Xử lí nhân viên
router.get('/staff/add.php',helper.ensureAuthenticated , function(req, res, next) {
  res.render('home', {page: 'staff/add',user:"1546"});
});
router.post('/staff/add.php',helper.ensureAuthenticated , async (req,res,next)=>{
  console.log(req.body);
  var result = await CtrlData.addStaff(req.body)
    console.log("123 " + result);
    if(result == undefined ){
       console.log("không có kết quả phùi hợp")
    }else{
    if(result.code == "051"){
      res.render('home', {page: 'staff/add',user:"1546"});
    } else {
      res.render('index', { title: 'WoTech CRM' });   
  }
  }
});
router.get('/staff/list.php',helper.ensureAuthenticated , async (req, res, next) => {
  var list = await CtrlData.listStaff();
  res.render('home', {page: 'staff/list', excelData : list});
});
router.get("/staff/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  const produ = await CtrlData.findbyidStaff(req.params.id);
  res.render('home', {page:'staff/editor', produ:produ,user:"1546"});
});
router.post("/staff/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  const produ = await CtrlData.findbyidStaff(req.params.id);
  if(req.body.action == 'delete') {

    CtrlData.findByIdAndDeleteStaff(req.params.id);
    console.log("xóa thành công");
    res.redirect("list.php");
  };
  if(req.body.action == 'update') {

    delete req.body.action;
    var docs = await CtrlData.findByIdAndUpdateStaff(req.params.id,req.body);
    console.log(docs);
    res.render('home', {page:'staff/editor',produ:docs,user:"1546"});
  }
  res.send('Đang thực hiện sai thao tác');
});

// Quản lí file
var storageDoc = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

// const fileFilterDoc = (req, file, cb) => {
//     // if (
//     //   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//     //   file.mimetype === 'application/vnd.ms-excel' ||
//     //   file.mimetype === 'application/json' ||
//     //   file.mimetype === 'text/x-vcard'
//     // ) {
//     //   console.log("Loại tập tin không đúng")
//     //   cb(null, true);
//     // } else {
//     //   cb(null, false);
//     // }
// };
 
var uploadDoc = multer({ storage: storageDoc});
router.get('/staff/doc.php',helper.ensureAuthenticated , async (req, res, next) => {
  const produ = await CtrlData.findbyidStaff("60aa2ad0ecda4716fc7d8d8a");
  console.log(produ);
  res.render('home', {page:'staff/doc', produ:produ,user:"1546"});
});
router.post("/staff/doc/upload",helper.ensureAuthenticated , uploadDoc.single('file1') , async (req, res, next) => {
  console.log(req.body);
  const file = req.file;
  req.file.id = CtrlData.createID;
  console.log(req.file);
  CtrlData.addFiletoID(req.file,"60aa2ad0ecda4716fc7d8d8a")
  res.send("Upload thanh cong");
});
// router.post("/staff/doc/:id", async (req, res, next)=>{
//   var file = await CtrlData.GetFile(req.params.id);
//   const fileab = path.join(__dirname, '..',file.path);
//   console.log(fileab);
//   res.download(fileab,file.originalname);
// });
router.get("/staff/doc/:id",helper.ensureAuthenticated , async (req, res, next)=>{
  var file = await CtrlData.GetFile(req.params.id);
  const fileab = path.join(__dirname, '..',file.path);
  console.log(fileab);
  res.download(fileab,file.originalname);
});
router.post("/staff/doc/delete",helper.ensureAuthenticated , async (req, res, next) => {
  console.log(req.body);
  req.body.id.forEach(
    (elem) => {
      CtrlData.deleteFile(elem);
    }
  )
  res.send("Xóa thanh cong");
});
router.post("/staff/doc/info",helper.ensureAuthenticated , async (req, res, next) => {
  console.log(req.body);
  var info = [];
  await Promise.all(req.body.id.map(
    async (elem) => {
      var tmp  = await CtrlData.GetFile(elem);
      console.log(tmp);
     info.push(tmp);
    }
  ))
  console.log(info);
  res.send(info);
});

//API dùng cho các ứng dụng

router.post("/api/custom/list.html",helper.ensureAuthenticated , async (req, res, next )=>{
  res.send(await CtrlData.getliCus());
});
router.post("/api/staff/list.html",helper.ensureAuthenticated , async (req, res, next )=>{
  res.send(await CtrlData.listStaff());
});
router.post("/api/product/list.html",helper.ensureAuthenticated , async (req, res, next )=>{
  res.send(await CtrlData.getliProduct());
});

module.exports = router;
var express = require('express');
const CtrlData = require('../src/database');
const multer = require('multer');
var router = express.Router();
// const xlsxFile = require('read-excel-file/node');
var xlsx = require('node-xlsx').default;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
 
var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WoTech CRM' });
});
router.post('/', function(req, res, next) {
  console.log(req.body);
  var user = CtrlData.authUser(req.body).then((result) => {
      console.log(result);
      if(result.code == "03"){
        res.render('home', {page: 'dasboard'});
      } else {
        res.render('index', { title: 'WoTech CRM' });   
      }
    }
  );
});

router.post('/addcus.html', async (req,res,next)=>{
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

var listData;
router.post('/other.html',  upload.single('myFile') , (req,res,next)=>{
  console.log(req.body);
  const file = req.file;
  console.log(req.file);
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
    }
    if(file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
      const workSheetsFromFile = xlsx.parse(file.path);
      listData = workSheetsFromFile;
      console.log(listData[0].name);
    res.render('home', {page:'select', excelData : workSheetsFromFile});
   }
      
    }
  );
router.post('/other/selecdata' , (req,res,next)=>{
  console.log(req.body);
  var listcustomer = [];
  console.log(listData[0].data.length);
  for(var k=0; k < listData[req.body.sheet].data.length; k++){
   listcustomer.push({ 
      name : listData[req.body.sheet].data[req.body.header + k][a1],
      birth: listData[req.body.sheet].data[req.body.header + k][a2],
      address: listData[req.body.sheet].data[req.body.header + k][a4],
      address2: listData[req.body.sheet].data[req.body.header + k][a5],
     addressbrand: listData[req.body.sheet].data[req.body.header + k][a3],
    email: listData[req.body.sheet].data[req.body.header + k][a6],
    phone:  listData[req.body.sheet].data[req.body.header + k][a7],
    facebook:  listData[req.body.sheet].data[req.body.header + k][a8],
    zalo:  listData[req.body.sheet].data[req.body.header + k][a9]
    });
   console.log(listcustomer.length);
   }
   });


router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'WoTech CRM' });
});
router.get('/addcus.html', function(req, res, next) {
  res.render('home', {page: 'addcus'});
});
router.get('/listcustomer.html', function(req, res, next) {
  res.render('home', {page: 'listcustomer'});
});
router.get('/other.html', function(req, res, next) {
  res.render('home', {page: 'other'});
})
router.get('/forgot-password.html', function(req, res, next) {
  res.render('forgotpass', { title: 'WoTech CRM' });
});

module.exports = router;

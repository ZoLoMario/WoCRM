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
    //  xlsxFile(file.path).then((rows) => {
    //   console.log(rows);
    //   console.table(rows);
    // })
    res.send(workSheetsFromFile);
   }
      //res.render('home', {page: 'listcustomer'});
    }
  );
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

var express = require('express');
const CtrlData = require('../src/database');
var router = express.Router();

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

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'WoTech CRM' });
});
router.get('/addcus.html', function(req, res, next) {
  res.render('home', {page: 'addcus'});
});
router.get('/listcustomer.html', function(req, res, next) {
  res.render('home', {page: 'listcustomer'});
})
router.get('/forgot-password.html', function(req, res, next) {
  res.render('forgotpass', { title: 'WoTech CRM' });
});

module.exports = router;

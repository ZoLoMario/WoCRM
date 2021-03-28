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
        res.render('home', { title: 'WoTech CRM' });
      } else {
        res.render('index', { title: 'WoTech CRM' });   
      }
    }
  );
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'WoTech CRM' });
});
router.get('/forgot-password.html', function(req, res, next) {
  res.render('forgotpass', { title: 'WoTech CRM' });
});

module.exports = router;

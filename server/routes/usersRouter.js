var express = require('express');
var router = express.Router();
const helper = require('../src/passportcfg');
const CtrlData = require('../src/database');
/* GET users listing. */
router.get('/test', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/trade/add.php",helper.ensureAuthenticated , async (req, res, next) =>{
  res.render('home',{page:'trade/add'});
});
router.post("/trade/add.php",helper.ensureAuthenticated , async (req, res, next) =>{
  //console.log(req.body);
  
  var traOb = {};
  traOb.baStaff = req.body.addbaStaff;
  traOb.baCus = req.body.addbaCus;
  traOb.product = [];
  for (k in req.body) {
    if (req.body.hasOwnProperty(k)) {
        if (k.includes("pro")) {
          var prodb = {};
          prodb.name = req.body[k][0];
          prodb.sol = req.body[k][1];
          prodb.price = req.body[k][2];
          prodb.other = req.body[k][3];
          console.log(prodb); 
          traOb.product.push(prodb);
      };
    }};
  traOb.docDoc = req.body.adddocDoc;
  traOb.docStart = req.body.adddocStart;
  traOb.docEnd = req.body.adddocEnd;
  traOb.docAddress = req.body.adddocAddress;
  traOb.tranPrice = req.body.addtranPrice;
  traOb.tranTime = req.body.addtranTime;
  traOb.tranBrand = req.body.addtranBrand;
  traOb.tranAddress = req.body.addtranAddress;
  traOb.careChanel = req.body.addcareChanel;
  traOb.careRecord = req.body.addcareRecord;
  traOb.careCall = req.body.addcareCall;
  traOb.careCreate = req.body.addcareCreate;
  traOb.careAdress = req.body.addcareAdress;
  console.log(traOb);
  var result = await CtrlData.addTrade(traOb)
    console.log("123 " + result);
  res.render('home',{page:'trade/add'});
});
router.get("/trade/filter.php",helper.ensureAuthenticated , async (req, res, next) =>{
  var list = await CtrlData.listTrade();
  console.log(list[0]);
  res.render('home', {page: 'trade/list', excelData : list});
});
router.get("/trade/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  const produ = await CtrlData.findbyidTrade(req.params.id);
  console.log(produ);
  res.render('home', {page:'trade/editor', trade:produ,user:"1546"});
});
router.post("/trade/view/:id",helper.ensureAuthenticated , async (req, res, next) => {
  console.log(req.body);
  if(req.body.action = 'update'){
    const produ = await CtrlData.findbyidTrade(req.params.id);
  }
  res.render('home', {page:'trade/editor', trade:produ,user:"1546"});
})
module.exports = router;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//const MongoStore = require("connect-mongo");
require('./src/database');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Quản lí quá trình đăng nhập
var expressSession = require('express-session');
app.use(expressSession({secret: 'wotech.vn',
    resave: true,
    //store: MongoStore.create({ mongoUrl : 'mongodb://127.0.0.1/wocrm' }),
    cookie: {maxAge: 6000000},
    saveUninitialized: true
}))


var passport = require('passport');
//thêm vào cấu hình
require('./src/passportcfg');

console.log("chạy file App.JS");
app.use(passport.initialize());
app.use(passport.session());

var indexRouter = require('./routes/indexRouter');
var usersRouter = require('./routes/usersRouter');
app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
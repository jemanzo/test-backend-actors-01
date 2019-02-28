
const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const logger = require('morgan')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

if (!app.Router) { app.Router = express.Router }

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// LOGGER
// app.use(logger('dev'))
app.use(logger('common', {
  stream: require('fs').createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

app.init = async () => {
  if (app.ctrls) { return app.ctrls }
  app.ctrls = await require(path.join(__dirname, './controllers')).init()
  app.use('/', require('./routes/index.js'))
  app.use('/events', require('./routes/events.js'))
  app.use('/actors', require('./routes/actors.js'))
  app.use('/erase', require('./routes/eraseEvents.js'))
  // catch 404 and forward to error handler
  app.use(http404)
  app.use(errorHandler)
  return app
}

function http404 (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
}

function errorHandler (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
}

module.exports = app

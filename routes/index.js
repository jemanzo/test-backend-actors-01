
const path = require('path')
const { Router } = require(path.join(__dirname, '../app'))
const router = Router()

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

module.exports = router

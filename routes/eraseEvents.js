
const path = require('path')
const { ctrls, Router } = require(path.join(__dirname, '../app'))
const router = Router()

router.delete('/', function (req, res) {
  // 1. Erase All events:
  //    delete all events when /erase is called with DELETE
  //    HTTP response code should be 200
  ctrls.events.eraseAll()
  res.sendStatus(200)
})

module.exports = router

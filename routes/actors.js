
const path = require('path')
const { ctrls, Router } = require(path.join(__dirname, '../app'))
const router = Router()

const { cloneActor } = ctrls.actors

router.get('/', function (req, res) {
  // sorted by
  //   1. events-count
  //   2. last event timestamp
  //   3. login alphabetical order
  res.status(200).json(ctrls.actors
    .getActorsSortedByEventsCount()
    .map(cloneActor)
  )
})

router.get('/streak', function (req, res) {
  // sorted by total days of consecutive streaks
  res.status(200).json(ctrls.actors
    .getActorsSortedByStreak()
    .map(cloneActor)
  )
})

router.get('/:actorID', function (req, res) {
  const actor = ctrls.actors.getByID(req.params.actorID)
  actor
    ? res.status(200).json(cloneActor(actor))
    : res.sendStatus(404)
})

router.put('/', function (req, res) {
  const actorData = req.body
  if (typeof actorData === 'object') {
    if (Object.keys(actorData).length === 3 &&
        actorData.hasOwnProperty('id') &&
        actorData.hasOwnProperty('login') &&
        actorData.hasOwnProperty('avatar_url')) {
      if (ctrls.actors.updateActorAvatar(actorData)) {
        res.sendStatus(200); return // actor's avatar_url updated
      } else {
        res.sendStatus(404); return // actor not found
      }
    } else { res.sendStatus(400); return }
  }
  res.sendStatus(404)
})

module.exports = router

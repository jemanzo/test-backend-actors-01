
const path = require('path')
const { ctrls, Router } = require(path.join(__dirname, '../app'))
const router = Router()

const { cloneEvent } = ctrls.events

router.get('/', function (req, res) {
  // 3. Returning all the events:
  //    "GET" request at "/events"
  //    HTTP response should be 200
  //    sorted: ascending event.id
  res.status(200).json(ctrls.events
    .getEventsSortedByID()
    .map(cloneEvent)
  )
})

router.get('/actors/:actorID', function (req, res) {
  // 4. Returning all the events filtered by ActorID:
  //    "GET" request at "/events/actors/:actorID"
  //    status-code: 404 (actor does not exist)
  //    status-code: 200 (otherwise)
  //    sorted: ?
  const actorEvents = ctrls.actors.getActorEventsByID(req.params.actorID)
  if (!actorEvents) { res.sendStatus(404); return }
  res.status(200).json(actorEvents.map(cloneEvent))
})

router.post('/', function (req, res) {
  // 2. Adding new event:
  //   "POST" request at "/events"
  //   status-code: 400 (event with same id already exists)
  //   status-code: 201 (otherwise)
  if (!ctrls.events.setEvent(req.body, false)) {
    res.sendStatus(400)
  } else {
    res.sendStatus(201)
  }
})

module.exports = router


const path = require('path')
const ModelDB = require(path.join(__dirname, '../model'))
const ActorsController = require(path.join(__dirname, 'actors.js'))
const EventsController = require(path.join(__dirname, 'events.js'))

let ctrls = null

const init = async () => {
  if (ctrls) { return ctrls }
  const model = new ModelDB()
  await model.init()
  ctrls = {
    model,
    actors: new ActorsController(model),
    events: new EventsController(model)
  }
  return ctrls
}

module.exports = { init, ctrls }

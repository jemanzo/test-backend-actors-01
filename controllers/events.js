
// =================
// EVENTS CONTROLLER
// =================

class EventsController {
  constructor (model) {
    this.model = model
    this.cloneEvent = cloneEvent.bind(this)
  }
  getEvent (eventID) {
    return this.model.events.get(this.model.keyForID(eventID))
  }
  setEvent (eventData, overwrite) {
    if (overwrite !== true &&
        this.model.getEventByID(eventData.id)) {
      return false
    }
    return this.model.setEvent(eventData)
  }
  deleteEventByID (evtID) {
    return this.model.deleteEventByID(evtID)
  }
  getEventsSortedByID () {
    return this.model.getEventsSortedByID()
  }
  getEventsKeys () {
    const keys = []
    this.model.events.forEach((evt, key) => keys.push(key))
    return keys
  }
  eraseAll () {
    this.model.eraseAll()
  }
  cloneEvent (evt) {
    return {
      id: evt.id,
      type: evt.type,
      actor: this.model.getActorByID(evt.actor.id),
      repo: evt.repo,
      created_at: evt.created_at
    }
  }
}

function cloneEvent (evt) {
  const actor = this.model.getActorByID(evt.actor.id)
  return {
    id: evt.id,
    type: evt.type,
    actor: {
      id: actor.id,
      login: actor.login,
      avatar_url: actor.avatar_url
    },
    repo: evt.repo,
    created_at: evt.created_at
  }
}

module.exports = EventsController

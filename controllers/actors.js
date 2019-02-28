
// =================
// ACTORS CONTROLLER
// =================

class ActorsController {
  constructor (model) {
    this.model = model
  }
  getByID (actorID) {
    return this.model.getActorByID(actorID)
  }
  getActorEventsByID (actorID) {
    return this.model.getActorEventsByID(actorID)
  }
  updateActorAvatar (actorData) {
    // return false (not found)
    // return true (changed)
    const actor = this.model.getActorByID(actorData.id)
    if (!actor) { return false }
    actor.avatar_url = actorData.avatar_url
    actor.lastUpdate = Number(new Date())
    return true
  }
  getActors () {
    return this.model.getActors()
  }
  getActorsSortedByStreak () {
    return this.model.getActorsSortedByStreak()
  }
  getActorsSortedByEventsCount () {
    return this.model.getActorsSortedByEventsCount()
  }
  cloneActor (actor) {
    return {
      id: actor.id,
      login: actor.login,
      avatar_url: actor.avatar_url
    }
  }
}

module.exports = ActorsController

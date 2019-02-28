
const path = require('path')
const ActorsMAP = require(path.join(__dirname, 'actors.js'))
const EventsMAP = require(path.join(__dirname, 'events.js'))

let ldb = null
// uncomment the next 2 lines to enable persistent data
// const level = require('level')
// ldb = level('./leveldb')

class MainDB {
  constructor () {
    this.ldb = ldb
    this.actors = new ActorsMAP(this)
    this.events = new EventsMAP(this)
  }
  init () {
    return new Promise((resolve, reject) => {
      if (!this.ldb) { resolve() }
      this.ldb.createReadStream()
        .on('data', data => {
          console.log(data.key + ' event loaded')
          const evt = JSON.parse(data.value)
          this.setEvent(evt, true)
        })
        .on('error', reject)
        .on('close', () => {
          console.log('leveldb closed')
        })
        .on('end', () => {
          console.log('leveldb ended')
          resolve()
        })
    })
  }
  // ACTOR
  getOrAddActor (actor) {
    return this.get(actor)
  }
  getActorByKey (actorKey) {
    return this.actors.get(actorKey)
  }
  getActorByID (actorID) {
    return this.actors.get(this.actors.keyForID(actorID))
  }
  getActorEventsByID (actorID) {
    const actor = this.getActorByID(actorID)
    return actor ? actor._info.events : false
  }
  setActorFromEvent (evt) {
    let actor = this.getActorByID(evt.actor.id)
    const lastUpdate = Number(new Date(evt.created_at))
    if (!actor) {
      actor = this.actors.add({ ...evt.actor, lastUpdate })
    } else if (actor.lastUpdate < lastUpdate) {
      actor = this.actors.set({ ...evt.actor, lastUpdate })
    }
    this.updateActorInfos(actor)
  }
  updateActorInfos (actor) {
    const streaks = new Map()
    const evts = this.events.filterByActorID(actor.id)
    evts.forEach(evt => {
      const day = evt.created_at.substr(0, 10)
      const streak = streaks.get(day)
      if (streak) {
        streaks.set(day, streak + 1)
      } else { streaks.set(day, 1) }
    })
    const days = []
    const oneDayMS = 86400000 // 60 * 60 * 24 * 1000
    streaks.forEach((count, day) => days.push(day))
    days.sort() // ascending string sorting "2019-02-20"
    let dayBefore = 0
    let daysInSequence = 0
    let streaksInSequence = 0
    for (let i = 0; i < days.length; i++) {
      const today = Number(new Date(days[i]))
      // ignore if today === dayBefore
      if (today === (dayBefore + oneDayMS)) {
        // increment if today === dayBefore + oneDayMS
        daysInSequence++
      } else if (today > (dayBefore + oneDayMS)) {
        // clear if today !== dayBefore + oneDayMS
        daysInSequence = 1
      }
      if (daysInSequence > streaksInSequence) {
        streaksInSequence = daysInSequence
      }
      dayBefore = today
    }
    actor._info = {
      streaks,
      streaksInSequence,
      events: evts,
      mostRecentEvent: getActorMostRecentEventMS(evts)
    }
    return actor
  }
  // ACTORS
  getActors () {
    return this.actors.getAll()
  }
  getActorsSortedByStreak () {
    return this.getActors().sort(sortByStreaksInSequence)
  }
  getActorsSortedByEventsCount () {
    return this.getActors().sort(sortByEventsCount)
  }
  // EVENT
  getEventByKey (eventKey) {
    return this.events.get(eventKey)
  }
  getEventByID (eventID) {
    return this.events.get(this.events.keyForID(eventID))
  }
  async setEvent (evt, cacheOnly) {
    // save event data to levelDB
    // use "await this.ldb.put(..)" if you want to make sure it is saved before
    evt = this.events.add(evt)
    if (evt && this.ldb && cacheOnly !== true) {
      this.ldb.put(evt.key, JSON.stringify(evt))
    }
    // update Actor
    this.setActorFromEvent(evt)
    return evt
  }
  deleteEventByID (evtID) {
    const eventKey = this.events.keyForID(evtID)
    this.events.delele(eventKey)
    if (this.ldb) { this.ldb.del(eventKey) }
    return true
  }
  // EVENTS
  getEvents () {
    return this.events.getAll()
  }
  getEventsSortedByID () {
    return this.events.getAll().sort(sortByID)
  }
  eraseAll () {
    // if (this.ldb) { this.ldb.eraseAll() }
    this.clearMaps()
  }
  clearMaps () {
    this.actors = new ActorsMAP(this)
    this.events = new EventsMAP(this)
  }
}

function sortByID (a, b) {
  // ascending
  if (a.id < b.id) { return -1 }
  if (a.id > b.id) { return 1 }
  return 0
}

function sortByStreaksInSequence (a, b) {
  // descending streaksInSequence
  if (a._info.streaksInSequence > b._info.streaksInSequence) { return -1 }
  if (a._info.streaksInSequence < b._info.streaksInSequence) { return 1 }
  // descending mostRecentEvent
  if (a._info.mostRecentEvent > b._info.mostRecentEvent) { return -1 }
  if (a._info.mostRecentEvent < b._info.mostRecentEvent) { return 1 }
  return 0
}

function sortByEventsCount (a, b) {
  // descending eventsCount
  if (a._info.events.length > b._info.events.length) { return -1 }
  if (a._info.events.length < b._info.events.length) { return 1 }
  // descending mostRecentEvent
  if (a._info.mostRecentEvent > b._info.mostRecentEvent) { return -1 }
  if (a._info.mostRecentEvent < b._info.mostRecentEvent) { return 1 }
  // ascending alphabetical order of login
  if (a.login < b.login) { return -1 }
  if (a.login > b.login) { return 1 }
  return 0
}

function getActorMostRecentEventMS (actorEvents) {
  let mostRecent = 0
  actorEvents.forEach(evt => {
    const createdAt = Number(new Date(evt.created_at))
    if (createdAt > mostRecent) { mostRecent = createdAt }
  })
  return mostRecent
}

module.exports = MainDB

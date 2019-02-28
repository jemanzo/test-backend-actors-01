
const KEY_SIZE = 20

class EventsMap extends Map {
  constructor () {
    super()
    this.KEY_SIZE = KEY_SIZE
  }
  add (evt) {
    if (!evt.key) { this.prepare(evt) }
    if (this.get(evt.key)) { return false }
    return this.set(evt)
  }
  set (evt) {
    if (!evt.key) { this.prepare(evt) }
    super.set(evt.key, evt)
    return evt
  }
  prepare (evt) {
    this.setKey(evt)
  }
  keySize () {
    return KEY_SIZE
  }
  keyForID (evtID) {
    return String(evtID).padStart(KEY_SIZE, '0')
  }
  setKey (evt) {
    evt.key = this.keyForID(evt.id)
  }
  getAll () {
    const evts = []
    this.forEach(evt => evts.push(evt))
    return evts
  }
  filterByActorID (actorID) {
    const evts = []
    this.forEach(evt => {
      if (evt.actor.id === actorID) {
        evts.push(evt)
      }
    })
    return evts
  }
  clone (evt) {
    return { ...evt }
  }
}

module.exports = EventsMap

// -----------------------------------
// EVENT OBJECT SAMPLE
// -----------------------------------
// { id: 1319379787,
//   type: "PushEvent",
//   actor: {
//     id: 3466404,
//     login: "khunt",
//     avatar_url: "https://avatars.com/3466404" },
//   repo: {
//     id: 478747,
//     name: "ngriffin/rerum-aliquam-cum",
//     url: "https://github.com/ngriffin/rerum-aliquam-cum" },
//   created_at: "2013-04-17 04:13:31" }
// -----------------------------------

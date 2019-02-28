
const KEY_SIZE = 20

class ActorsMap extends Map {
  constructor () {
    super()
    this.KEY_SIZE = KEY_SIZE
  }
  add (actor) {
    if (!actor.key) { this.prepare(actor) }
    if (this.get(actor.key)) { return false }
    return this.set(actor)
  }
  set (actor) {
    if (!actor.key) { this.prepare(actor) }
    super.set(actor.key, actor)
    return actor
  }
  prepare (actor) {
    this.setKey(actor)
  }
  keySize () {
    return KEY_SIZE
  }
  keyForID (actorID) {
    return String(actorID).padStart(KEY_SIZE, '0')
  }
  setKey (actor) {
    actor.key = this.keyForID(actor.id)
  }
  getAll () {
    const actors = []
    this.forEach(actor => actors.push(actor))
    return actors
  }
  clone (actor) {
    return {
      id: actor.id,
      login: actor.login,
      avatar_url: actor.avatar_url
    }
  }
}

module.exports = ActorsMap

// --------------------------------------------
// ACTOR OBJECT SAMPLE
// --------------------------------------------
// {id: 3466404,
//  login: "khunt",
//  avatar_url: "https://avatars.com/3466404" }
// --------------------------------------------

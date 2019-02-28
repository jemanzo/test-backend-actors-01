/* global describe before it */

const fs = require('fs')
const path = require('path')
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiAsPromised = require('chai-as-promised')

let server = null
// const server = 'http://localhost:8000'

const app = require('../app')
const expect = chai.expect
const testFolder = './test/data'
const testCaseNames = fs.readFileSync(path.join(testFolder, 'description.txt'), 'utf8').toString().split('\n')

chai.use(chaiHttp)
chai.use(chaiAsPromised)

describe('git_test ', function () {
  this.timeout(120 * 1000)

  before(async () => {
    server = await app.init()
  })

  // Find, Filter and prepare testfiles
  const files = fs.readdirSync(testFolder)
    .toString().trim()
    .split(',').sort()
    .map(file => file.trim())
    .filter(file => file !== '')
    .filter(file => file !== 'description.txt')
    .filter(file => file[0] !== '.')
    // uncomment to test a specific file
    // .filter(file => file.match(/http0[1]\.json/))
    .map(file => path.join(testFolder, file))

  // Sync load and run all the tests of each prepared file
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    it(testCaseNames[i], done => {
      const evts = fs.readFileSync(file, 'utf8').toString().trim().split('\n')
      evts.reverse()
      const _next = (err) => {
        let evt = (evts.pop() || '').trim()
        if (err || evt === '' || evt[0] === '/') {
          done(err)
          return
        }
        evt = JSON.parse(evt)
        evt.next = _next
        switch (evt.request.method) {
          case 'GET':
            chai.request(server)
              .get(evt.request.url)
              .end(verifyResponse.bind(evt))
            break
          case 'POST':
            chai.request(server)
              .post(evt.request.url)
              .set(evt.request.headers)
              .send(evt.request.body)
              .end(verifyResponse.bind(evt))
            break
          case 'PUT':
            chai.request(server)
              .put(evt.request.url)
              .set(evt.request.headers)
              .send(evt.request.body)
              .end(verifyResponse.bind(evt))
            break
          case 'DELETE':
            chai.request(server)
              .delete(evt.request.url)
              .end(verifyResponse.bind(evt))
            break
        }
      }
      _next()
    })
  }
})

function verifyResponse (err, res) {
  const evt = this
  switch (evt.request.method) {
    case 'GET':
      expect(res.status).to.equal(evt.response.status_code)
      if (evt.response.status_code === 404) { break }
      const ar1 = res.body
      const ar2 = evt.response.body
      expect(ar2.length).to.equal(ar1.length)
      for (let k = 0; k < ar1.length; k++) {
        expect(ar2[k]).to.deep.equal(ar1[k])
      }
      break
    case 'POST':
      expect(res.status).to.equal(evt.response.status_code)
      break
    case 'PUT':
      expect(res.status).to.equal(evt.response.status_code)
      break
    case 'DELETE':
      expect(res.status).to.equal(evt.response.status_code)
      break
  }
  evt.next(err)
}

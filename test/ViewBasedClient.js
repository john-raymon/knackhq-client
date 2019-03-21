var mocha = require('mocha');
var chai = require('chai')
var assert = require('assert');
require('dotenv').config()
var { ViewBasedClient } = require('./../index.js');


describe('ViewBasedClient class', function () {
  this.timeout(3000);

  const app_id = process.env.APP_ID

  it('Should save our app id on the instance created.', () => {
    const knackClient = new ViewBasedClient({app_id})
    assert.equal(knackClient.app_id, app_id)
  })

  it('Should return an error if authenticating without email or password', () => {
    const knackClient = new ViewBasedClient({app_id})
    assert.equal(knackClient.auth(), 'Error: You must provide an email and password')
  })

  it('Should login an existing user in successfully if our credentials are valid ', (done) => {
    const knackClient = new ViewBasedClient({app_id});

    knackClient.auth(process.env.EMAIL, process.env.PASSWORD).then((res) => {
      console.log('~~~~ Our client should have a token ~~~~', knackClient.token)
      chai.expect(!!res.token).to.be.equal(true);
    }).then(done, done);
  })

  it('Testing method isAuthenticated() after a login ', (done) => {
    const knackClient = new ViewBasedClient({app_id, auth_scene: process.env.AUTH_SCENE, auth_view: process.env.AUTH_VIEW});

    knackClient.auth(process.env.EMAIL, process.env.PASSWORD).then(() => {
      // console.log('knackClient', knackClient)
      return knackClient.isAuthenticated().then((res) => {
        console.log('~~~~ The Response ~~~~', res)
        chai.expect(res.isAuth).to.be.equal(true);
      })
    }).then(done, done);
  })

  it('Testing method isAuthenticated() with a valid token in env', (done) => {
    const knackClient = new ViewBasedClient({app_id, auth_scene: process.env.AUTH_SCENE, auth_view: process.env.AUTH_VIEW, token: process.env.TOKEN});
    console.log('THE TOKEN', process.env.TOKEN)
    knackClient.isAuthenticated().then((res) => {
        console.log('~~~~ The Response ~~~~', res)
        chai.expect(res.isAuth).to.be.equal(true);
    }).then(done, done);
  })

  it('Testing method isAuthenticated() should fail without a user having been authenticated on the instance of the client ', (done) => {
    const knackClient = new ViewBasedClient({app_id, auth_scene: process.env.AUTH_SCENE, auth_view: process.env.AUTH_VIEW});
    knackClient.isAuthenticated().then((res) => {
      console.log('~~~~ The Response ~~~~', res)
      chai.expect(res.response.statusCode).to.be.oneOf([403, 401]);
    }).then(done, done);
  })

  it('Testing method getAllRecords(), should retreive all records in table in view with scene_445 and view_839', (done) => {
    const knackClient = new ViewBasedClient({app_id, auth_scene: process.env.AUTH_SCENE, auth_view: process.env.AUTH_VIEW, token: process.env.TOKEN});
    knackClient.getAllRecords("445", "839").then((res) => {
      console.log('the response looks like', res)
      assert(res.response.statusCode === 200)
    }).then(done, done)
  })
})

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');

const Location = require('../models/location');
const seedLocations = require('../db/seed/locations');

const expect = chai.expect;
chai.use(chaiHttp);

describe('BeachTides API - Locations', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(() => {
    return Location.insertMany(seedLocations);
  });
  afterEach(() => {
    return mongoose.connection.db.dropDatabase()
  })
  after(function () {
    return mongoose.connection.db.dropDatabase()
      .then(() => {
        return mongoose.disconnect();
      });
  });

  describe('GET /api/locations', function () {
    it('should return tidal data when zip_code is found within database', function () {     
      let zip_code = 1746;
      return Promise.all([
        Location.findOne({zip_code}),
        chai.request(app)
          .get(`/api/location/?location=${zip_code}`)
      ])
        .then(([data, res]) => {
          expect(data.city).to.equal('Holliston');
          expect(data.state).to.equal('MA');
          expect(data.zip_code).to.equal(1746);
          expect(data.latitude).to.equal(42.446396);
          expect(data.longitude).to.equal(-71.459405);
          
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.requestLat).to.equal(42.446396);
          expect(res.body.requestLon).to.equal(-71.459405);
          expect(res.body.responseLat).to.equal(42.3333);
          expect(res.body.responseLon).to.equal(-70.8333);
          expect(res.body.lat).to.equal(42.446396);
          expect(res.body.lon).to.equal(-71.459405);
          expect(res.body.city).to.equal('Holliston');
          expect(res.body.state).to.equal('MA');
        });
    });
    it('should return tidal data when city and state is provided', function () {
      let city = 'Holliston';
      let state = 'MA';
      let cityState = 'Holliston, Ma';
      return Promise.all([
        Location.findOne({city, state}),
        chai.request(app)
          .get(`/api/location/?location=${cityState}`)
      ])
        .then(([data, res]) => {
          expect(data).to.be.a('object');
          /*<---HELP WITH BELOW TEST... UNEXPECTED RESULTS   */
          // expect(data).to.include.keys('zip_code', 'city', 'state', 'lat', 'lon', '--v');
          expect(data.city).to.equal('Holliston');
          expect(data.state).to.equal('MA');
          expect(data.zip_code).to.equal(1746);
          expect(data.latitude).to.equal(42.446396);
          expect(data.longitude).to.equal(-71.459405);

          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.requestLat).to.equal(42.446396);
          expect(res.body.requestLon).to.equal(-71.459405);
          expect(res.body.responseLat).to.equal(42.3333);
          expect(res.body.responseLon).to.equal(-70.8333);
          expect(res.body.lat).to.equal(42.446396);
          expect(res.body.lon).to.equal(-71.459405);
          expect(res.body.city).to.equal('Holliston');
          expect(res.body.state).to.equal('MA');
        });
    });
    it('should return tidal data when city and state sent in all CAPS is provided', function () {
      let cityState = 'MARBLEHEAD, MA';
      return chai.request(app)
        .get(`/api/location/?location=${cityState}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.requestLat).to.equal(42.56142);
          expect(res.body.requestLon).to.equal(-70.770768);
          expect(res.body.responseLat).to.equal(42.6317);
          expect(res.body.responseLon).to.equal(-70.7767);
          expect(res.body.lat).to.equal(42.56142);
          expect(res.body.lon).to.equal(-70.770768);
          expect(res.body.city).to.equal('Marblehead');
          expect(res.body.state).to.equal('MA');
        });
    });
    it('should return tidal data when city and state sent in all lower case is provided', function () {
      let cityState = 'marblehead, ma';
      return chai.request(app)
        .get(`/api/location/?location=${cityState}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.requestLat).to.equal(42.56142);
          expect(res.body.requestLon).to.equal(-70.770768);
          expect(res.body.responseLat).to.equal(42.6317);
          expect(res.body.responseLon).to.equal(-70.7767);
          expect(res.body.lat).to.equal(42.56142);
          expect(res.body.lon).to.equal(-70.770768);
          expect(res.body.city).to.equal('Marblehead');
          expect(res.body.state).to.equal('MA');
        });
    });
    it('should return tidal data when location has mixed case', function () {
      let cityState = 'maRbLeheAd, mA';
      return chai.request(app)
        .get(`/api/location/?location=${cityState}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.requestLat).to.equal(42.56142);
          expect(res.body.requestLon).to.equal(-70.770768);
          expect(res.body.responseLat).to.equal(42.6317);
          expect(res.body.responseLon).to.equal(-70.7767);
          expect(res.body.lat).to.equal(42.56142);
          expect(res.body.lon).to.equal(-70.770768);
          expect(res.body.city).to.equal('Marblehead');
          expect(res.body.state).to.equal('MA');
        });
    });
    it('should return 400 error when city and state do not contain comma', function () {
      let cityState = 'Holliston Ma';
      return chai.request(app)
        .get(`/api/location/?location=${cityState}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');  
          expect(res.body.message).to.equal('City and State must be separated by a comma');
        });
    });
    it('should return error when zip_code searched is less than 3 digits', function () {
      let zip_code = 12;
      return chai
        .request(app) 
        .get(`/api/location/?location=${zip_code}`)      
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');  
          expect(res.body.message).to.equal('Zip-Code must have minimum 3 digits and maximum 5 digits');
        });    
    });
    it('should respond with a 404 does not exist when sending zip_code which is not in database', function () {
      let zip_code = 99999;
      return chai
        .request(app)
        .get(`/api/location/?location=${zip_code}`)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('The location was not found');
        });
    });
    it('should respond with a 404 does not exist when sending city and state that does not exist', function () {
      let badCityState = 'abcdef,abc';
      return chai
        .request(app)
        .get(`/api/location/?location=${badCityState}`)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('The location was not found');
        });
    });
  });
});

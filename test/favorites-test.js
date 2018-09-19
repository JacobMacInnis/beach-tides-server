'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const Favorite = require('../models/favorite');
const seedFavorites = require('../db/seed/favorites');
const User = require('../models/google-user');
const seedUsers = require('../db/seed/users');
const Location = require('../models/location');
const seedLocations = require('../db/seed/locations-test');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API - Folders', function () {
  const userId = '5ba244c3a7973a60aecce1de';
  const token = 'ya29.GlsdBlQ6Dg2BegB6UX1FoPw7vJPCHw7X2vNrTeo7Asoic2jnGpd6DrS-J2Ceuy3RhEJe7GkuQXTaZWYnchYIesYpRxPBtA1zRnS_uvThHMAd3zdX7qAFJqFRBXsO';
  
  const newUser = {
    '_id': '5ba244c3a7973a60aecce1de',
    'email': 'test.jacob.test.email@gmail.com',
    'googleProvider': {
      'id': '116443961616037391911',
      'token': 'ya29.GlsdBlQ6Dg2BegB6UX1FoPw7vJPCHw7X2vNrTeo7Asoic2jnGpd6DrS-J2Ceuy3RhEJe7GkuQXTaZWYnchYIesYpRxPBtA1zRnS_uvThHMAd3zdX7qAFJqFRBXsO'
    } 
  };

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function () {
    return Promise.all([
      User.create(newUser),
      Favorite.insertMany(seedFavorites),
      Location.insertMany(seedLocations)
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/favorites', function () {

    it.only('should return a list sorted by date added with the correct number of favorite locations', function () {
      
      return Promise.all([
        Favorite.find({ userId: userId })
          .sort({ createdAt: 'desc' }),
        chai.request(app).get('/api/favorites')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct fields and values', function () {
      const dbPromise = Favorite.find({ userId: userId });
      const apiPromise = chai.request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          // res.body.forEach(function (item, i) {
          //   // expect(item).to.be.a('object');
          //   expect(item).to.have.all.keys('_id', 'zip_code', 'createdAt', 'updatedAt', 'userId', 'city', 'state', 'lat', 'lon');
          expect(item._id).to.equal(data[i]._id);
          // expect(item.).to.equal(data[i].name);
          expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
          expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
        });
    });
  });

  
  describe('POST /api/favorites', function () {

    it('should create and return a new location when provided valid data', function () {
      const newItem = { 'zip_code': 1746 };
      let body;
      return chai.request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
            
          return Favorite.findById(body.id);
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
          expect(new Date(body.createdAt)).to.eql(data.createdAt);
          expect(new Date(body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing fields', function () {
      const newItem = { 'foo': 'bar' };
      return chai.request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });
    it('should return an error when given a duplicate name', function () {
      return Favorite.findOne()
        .then(data => {
          const newItem = { 'name': data.name };
          return chai.request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Folder name already exists');
        });
    });

  });

  describe('DELETE /api/favorites/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Favorite.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .delete(`/api/favorites/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Favorite.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
  });
});
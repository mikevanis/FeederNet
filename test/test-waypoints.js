process.env.NODE_ENV = 'test';

// Load modules required for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

// Load app and schemas
const server = require('../server/app');
const Bird = require('../server/models/bird');
const Feeder = require('../server/models/feeder');
const Waypoint = require('../server/models/waypoint');

// Setup chai
var should = chai.should();
chai.use(chaiHttp);

describe('Route - Waypoints', () => {

    beforeEach((done) => {
        // Create new bird
        var newBird = new Bird({
            rfid: 'bird-rfid-number',
            name: 'bird-name'
        });

        // Create new feeder
        var newFeeder = new Feeder({
            stub: 'feeder-stub',
            name: 'feeder-name',
            location: {
                latitude: '1.0000',
                longitude: '1.0000'
            },
            lastPing: 'never'
        });

        // Create new waypoint
        var newWaypoint = new Waypoint({
            datetime: 'test-date-time'
        });

        // Save data
        newBird.save((err, bird_data) => {
            newFeeder.save((err, feeder_data) => {
                newWaypoint.save((err, waypoint) => {
                    waypoint.addBird(bird_data.id).then((_waypoint) => {
                        _waypoint.addFeeder(feeder_data.id).then((__waypoint) => {
                            done();
                        });
                    });
                });
            });
        });
    });

    afterEach((done) => {
        for (let model of [Bird, Feeder, Waypoint]) {
            try {
                model.collection.drop();
            } catch (e) {
                if (e.code === 26) {
                    console.log('namespace %s not found', model.collection.name);
                } else {
                    throw e;
                }
            }
        }
        done();
    });

    it('should list all waypoints on /waypoints GET', (done) => {
        chai.request(server)
            .get('/api/waypoints')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('datetime');
                res.body[0].should.have.property('bird');
                res.body[0].should.have.property('feeder');
                res.body[0].datetime.should.equal('test-date-time');
                res.body[0].bird.should.be.a('object');
                res.body[0].bird.should.have.property('rfid');
                res.body[0].bird.should.have.property('name');
                res.body[0].feeder.should.be.a('object');
                res.body[0].feeder.should.have.property('stub');
                res.body[0].feeder.should.have.property('name');
                res.body[0].feeder.should.have.property('location');
                res.body[0].feeder.should.have.property('lastPing');
                done();
            });
    });

    it('should list a single waypoint on /waypoint/<id> GET', (done) => {
        chai.request(server)
            .get('/api/waypoints')
            .end((err, res) => {
                chai.request(server)
                    .get('/api/waypoint/' + res.body[0]._id)
                    .end((_err, _res) => {
                        _res.should.have.status(200);
                        _res.should.be.json;
                        _res.body.should.be.a('object');
                        _res.body.should.have.property('_id');
                        _res.body.should.have.property('datetime');
                        _res.body.should.have.property('bird');
                        _res.body.should.have.property('feeder');
                        _res.body.datetime.should.equal('test-date-time');
                        _res.body.bird.should.be.a('object');
                        _res.body.bird.should.have.property('rfid');
                        _res.body.bird.should.have.property('name');
                        _res.body.feeder.should.be.a('object');
                        _res.body.feeder.should.have.property('stub');
                        _res.body.feeder.should.have.property('name');
                        _res.body.feeder.should.have.property('location');
                        _res.body.feeder.should.have.property('lastPing');
                        done();
                    });
            });
    });

    it('should add a single waypoint on /waypoints GET', (done) => {
        var newBird = new Bird({
            rfid: 'post-test-rfid-number',
            name: 'post-test-name'
        });
        var newFeeder = new Feeder({
            stub: 'post-test-feeder-stub',
            name: 'post-test-feeder-name',
            location: {
                latitude: '1.0000',
                longitude: '1.0000'
            },
            lastPing: 'never'
        });
        // Save data
        newBird.save((err, bird_data) => {
            newFeeder.save((_err, feeder_data) => {
                chai.request(server)
                    .post('/api/waypoints')
                    .send({
                        'datetime': 'post-test-datetime',
                        'bird_id': bird_data.id,
                        'feeder_id': feeder_data.id
                    })
                    .end((error, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.should.have.property('SUCCESS');
                        res.body.SUCCESS.should.be.a('object');
                        res.body.SUCCESS.should.have.property('datetime');
                        res.body.SUCCESS.should.have.property('bird');
                        res.body.SUCCESS.should.have.property('feeder');
                        res.body.SUCCESS.should.have.property('_id');
                        done();
                    });
            });
        });
    });

    it('should delete a single waypoint on /waypoint/<id> DELETE', (done) => {
        chai.request(server)
            .get('/api/waypoints')
            .end((err, res) => {
                chai.request(server)
                    .delete('/api/waypoint/' + res.body[0]._id)
                    .end((_err, _res) => {
                        _res.should.have.status(200);
                        _res.should.be.json;
                        _res.body.should.be.a('object');
                        _res.body.should.have.property('REMOVED');
                        _res.body.REMOVED.should.be.a('object');
                        _res.body.REMOVED.should.have.property('datetime');
                        _res.body.REMOVED.should.have.property('bird');
                        _res.body.REMOVED.should.have.property('feeder');
                        _res.body.REMOVED.should.have.property('_id');
                        done();
                    });
            });
    });

});
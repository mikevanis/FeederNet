process.env.NODE_ENV = 'test';

// Load modules required for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

// Load app and schemas
const server = require('../server/app');
const Feeder = require('../server/models/feeder');

// Setup chai
var should = chai.should();
chai.use(chaiHttp);

describe('Feeders', () => {

    beforeEach((done) => {
        var newFeeder = new Feeder({
            stub: 'feeder-stub',
            name: 'feeder-name',
            location: {
                latitude: '1.0000',
                longitude: '1.0000'
            },
            lastPing: 'never'
        });

        newFeeder.save((err) => {
            done();
        });
    });

    afterEach((done) => {
        Feeder.collection.drop();
        done();
    });

    it('should list all feeders on /feeders GET', (done) => {
        chai.request(server)
            .get('/api/feeders')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('stub');
                res.body[0].should.have.property('name');
                res.body[0].should.have.property('location');
                res.body[0].should.have.property('lastPing');
                res.body[0].stub.should.equal('feeder-stub');
                res.body[0].name.should.equal('feeder-name');
                res.body[0].location.should.be.a('object');
                res.body[0].location.should.have.property('latitude');
                res.body[0].location.should.have.property('longitude');
                res.body[0].location.latitude.should.equal('1.0000');
                res.body[0].location.longitude.should.equal('1.0000');
                res.body[0].lastPing.should.equal('never');
                done();
            });
    });

    it('should list a single feeder on /feeder/<id> GET', (done) => {
        var newFeeder = new Feeder({
            stub: 'single-feeder-stub',
            name: 'single-feeder-name',
            location: {
                latitude: '1.0000',
                longitude: '1.0000'
            },
            lastPing: 'never'
        });
        newFeeder.save((err, data) => {
            chai.request(server)
                .get('/api/feeder/' + data.id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('_id');
                    res.body.should.have.property('stub');
                    res.body.should.have.property('name');
                    res.body.should.have.property('location');
                    res.body.should.have.property('lastPing');
                    res.body.stub.should.equal('single-feeder-stub');
                    res.body.name.should.equal('single-feeder-name');
                    res.body.location.should.be.a('object');
                    res.body.location.should.have.property('latitude');
                    res.body.location.should.have.property('longitude');
                    res.body.location.latitude.should.equal('1.0000');
                    res.body.location.longitude.should.equal('1.0000');
                    res.body.lastPing.should.equal('never');
                    done();
                });
        });
    });
});

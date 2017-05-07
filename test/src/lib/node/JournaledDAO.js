/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


describe('JournaledDAO', function() {

  var fs = require('fs');
  var filename = 'journal_file.txt';
  var eof = function(){};
  var inboundDAO;
  var cars;

  beforeEach(function(done) {

    foam.CLASS({
      package: 'test',
      name: 'Car',
      properties: [
        { name: 'id' },
        { name: 'color' }
      ]
    });

    cars = foam.dao.ArrayDAO.create();

    inboundDAO = foam.dao.JournaledDAO.create({
      delegate: cars,
      journal: foam.dao.NodeFileJournal.create({
        fd: fs.openSync(filename, 'w+') // write permisson
      })
    });

    for ( var i = 0; i < 50; ++i ) {
      inboundDAO.put(
        test.Car.create({
          id: i,
          color: 'color ' + i
        })
      );
    }

    done();
  });

  afterEach(function(done) {
    fs.unlink(filename, done);
  });

  it('should persist to file', function(done) {

    inboundDAO
    .select()
    .then(function() {
      fs.readFile(filename, 'utf8', function (err, data) {
       if (err) {
         return done(err);
       }
       var lines = data.split('\n').filter(Boolean);
       expect(lines.length).toBe(50);
       done();
     });
    });
  });

  it('should read from journaled file and populate arrayDao properly', function(done) {

    foam.dao.JournaledDAO.create({
      delegate: cars,
      journal: foam.dao.NodeFileJournal.create({
        fd: fs.openSync(filename, 'r+')
      })
    })
    .select({
      put: function(sub, data) {
        cars.put(data);
      },
      eof: eof
    })
    .then(function() {
      cars.select()
      .then(function(cars) {
        cars.a.forEach(function(car, i) {
          expect(car.id).toBe(i);
          expect(car.color).toBe('color ' + i);
        })
        done();
      });
    });

  });

});


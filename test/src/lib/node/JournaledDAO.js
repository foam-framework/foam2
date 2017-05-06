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
  var jDAO;

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
    for ( var i = 0; i < 50; ++i ) {
      cars.put(
        test.Car.create({
          id: i,
          color: "color " + i
        })
      );
    }

    jDAO = foam.dao.JournaledDAO.create({
      delegate: cars,
      journal: foam.dao.NodeFileJournal.create({
        fd: fs.openSync(filename, 'w+') // write permisson
      })
    });

    done();
  });

  afterEach(function(done) {
    fs.unlink(filename, done);
  });

  it('should persist to file', function(done) {

    cars.select({ put: function(sub, car) { jDAO.put(car)}, eof: function () {} })
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

});


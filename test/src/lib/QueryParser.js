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

describe('Query parser', function() {
  foam.CLASS({
    package: 'test.query',
    name: 'Item',
    properties: [
      {
        class: 'Int',
        name: 'id'
      },
      {
        class: 'String',
        name: 'name'
      },
      {
        class: 'Date',
        name: 'timestamp',
        shortName: 't',
        aliases: [ 'time', 'datestamp', 'd' ]
      },
      {
        class: 'Boolean',
        name: 'deleted',
        aliases: [ 'DEAD', 'trashed' ]
      },
      {
        class: 'String',
        name: 'optional'
      }
    ]
  });

  var Item = foam.lookup('test.query.Item');

  var dao = foam.dao.ArrayDAO.create({
    of: Item
  }, foam.__context__);
  dao.put(Item.create({
    id: 1,
    name: 'first item',
    timestamp: new Date(2011, 4, 18),
    deleted: true
  }, foam.__context__));
  dao.put(Item.create({
    id: 2,
    name: 'second item',
    timestamp: new Date(2013, 9, 2),
    optional: 'abc'
  }, foam.__context__));
  dao.put(Item.create({
    id: 3,
    name: 'third item',
    timestamp: new Date(2016, 3, 21)
  }, foam.__context__));
  dao.put(Item.create({
    id: 4,
    name: 'FOAM 1',
    timestamp: new Date(2011, 7, 2),
    deleted: true,
    optional: 'def'
  }, foam.__context__));
  dao.put(Item.create({
    id: 5,
    name: 'FOAM 2',
    timestamp: new Date(2016, 0, 26)
  }, foam.__context__));

  var parser = foam.parse.QueryParser.create({ of: 'test.query.Item' }, foam.__context__);

  var expectMatches = function(expected) {
    return function(actual) {
      // Check there were no extras.
      var seen = {};
      for ( var i = 0; i < actual.a.length; i++ ) {
        seen[actual.a[i].id] = true;
        expect(expected.indexOf(actual.a[i].id)).toBeGreaterThan(-1);
      }

      // And all expected values were covered.
      for ( var i = 0; i < expected.length; i++ ) {
        expect(seen[expected[i]]).toBe(true);
      }
    };
  };

  var testQuery = function(str, expected, opt_dao) {
    return function(done) {
      var q = parser.parseString(str);
      expect(q).toBeDefined();
      (opt_dao || dao)
          .where(q)
          .select()
          .then(expectMatches(expected))
          .then(done);
    };
  };

  describe('equals', function() {
    it('should find strings exactly', testQuery('name="second item"', [2]));
    it('should find numbers exactly', testQuery('id=4', [4]));
    it('should find dates with day resolution',
        testQuery('timestamp=2011-8-2', [4]));
    it('should find dates with month resolution',
        testQuery('timestamp=2011-8', [4]));
    it('should find dates with year resolution',
        testQuery('timestamp=2011', [1, 4]));
  });

  describe('colon', function() {
    it('should find substrings', testQuery('name:item', [1, 2, 3]));
    it('should find numbers', testQuery('id:4', [4]));
    it('should find dates with day resolution',
        testQuery('timestamp:2011-8-2', [4]));
    it('should find dates with month resolution',
        testQuery('timestamp:2011-8', [4]));
    it('should find dates with year resolution',
        testQuery('timestamp:2011', [1, 4]));
  });

  describe('less than (<)', function() {
    it('should work for numbers', testQuery('id<4', [1, 2, 3]));
    it('should work for strings', testQuery('name<s', [1, 4, 5]));
    it('should work for dates with year resolution',
        testQuery('timestamp<2014', [1, 2, 4]));
    it('should work for dates with month resolution',
        testQuery('timestamp<2011-06', [1]));
  });
  describe('less than (-before:)', function() {
    it('should work for numbers', testQuery('id-before:4', [1, 2, 3]));
    it('should work for strings', testQuery('name-before:s', [1, 4, 5]));
    it('should work for dates with year resolution',
        testQuery('timestamp-before:2014', [1, 2, 4]));
    it('should work for dates with month resolution',
        testQuery('timestamp-before:2011-06', [1]));
  });

  describe('less than or equal (<=)', function() {
    it('should work for numbers', testQuery('id<=4', [1, 2, 3, 4]));
    it('should work for strings',
        testQuery('name<="second item"', [1, 2, 4, 5]));
    it('should work for dates with year resolution',
        testQuery('timestamp<=2013', [1, 2, 4]));
    it('should work for dates with month resolution',
        testQuery('timestamp<=2011-08', [1, 4]));
  });

  describe('greater than (>)', function() {
    it('should work for numbers', testQuery('id>3', [4, 5]));
    it('should work for strings', testQuery('name>s', [2, 3]));
    it('should work for dates with year resolution',
        testQuery('timestamp>2013', [3, 5]));
    it('should work for dates with month resolution',
        testQuery('timestamp>2016-03', [3]));
  });
  describe('greater than (-after:)', function() {
    it('should work for numbers', testQuery('id-after:3', [4, 5]));
    it('should work for strings', testQuery('name-after:s', [2, 3]));
    it('should work for dates with year resolution',
        testQuery('timestamp-after:2013', [3, 5]));
    it('should work for dates with month resolution',
        testQuery('timestamp-after:2016-03', [3]));
  });

  describe('greater than or equal (>=)', function() {
    it('should work for numbers', testQuery('id>=4', [4, 5]));
    it('should work for strings',
        testQuery('name>="second item"', [2, 3]));
    it('should work for dates with year resolution',
        testQuery('timestamp>=2013', [2, 3, 5]));
    it('should work for dates with month resolution',
        testQuery('timestamp>=2016-04', [3]));
  });

  describe('has', function() {
    it('should find all entries with a value set',
        testQuery('has:optional', [2, 4]));
    it('should negate correctly',
        testQuery('-has:optional', [1, 3, 5]));
  });

  describe('is', function() {
    it('should work for Boolean properties',
        testQuery('is:deleted', [1, 4]));
    it('should negate correctly',
        testQuery('-is:deleted', [2, 3, 5]));
  });

  describe('bare number is treated as ID', function() {
    it('should match by ID', testQuery('3', [3]));
  });
  // TODO(braden): Test keyword support.

  describe('AND', function() {
    it('should work when spelled "AND"',
        testQuery('timestamp:2011 AND has:optional', [4]));
    it('should work when spelled "and"',
        testQuery('timestamp:2011 and has:optional', [4]));
    it('should work when spelled " "',
        testQuery('timestamp:2011 has:optional', [4]));
  });

  describe('OR', function() {
    it('should work when spelled "OR"',
        testQuery('timestamp:2011 OR has:optional', [1, 2, 4]));
    it('should work when spelled "or"',
        testQuery('timestamp:2011 or has:optional', [1, 2, 4]));
    it('should work when spelled "|"',
        testQuery('timestamp:2011 | has:optional', [1, 2, 4]));
  });

  describe('NOT', function() {
    it('should work on parenthesized expressions',
        testQuery('-(timestamp:2011 | has:optional)', [3, 5]));
    it('should work when spelled "-"',
        testQuery('-(timestamp:2011 | has:optional)', [3, 5]));
    it('should work when spelled "NOT"',
        testQuery('NOT (timestamp:2011 | has:optional)', [3, 5]));
    it('should work when spelled "not"',
        testQuery('not (timestamp:2011 | has:optional)', [3, 5]));
  });

  // This one needs to go last because it mangles the DAO.
  describe('relative dates', function() {
    var dao2 = foam.dao.ArrayDAO.create({
      of: Item
    }, foam.__context__);
    dao.select(dao2);

    var todayItem = Item.create({
      id: 6,
      name: 'today item',
      optional: true,
      timestamp: new Date()
    }, foam.__context__);
    dao2.put(todayItem);

    var d = new Date();
    d.setDate(d.getDate() - 1);
    var yesterdayItem = Item.create({
      id: 7,
      name: 'yesterday item',
      timestamp: d
    }, foam.__context__);
    dao2.put(yesterdayItem);

    it('should recognize the keyword "today"',
        testQuery('timestamp>=today', [6], dao2));
    it('should recognize the keyword "today"',
        testQuery('timestamp<today', [1, 2, 3, 4, 5, 7], dao2));
    it('should handle relative day counts with "-N"',
        testQuery('timestamp>today-2', [6, 7], dao2));
    it('should handle relative day counts with "-N"',
        testQuery('timestamp>today-1', [6], dao2));
    it('should handle relative day counts with "-N"',
        testQuery('timestamp>=today-1', [6, 7], dao2));
  });

  describe('date ranges', function() {
    it('should handle date ranges',
        testQuery('timestamp:2011..2013', [1, 2, 4]));
    it('should handle date ranges',
        testQuery('timestamp:2011-01..2013-12', [1, 2, 4]));
  });

  describe('field names', function() {
    it('should ignore case in field names',
        testQuery('TIMESTAMP:2011', [1, 4]));
    it('should respect short names, if provided', testQuery('t:2011', [1, 4]));
    it('should ignore case in short names, too', testQuery('T:2011', [1, 4]));

    describe('have aliases', function() {
      it('should follow aliases 1', testQuery('datestamp:2011', [1, 4]));
      it('should follow aliases 2', testQuery('time:2011', [1, 4]));
      it('should follow aliases 3', testQuery('t:2011', [1, 4]));
      it('should ignore case in aliases 1', testQuery('D:2011', [1, 4]));
      it('should ignore case in aliases 2', testQuery('is:dead', [1, 4]));
    });
  });
});

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

describe('MLang', function() {
  var dao;
  beforeEach(function() {
    foam.CLASS({
      package: 'test.mlang',
      name: 'Person',

      properties: [
        {
          class: 'Long',
          name: 'id',
        },
        {
          class: 'String',
          name: 'name',
        },
        {
          class: 'Date',
          name: 'birthday',
        },
        {
          class: 'Long',
          name: 'age'
        },
        {
          class: 'String',
          name: 'guitar'
        },
        {
          class: 'Boolean',
          name: 'deceased',
          value: false,
        },
        {
          class: 'String',
          name: 'neverSet',
        },
        {
          name: 'someArray',
        }
      ],
    });

    dao = foam.dao.ArrayDAO.create({ array: [] });
    dao.put(test.mlang.Person.create({
      id: 1,
      name: 'Jimi Hendrix',
      deceased: true,
      birthday: '1942-11-27',
      guitar: 'Fender',
      age: 27
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 2,
      name: 'Carlos Santana',
      birthday: '1947-07-20',
      guitar: 'PRS',
      age: 69
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 3,
      name: 'Ritchie Blackmore',
      birthday: '1945-04-14',
      someArray: [1, 2, 4, 6],
      guitar: 'Fender',
      age: 72
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 4,
      name: 'Mark Knopfler',
      birthday: '1949-08-12',
      someArray: [1, 6, 3],
      guitar: 'Gibson',
      age: 67
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 5,
      name: 'Eric Clapton',
      birthday: '1945-03-30',
      someArray: [1, 4],
      guitar: 'Fender',
      age: 72
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 6,
      name: 'Jimmy Page',
      guitar: 'Gibson',
      birthday: '1944-01-09',
      age: 73
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 7,
      name: 'David Bowie',
      birthday: '1947-01-08',
      deceased: true,
      age: 69
    }, foam.__context__));
    dao.put(test.mlang.Person.create({
      id: 8,
      name: 'Tom Scholz',
      birthday: '1947-03-10',
      age: 70
    }, foam.__context__));
  });

  afterEach(function() {
    dao = null;
  });

  it('basic select() returns every row', function(done) {
    dao.select().then(function(sink) {
      var a = sink.a;
      expect(a.length).toBe(8);
      var ids = {};
      for ( var i = 0 ; i < a.length ; i++ ) ids[a[i].id] = true;
      for ( var i = 1 ; i <= 8 ; i++ ) {
        expect(ids[i]).toBe(true);
      }
      done();
    });
  });

  describe('EQ()', function() {
    var EQ;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      EQ = expr.EQ.bind(expr);
    });

    it('works on strings', function(done) {
      dao.where(EQ(test.mlang.Person.NAME, 'Carlos Santana')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(1);
        expect(sink.a[0].name).toBe('Carlos Santana');
        expect(sink.a[0].id).toBe(2);
        done();
      });
    });

    it('works on numbers', function(done) {
      dao.where(EQ(test.mlang.Person.ID, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(1);
        expect(sink.a[0].name).toBe('Mark Knopfler');
        done();
      });
    });

    it('works on booleans, even false', function(done) {
      dao.where(EQ(test.mlang.Person.DECEASED, false)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(6);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(EQ(test.mlang.Person.NAME, 'Carlos Santana').toString())
          .toBe('EQ(name, "Carlos Santana")');
      expect(EQ(7, 7).toString())
          .toBe('EQ(7, 7)');
      expect(EQ(foam.mlang.predicate.Not.create({ arg1: 7 }), 7).toString())
          .toBe('EQ(NOT(7), 7)');
    });
  });

  describe('NEQ()', function() {
    var NEQ;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      NEQ = expr.NEQ.bind(expr);
    });

    it('works on strings', function(done) {
      dao.where(NEQ(test.mlang.Person.NAME, 'Carlos Santana')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(7);
        for ( var i = 0 ; i < sink.a.length ; i++ ) {
          expect(sink.a[i].name).not.toBe('Carlos Santana');
        }
        done();
      });
    });

    it('works on numbers', function(done) {
      dao.where(NEQ(test.mlang.Person.ID, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(7);
        done();
      });
    });

    it('works on booleans, even false', function(done) {
      dao.where(NEQ(test.mlang.Person.DECEASED, false)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(NEQ(test.mlang.Person.NAME, 'Carlos Santana').toString())
          .toBe('NEQ(name, "Carlos Santana")');
      expect(NEQ(7, 7).toString())
          .toBe('NEQ(7, 7)');
      expect(NEQ(foam.mlang.predicate.Not.create({ arg1: 7 }), 7).toString())
          .toBe('NEQ(NOT(7), 7)');
    });
  });

  describe('LT()', function() {
    var LT;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      LT = expr.LT.bind(expr);
    });

    it('works on strings', function(done) {
      dao.where(LT(test.mlang.Person.NAME, 'Mark Knopfler')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(5);
        done();
      });
    });

    it('works on numbers', function(done) {
      dao.where(LT(test.mlang.Person.ID, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(3);
        done();
      });
    });

    it('works on dates', function(done) {
      dao.where(LT(test.mlang.Person.BIRTHDAY, new Date(1947, 0, 1))).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(4);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(LT(test.mlang.Person.NAME, 'Carlos Santana').toString())
          .toBe('LT(name, "Carlos Santana")');
      expect(LT(7, 7).toString())
          .toBe('LT(7, 7)');
      expect(LT(foam.mlang.predicate.Not.create({ arg1: 7 }), 7).toString())
          .toBe('LT(NOT(7), 7)');
    });
  });

  describe('LTE()', function() {
    var LTE;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      LTE = expr.LTE.bind(expr);
    });

    it('works on strings', function(done) {
      dao.where(LTE(test.mlang.Person.NAME, 'Mark Knopfler')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(6);
        done();
      });
    });

    it('works on numbers', function(done) {
      dao.where(LTE(test.mlang.Person.ID, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(4);
        done();
      });
    });

    it('works on dates', function(done) {
      // March 10 1947 is Tom Scholz's birthday, so this includes him.
      dao.where(LTE(test.mlang.Person.BIRTHDAY, new Date('1947-03-10'))).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(6);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(LTE(test.mlang.Person.NAME, 'Carlos Santana').toString())
          .toBe('LTE(name, "Carlos Santana")');
      expect(LTE(7, 7).toString())
          .toBe('LTE(7, 7)');
      expect(LTE(foam.mlang.predicate.Not.create({ arg1: 7 }), 7).toString())
          .toBe('LTE(NOT(7), 7)');
    });
  });

  describe('GT()', function() {
    var GT;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      GT = expr.GT.bind(expr);
    });

    it('works on strings', function(done) {
      dao.where(GT(test.mlang.Person.NAME, 'Mark Knopfler')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2);
        done();
      });
    });

    it('works on numbers', function(done) {
      dao.where(GT(test.mlang.Person.ID, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(4);
        done();
      });
    });

    it('works on dates', function(done) {
      dao.where(GT(test.mlang.Person.BIRTHDAY, new Date(1947, 0, 1))).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(4);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(GT(test.mlang.Person.NAME, 'Carlos Santana').toString())
          .toBe('GT(name, "Carlos Santana")');
      expect(GT(7, 7).toString())
          .toBe('GT(7, 7)');
      expect(GT(foam.mlang.predicate.Not.create({ arg1: 7 }), 7).toString())
          .toBe('GT(NOT(7), 7)');
    });
  });

  describe('GTE()', function() {
    var GTE;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      GTE = expr.GTE.bind(expr);
    });

    it('works on strings', function(done) {
      dao.where(GTE(test.mlang.Person.NAME, 'Mark Knopfler')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(3);
        done();
      });
    });

    it('works on numbers', function(done) {
      dao.where(GTE(test.mlang.Person.ID, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(5);
        done();
      });
    });

    it('works on dates', function(done) {
      // March 10 1947 is Tom Scholz's birthday, so this includes him.
      dao.where(GTE(test.mlang.Person.BIRTHDAY, new Date('1947-03-10'))).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(3);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(GTE(test.mlang.Person.NAME, 'Carlos Santana').toString())
          .toBe('GTE(name, "Carlos Santana")');
      expect(GTE(7, 7).toString())
          .toBe('GTE(7, 7)');
      expect(GTE(foam.mlang.predicate.Not.create({ arg1: 7 }), 7).toString())
          .toBe('GTE(NOT(7), 7)');
    });
  });

  describe('NOT()', function() {
    var NOT;
    var EQ;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      NOT = expr.NOT.bind(expr);
      EQ = expr.EQ.bind(expr);
    });

    it('works on solitary Boolean properties', function(done) {
      dao.where(NOT(test.mlang.Person.DECEASED)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(6);
        done();
      });
    });

    it('negates other expressions perfectly', function(done) {
      var q = foam.mlang.predicate.Lt.create({
        arg1: test.mlang.Person.ID,
        arg2: 4
      });
      var p1 = dao.where(q).select();
      var p2 = dao.where(NOT(q)).select();
      Promise.all([p1, p2]).then(function(arr) {
        var keys = {};
        for ( var i = 1 ; i <= 8 ; i++ ) keys[i] = 0;
        for ( var i = 0 ; i < arr[0].a.length ; i++ )
          keys[arr[0].a[i].id]++;
        for ( var i = 0 ; i < arr[1].a.length ; i++ )
          keys[arr[1].a[i].id]++;

        for ( var i = 1 ; i <= 8 ; i++ )
          expect(keys[i]).toBe(1);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(NOT(EQ(test.mlang.Person.ID, "123")).toString()).toBe('NOT(EQ(id, "123"))');
    });
  });

  describe('HAS()', function() {
    var HAS;
    var NOT;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      HAS = expr.HAS.bind(expr);
      NOT = expr.NOT.bind(expr);
    });

    it('returns true for set values, even false', function(done) {
      dao.where(HAS(test.mlang.Person.DECEASED)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(8);
        done();
      });
    });

    it('returns true for set values, even empty arrays', function(done) {
      dao.where(HAS(test.mlang.Person.SOME_ARRAY)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(3);
        done();
      });
    });

    it('returns NOT(true for set values, even empty arrays)', function(done) {
      dao.where(NOT(HAS(test.mlang.Person.SOME_ARRAY))).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(5);
        done();
      });
    });

    it('returns false for undefined values like ""', function(done) {
      dao.where(HAS(test.mlang.Person.NEVER_SET)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(0);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(HAS(test.mlang.Person.NEVER_SET).toString()).toBe('HAS(neverSet)');
    });
  });

  describe('CONTAINS()', function() {
    var CONTAINS;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      CONTAINS = expr.CONTAINS.bind(expr);
    });

    it('works on substrings', function(done) {
      dao.where(CONTAINS(test.mlang.Person.NAME, 'Jim')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2); // Jimi Hendrix and Jimmy Page
        done();
      });
    });

    it('works on arrays', function(done) {
      dao.where(CONTAINS(test.mlang.Person.SOME_ARRAY, 4)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(CONTAINS(test.mlang.Person.NAME, 'Santana').toString()).toBe(
          'CONTAINS(name, "Santana")');
    });
  });

  describe('CONTAINS_IC()', function() {
    var CONTAINS_IC;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      CONTAINS_IC = expr.CONTAINS_IC.bind(expr);
    });

    it('works on substrings, ignoring case', function(done) {
      dao.where(CONTAINS_IC(test.mlang.Person.NAME, 'JIM')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2); // Jimi Hendrix and Jimmy Page
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(CONTAINS_IC(test.mlang.Person.NAME, 'Santana').toString()).toBe(
          'CONTAINS_IC(name, "Santana")');
    });
  });

  describe('OR()', function() {
    var OR;
    var FUNC;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      OR = expr.OR.bind(expr);
      FUNC = expr.FUNC.bind(expr);
    });

    it('returns false when passed no arguments', function() {
      expect(OR().f()).toBe(false);
    });

    it('correctly implements OR', function() {
      expect(OR(true).f()).toBe(true);
      expect(OR(false).f()).toBe(false);
      expect(OR(false, false, true, false).f()).toBe(true);
      expect(OR(false, false, false, false).f()).toBe(false);
      expect(OR(true, true, true, false).f()).toBe(true);
    });

    it('short-circuits when a true value is reached', function() {
      var called = false;
      var shouldNotBeCalled = function() {
        called = true;
        return false;
      };
      expect(OR(false, true, false, FUNC(shouldNotBeCalled)).f()).toBe(true);
      expect(called).toBe(false);
    });

    it('toString()s nicely', function() {
      expect(OR().toString()).toBe('OR()');
      expect(OR(7).toString()).toBe('OR(7)');
      expect(OR(true).toString()).toBe('OR(true)');
      expect(OR(true, false, 'something').toString()).toBe(
          'OR(true, false, "something")');
    });
  });

  describe('AND()', function() {
    var AND;
    var FUNC;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      AND = expr.AND.bind(expr);
      FUNC = expr.FUNC.bind(expr);
    });

    it('returns true when passed no arguments', function() {
      expect(AND().f()).toBe(true);
    });

    it('correctly implements AND', function() {
      expect(AND(true).f()).toBe(true);
      expect(AND(false).f()).toBe(false);
      expect(AND(false, false, true, false).f()).toBe(false);
      expect(AND(false, false, false, false).f()).toBe(false);
      expect(AND(true, true, true, false).f()).toBe(false);
      expect(AND(true, true, true, true).f()).toBe(true);
    });

    it('short-circuits when a false value is reached', function() {
      var called = false;
      var shouldNotBeCalled = function() {
        called = true;
        return false;
      };
      expect(AND(true, true, false, FUNC(shouldNotBeCalled)).f()).toBe(false);
      expect(called).toBe(false);
    });

    it('toString()s nicely', function() {
      expect(AND().toString()).toBe('AND()');
      expect(AND(7).toString()).toBe('AND(7)');
      expect(AND(true).toString()).toBe('AND(true)');
      expect(AND(true, false, 'something').toString()).toBe(
          'AND(true, false, "something")');
    });
  });

  describe('IN()', function() {
    var IN;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      IN = expr.IN.bind(expr);
    });

    it('works with a constant on both sides', function() {
      expect(IN(7, [1, 2, 7]).f()).toBe(true);
      expect(IN(8, [1, 2, 7]).f()).toBe(false);
    });

    it('works with a .f()\'d left-hand side and a constant array', function(done) {
      dao.where(IN(test.mlang.Person.NAME, ['Jimi Hendrix', 'Mark Knopfler'])).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2);
        done();
      });
    });

    it('works with a constant left-hand side and a .f()\'d array', function(done) {
      dao.where(IN(6, test.mlang.Person.SOME_ARRAY)).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2);
        done();
      });
    });

    // TODO(braden): The toString() for arrays isn't very pleasing, but we
    // probably don't want to change it anywhere except mlangs.
    it('toString()s nicely', function() {
      expect(IN(test.mlang.Person.NAME, ['Jimi Hendrix', 'Mark Knopfler']).toString()).toBe(
          'IN(name, ["Jimi Hendrix", "Mark Knopfler"])');
    });
  });

  describe('MAP()', function() {
    var MAP;
    beforeEach(function() {
      var expr = foam.mlang.Expressions.create();
      MAP = expr.MAP.bind(expr);
    });

    it('accepts properties', function(done) {
      dao.select(
        MAP(test.mlang.Person.NAME, foam.dao.ArraySink.create())
      ).then(function(sink) {
        var a = sink.delegate.a;
        expect(a.length).toBe(8); // Jimi Hendrix and Jimmy Page
        expect(a[0]).toEqual('Jimi Hendrix');
        expect(a[1]).toEqual('Carlos Santana');
        done();
      },
      function(err) {
        throw err;
        done();
      });
    });

    it('accepts functions', function(done) {
      dao.select(
        MAP(function(o) {
          return o.name;
        }, foam.dao.ArraySink.create())
      ).then(function(sink) {
        var a = sink.delegate.a;
        expect(a.length).toBe(8); // Jimi Hendrix and Jimmy Page
        expect(a[0]).toEqual('Jimi Hendrix');
        expect(a[1]).toEqual('Carlos Santana');
        done();
      },
      function(err) {
        throw err;
        done();
      });
    });

    it('accepts constants', function(done) {
      dao.select(
        MAP(55, foam.dao.ArraySink.create())
      ).then(function(sink) {
        var a = sink.delegate.a;
        expect(a.length).toBe(8); // Jimi Hendrix and Jimmy Page
        expect(a[0]).toEqual(55);
        expect(a[1]).toEqual(55);
        done();
      },
      function(err) {
        throw err;
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(MAP(test.mlang.Person.NAME, foam.dao.ArraySink.create()).toString()).toBe(
          'MAP(name)');
    });
  });

  describe('Keyword()', function() {
    var KEYWORD;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      KEYWORD = expr.KEYWORD.bind(expr);
    });

    it('finds substrings of any String properties', function(done) {
      dao.where(KEYWORD('Hendrix')).select().then(function(sink) {
        var a = sink.a;
        expect(a.length).toBe(1);
        expect(a[0].name).toBe('Jimi Hendrix');
        done();
      });
    });

    it('always fails if the input is empty', function(done) {
      dao.where(KEYWORD('')).select().then(function(sink) {
        var a = sink.a;
        expect(a.length).toBe(0);
        done();
      });
    });
  });

  describe('STARTS_WITH()', function() {
    var STARTS_WITH;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      STARTS_WITH = expr.STARTS_WITH.bind(expr);
    });

    it('correctly implements STARTS_WITH', function() {
      expect(STARTS_WITH('Murray', 'M').f()).toBe(true);
      expect(STARTS_WITH('slash', 's').f()).toBe(true);
      expect(STARTS_WITH('jimmy', 'j').f()).toBe(true);
      expect(STARTS_WITH('jimmy', 'J').f()).toBe(false);
    });

    it('works on DAO', function(done) {
      dao.where(STARTS_WITH(test.mlang.Person.NAME, 'J')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2); // Jimi Hendrix and Jimmy Page
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(STARTS_WITH(test.mlang.Person.NAME, 'C').toString())
          .toBe('STARTS_WITH(name, "C")');
    });
  });

  describe('STARTS_WITH_IC()', function() {
    var STARTS_WITH_IC;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      STARTS_WITH_IC = expr.STARTS_WITH_IC.bind(expr);
    });

    it('correctly implements STARTS_WITH_IC', function() {
      expect(STARTS_WITH_IC('Murray', 'm').f()).toBe(true);
      expect(STARTS_WITH_IC('Murray', 'M').f()).toBe(true);
      expect(STARTS_WITH_IC('jimmy', 'J').f()).toBe(true);
      expect(STARTS_WITH_IC('jimmy', 'j').f()).toBe(true);
      expect(STARTS_WITH_IC('jimmy', 'a').f()).toBe(false);
    });

    it('works on DAO', function(done) {
      dao.where(STARTS_WITH_IC(test.mlang.Person.NAME, 'j')).select()
      .then(function(sink) {
        expect(sink.a.length).toBe(2); // Jimi Hendrix and Jimmy Page
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(STARTS_WITH_IC(test.mlang.Person.NAME, 'C').toString())
          .toBe('STARTS_WITH_IC(name, "C")');
    });
  });

  describe('MUL()', function() {
    var MUL;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      MUL = expr.MUL.bind(expr);
    });

    it('correctly implements MUL', function() {
      expect(MUL(1, 5).f()).toBe(5);
      expect(MUL(2, 5).f()).toBe(10);
      expect(MUL(3, 5).f()).toBe(15);
    });

    // todo: mul should return false when one of the arguments is not a number 
    xit('correctly handle', function() {
      expect(MUL('a', 'x').f()).toBe(false);
    });

    it('toString()s nicely', function() {
      expect(MUL(4, 12).toString())
          .toBe('MUL(4, 12)');
    });
  });

  describe('MAX()', function() {
    var MAX;
    var EQ;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      MAX = expr.MAX.bind(expr);
      EQ = expr.EQ.bind(expr);
    });

    it('correctly implements MAX', function(done) {
      dao.select(MAX(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(73);
        done();
      });
    });

    it('MAX with where', function(done) {
      dao
      .where(EQ(test.mlang.Person.DECEASED, true))
      .select(MAX(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(69);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(MAX(test.mlang.Person.AGE).toString())
          .toBe('MAX(age)');
    });
  });

  describe('MIN()', function() {
    var MIN;
    var EQ;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      MIN = expr.MIN.bind(expr);
      EQ = expr.EQ.bind(expr);
    });

    it('correctly implements MIN', function(done) {
      dao.select(MIN(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(27); // hendrix
        done();
      });
    });

    it('MIN with where', function(done) {
      dao
      .where(EQ(test.mlang.Person.DECEASED, true))
      .select(MIN(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(27); // hendrix
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(MIN(test.mlang.Person.AGE).toString())
          .toBe('MIN(age)');
    });
  });

  describe('COUNT()', function() {
    var COUNT;
    var EQ;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      COUNT = expr.COUNT.bind(expr);
      EQ = expr.EQ.bind(expr);
    });

    it('simple COUNT', function(done) {
      dao.select(COUNT(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(8);
        done();
      });
    });


    it('COUNT with where', function(done) {
      dao
      .where(EQ(test.mlang.Person.GUITAR, 'Fender'))
      .select(COUNT(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(3);
        done();
      });
    });

    it('toString()s nicely', function() {
      expect(COUNT().toString())
          .toBe('COUNT()');
    });
  });

  describe('SUM()', function() {
    var SUM;
    var EQ;
    beforeEach(function() {
      var expr = foam.mlang.ExpressionsSingleton.create();
      SUM = expr.SUM.bind(expr);
      EQ = expr.EQ.bind(expr);
    });

    it('simple SUM', function(done) {
      dao
      .select(SUM(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(519);
        done();
      });
    });

    it('SUM with where', function(done) {
      dao
      .where(EQ(test.mlang.Person.GUITAR, 'Gibson'))
      .select(SUM(test.mlang.Person.AGE))
      .then(function(sink) {
        expect(sink.hasOwnProperty('value')).toBe(true);
        expect(sink.value).toBe(140);
        done();
      });
    });

    xit('toString()s nicely', function() {
      expect(SUM().toString())
          .toBe('SUM()');
    });
  });

});

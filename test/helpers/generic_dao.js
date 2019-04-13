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

// This is a Node.js module that exports a function.
// That function expects to be called from inside a describe(), and for its
// first argument to be some DAO class.
//
// This will run a suite of generic DAO tests against it, that should work
// against any DAO.

global.genericDAOTestBattery = function(daoFactory) {
  describe('generic DAO tests', function() {
    beforeEach(function() {
      foam.CLASS({
        package: 'test.dao.generic',
        name: 'Person',
        properties: [
          {
            class: 'Int',
            name: 'id',
          },
          {
            class: 'String',
            name: 'firstName',
          },
          {
            class: 'String',
            name: 'lastName',
          },
          // TODO(braden): Put these tags fields back when the serialization
          // supports them properly.
          /*
            {
            class: 'Array',
            of: 'String',
            name: 'tags',
            },
          */
          {
            class: 'Boolean',
            name: 'deceased',
          },
          // TODO(braden): Test serializing more values: Dates, nested FObjects,
          // arrays of nested FObjects.
        ]
      });
    });

    var mkPerson1 = function() {
      return test.dao.generic.Person.create({
        id: 1,
        firstName: 'Angus',
        lastName: 'Young',
        deceased: false,
        //tags: ['guitar','70s', '80s'],
      }, foam.__context__);
    };

    var mkPerson2 = function() {
      return test.dao.generic.Person.create({
        id: 2,
        firstName: 'Jon',
        lastName: 'Bonham',
        deceased: true,
        //tags: ['drums','70s'],
      }, foam.__context__);
    };

    describe('put()', function() {
      it('should insert new objects', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          dao.put(p).then(function(p2) {
            expect(p2).toBeDefined();
            expect(p2.id).toEqual(p.id);
            done();
          });
        });
      });

      it('should update objects with the same id', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          dao.put(p).then(function(p2) {
            var clone = p.clone();
            clone.firstName = 'Neil';
            expect(p.firstName).toBe('Angus');
            return dao.put(clone);
          }).then(function(p3) {
            expect(p3.firstName).toBe('Neil');
            return dao.find(p.id);
          }).then(function(p4) {
            expect(p4.id).toBe(p.id);
            expect(p4.firstName).toBe('Neil');
            return dao.select(foam.mlang.sink.Count.create());
          }).then(function(c) {
            expect(c.value).toBe(1);
          }).catch(function(e) {
            fail(e);
          }).then(done);
        });
      });

      it('should pub on.put with the object', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          var listenerCalled = false;
          dao.on.put.sub(function(sub, on, put, obj) {
            expect(sub).toBeDefined();
            expect(on).toBe('on');
            expect(put).toBe('put');

            expect(obj).toBeDefined();
            expect(obj.id).toBe(p.id);

            done();
          });

          dao.put(p);
        });
      });
    });

    describe('find()', function() {
      it('should get existing objects', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          dao.put(p).then(function() {
            return dao.find(p.id);
          }).then(function(p2) {
            expect(p.id).toBe(p2.id);
            done();
          });
        });
      });

      it('should support find(object)', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          dao.put(p).then(function() {
            return dao.find(p);
          }).then(function(p2) {
            expect(p.id).toBe(p2.id);
            done();
          });
        });
      });

      it('should resolve with null if not found', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          dao.find(p.id).then(function(obj) {
            expect(obj).toBe(null);
          }).then(function() {
            return dao.put(p);
          }).then(function() {
            return dao.find(p.id);
          }).then(function(p2) {
            expect(p2.id).toBe(p.id);
            return dao.find(74);
          }).then(function(obj) {
            expect(obj).toBe(null);
          }).then(done, fail);
        });
      });
    });

    describe('removeAll()', function() {
      it('should return a promise', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          try {
            dao.removeAll().then(done, fail);
          } catch (error) {
            fail(error);
          }
        });
      });

      it('should only remove that which matches the predicate', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var exprs = foam.mlang.Expressions.create();
          var p = mkPerson1();
          var pid = p.id;
          p.deceased = true;

          var p2 = mkPerson2();
          var p2id = p2.id;
          p2.deceased = false;

          var called = false;

          dao.on.remove.sub(function(s, on, remove, obj) {
            expect(s).toBeDefined();
            expect(on).toBe('on');
            expect(remove).toBe('remove');
            expect(obj).toBeDefined();
            expect(obj.id).toBe(p.id);
            expect(called).toBe(false);
            called = true;
          });

          dao.put(p).then(function() {
            return dao.put(p2);
          }).then(function() {
            return dao.where(exprs.EQ(test.dao.generic.Person.DECEASED, true)).removeAll();
          }).then(function() {
            return dao.find(pid);
          }).then(function(p) {
            expect(p).toBe(null);
            return dao.find(p2id);
          }).then(function(p2) {
            expect(p2.id).toBe(p2id);
          }).then(done, fail);
        });
      });
    });

    describe('remove()', function() {
      it('should actually remove the object', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          dao.put(p).then(function(p2) {
            return dao.find(p.id);
          }).then(function(p3) {
            expect(p3).toBeDefined();
            expect(p3.id).toBe(p.id);
            return dao.remove(p);
          }).then(function() {
            return dao.find(p.id);
          }).then(function(obj) {
            expect(obj).toBe(null);
          }).then(function() {
            return dao.select().then(function(sink) {
              expect(sink.array.length).toEqual(0);
            });
          }).then(done);
        });
      });

      it('should pub on.remove with the object', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p = mkPerson1();
          var listenerCalled = false;
          dao.on.remove.sub(function(sub, on, remove, obj) {
            expect(sub).toBeDefined();
            expect(on).toBe('on');
            expect(remove).toBe('remove');

            expect(obj).toBeDefined();
            expect(obj.id).toBe(p.id);

            listenerCalled = true;
            done();
          });

          dao.put(p).then(function() {
            return dao.remove(p);
          });
        });
      });

      it('should not pub on.remove if nothing was removed', function(done) {
        var dao = daoFactory(test.dao.generic.Person).then(function(dao) {
          dao.on.remove.sub(function() {
            fail('No object should have been removed.');
          });
          var p = mkPerson1();
          dao.remove(p).then(done);
        });
      });
    });

    describe('select()', function() {
      it('should just call eof() when the DAO is empty', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var puts = 0;
          var eofCalled = false;
          var sink = {
            put: function() { puts++; },
            eof: function() { eofCalled = true; }
          };

          dao.select(sink).then(function(s) {
            expect(puts).toBe(0);
            expect(eofCalled).toBe(true);
            done();
          });
        });
      });

      it('should make an ArraySink if sink is not provided', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {

          dao.select().then(function(s) {
            expect(s).toBeDefined();
            expect(foam.dao.ArraySink.isInstance(s)).toBe(true);
            done();
          });
        });
      });

      it('should call sink.put for each item', function(done) {
        daoFactory(test.dao.generic.Person).then(function(dao) {
          var p1 = mkPerson1();
          var p2 = mkPerson2();

          var puts = 0;
          var eofCalled = false;
          var seen = {};
          var sink = {
            put: function(o) {
              expect(o).toBeDefined();
              expect(seen[o.id]).toBeUndefined();
              seen[o.id] = true;
              puts++;
            },
            eof: function() { eofCalled = true; }
          };

          dao.put(p1).then(function() {
            return dao.put(p2);
          }).then(function() {
            return dao.select(sink);
          }).then(function(s) {
            // DAOs wrap plain JS objects in an AnonymousSink
            // expect(s).toBe(sink);
            expect(puts).toBe(2);
            expect(Object.keys(seen).length).toBe(2);
            expect(eofCalled).toBe(true);
            done();
          });
        });
      });

      describe('filtering', function() {
        var dao;
        var exprs;
        beforeEach(function(done) {
          exprs = foam.mlang.Expressions.create();
          daoFactory(test.dao.generic.Person).then(function(idao) {
            dao = idao;
            return idao.put(mkPerson1()).then(function() { return idao.put(mkPerson2()) } );
          }).then(done);
        });

        afterEach(function() {
          dao = null;
        });

        it('should support where()', function() {
          var filtered = dao.where(exprs.NEQ(test.dao.generic.Person.DECEASED, false));
          expect(filtered).toBeDefined();
          expect(filtered.select).toBeDefined();
        });

        it('should honour where() on select()', function(done) {
          dao.where(exprs.EQ(test.dao.generic.Person.DECEASED, true)).select().then(function(a) {
            expect(a).toBeDefined();
            expect(a.array).toBeDefined();
            expect(a.array.length).toBe(1);
          }).catch(function(e) {
            fail(e);
          }).then(done);
        });

        it('should honour where() on find()', function(done) {
          var deceased = dao.where(
              exprs.EQ(test.dao.generic.Person.DECEASED, true));
          var p1;
          var p2;

          // Person 1 (id=1) is not deceased; Person 2 (id=2) is deceased.
          Promise.all([
            Promise.all([
              dao.find(1).then(function(p) { p1 = p; }),
              dao.find(2).then(function(p) { p2 = p; }),
            ]).then(function() {
              // Find by object.
              return Promise.all([
                deceased.find(p1).then(function(p) {
                  expect(p).toBeNull();
                }),
                deceased.find(p2).then(function(p) {
                  expect(p).not.toBeNull();
                })
              ]);
            }),
            // Find by id:
            Promise.all([
              deceased.find(1).then(function(p) {
                expect(p).toBeNull();
              }),
              deceased.find(2).then(function(p) {
                expect(p).not.toBeNull();
              })
            ])
          ]).then(done, done.fail);
        });

        it('should honour limit()', function(done) {
          dao.limit(1).select().then(function(a) {
            expect(a).toBeDefined();
            expect(a.array).toBeDefined();
            expect(a.array.length).toBe(1);
          }).catch(function(e) {
            fail(e);
          }).then(done);
        });

        it('should honour skip()', function(done) {
          var first = foam.dao.ArraySink.create();
          var second = foam.dao.ArraySink.create();
          Promise.all([
            dao.limit(1).select(first),
            dao.skip(1).limit(1).select(second)
          ]).then(function() {
            expect(first.array).toBeDefined();
            expect(first.array.length).toBe(1);
            expect(second.array).toBeDefined();
            expect(second.array.length).toBe(1);

            expect(first.array[0].id).not.toEqual(second.array[0].id);
          }).catch(function(e) {
            fail(e);
          }).then(done);
        });

        it('should honour orderBy()', function(done) {
          dao.orderBy(test.dao.generic.Person.LAST_NAME).select().then(function(a) {
            expect(a.array).toBeDefined();
            expect(a.array.length).toBe(2);

            expect(a.array[0].lastName).toBe('Bonham');
            expect(a.array[1].lastName).toBe('Young');
            return dao.orderBy(test.dao.generic.Person.FIRST_NAME).select();
          }).then(function(a) {
            expect(a.array).toBeDefined();
            expect(a.array.length).toBe(2);

            expect(a.array[0].firstName).toBe('Angus');
            expect(a.array[1].firstName).toBe('Jon');
          }).then(done);
        });

        it('should honour sub.detach() with orderBy()', function(done) {
          foam.CLASS({
            package: 'test.dao.generic',
            name: 'DetachAfterFirstSink',
            extends: 'foam.dao.ProxySink',

            methods: [
              function put(o, sub) {
                this.delegate.put(o, sub);
                sub.detach();
              }
            ]
          });

          dao.orderBy(test.dao.generic.Person.LAST_NAME)
              .select(test.dao.generic.DetachAfterFirstSink.create({
                delegate: foam.dao.ArraySink.create()
              })).then(function(sink) {
                var array = sink.delegate.array;
                expect(array).toBeDefined();
                expect(array.length).toBe(1);
                expect(array[0].lastName).toBe('Bonham');
                return dao.orderBy(test.dao.generic.Person.FIRST_NAME)
                    .select(test.dao.generic.DetachAfterFirstSink.create({
                      delegate: foam.dao.ArraySink.create()
                    }));
              }).then(function(sink) {
                var array = sink.delegate.array;
                expect(array).toBeDefined();
                expect(array.length).toBe(1);
                expect(array[0].firstName).toBe('Angus');
              }).then(done, done.fail);
        });
      });
    });
  });
};

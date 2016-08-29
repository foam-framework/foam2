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


describe('SpatialHash index', function() {

  var testIdPointy = 0;

  foam.CLASS({
    name: 'Pointy',
    package: 'test',
    properties:[
      {
        name: 'id',
        factory: function() { return testIdPointy++; }
      },
      {
        class: 'foam.geo.PointProperty',
        of: 'foam.geo.Point3D',
        name: 'location',
      },
      {
        class: 'foam.geo.BoundingBoxProperty',
        of: 'foam.geo.Point3D',
        name: 'bb',
        factory: function() {
          var ret = foam.geo.RadialBoundingBox.create();
          ret.location$.linkFrom(this.location$);
          ret.radius = 10;
          return ret;
        }
      },

    ]
  });

  function generatePointies() {
    return [
      [ 20, 20, 20 ],
      [ 10, 10, 10 ],
      [ 0, 0, 0 ],
      [ 5, 0, 0 ],
      [ 20, 4, 0 ],
      [ 22, 3, 23 ],
    ].map(function(pt) {
      return test.Pointy.create({
        location: foam.geo.Point3D.create({ x: pt[0], y: pt[1], z: pt[2] })
      });
    });
  }
  function loadedMDAO() {
    var mdao = foam.dao.MDAO.create({ of: test.Pointy  });
    mdao.addIndex(test.Pointy.BB);

    generatePointies().forEach(function(pt) {
      mdao.put(pt);
    });
    return mdao;
  }

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('can be created', function() {
    foam.dao.index.SpatialHash.create();
  });
  it('defaults to 2D', function() {
    var index = foam.dao.index.SpatialHash.create();

    expect(index.axisNames[0]).toEqual('x');
    expect(index.axisNames[1]).toEqual('y');
  });

  it('works in MDAO', function(done) {
    var mdao = loadedMDAO();

    mdao.select(foam.mlang.sink.Count.create()).then(function(count) {
      expect(count.value).toEqual(6);
      done();
    });
  });

  it('executes intersection queries', function(done) {
    var mdao = loadedMDAO();

    mdao.where(
      foam.mlang.predicate.Intersects.create({
        arg1: test.Pointy.BB,
        arg2: foam.mlang.Constant.create({ value: {
          lower: foam.geo.Point3D.create({ x: 15, y: 15, z: 15 }),
          upper: foam.geo.Point3D.create({ x: 20, y: 20, z: 20 })
        } })
      })
    ).select().then(function(sink) {
      var a = sink.a;
      expect(a.length).toEqual(2);
//      console.log("Intersects:", a);
    }).then(done);
  });
  it('executes containment queries', function(done) {
    var mdao = loadedMDAO();

    mdao.where(
      foam.mlang.predicate.ContainedBy.create({
        arg1: test.Pointy.BB,
        arg2: foam.mlang.Constant.create({ value: {
          lower: foam.geo.Point3D.create({ x: 9, y: 9, z: 9 }),
          upper: foam.geo.Point3D.create({ x: 31, y: 31, z: 31 })
        } })
      })
    ).select().then(function(sink) {
      var a = sink.a;
      expect(a.length).toEqual(1);
//      console.log("ContainedBy:", a);
    }).then(done);
  });

});




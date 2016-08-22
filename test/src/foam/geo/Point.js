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


describe('Point2D', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('can be created', function() {
    foam.geo.Point2D.create();
  });
  it('reports expected axis names', function() {
    var names = foam.geo.Point2D.create().getAxisNames();
    expect(names.length).toEqual(2);
    expect(names[0]).toEqual('x');
    expect(names[1]).toEqual('y');    
  }); 
  it('assignments work', function() {
    var pt1 = foam.geo.Point2D.create();
    pt1.x = 4;
    pt1.y = 99.3;
  
    expect(pt1.x).toEqual(4);
    expect(pt1.y).toEqual(99.3);
  });
  it('comparison', function() {
    var pt1 = foam.geo.Point2D.create({ x: 3, y: 6 });
    var pt2 = foam.geo.Point2D.create({ x: 5, y: 6 });
    var pt3 = foam.geo.Point2D.create({ x: 5, y: 6 });
  
    expect(pt1.compareTo(pt2)).toEqual(-1);
    expect(pt2.compareTo(pt1)).toEqual(1);
    expect(pt2.compareTo(pt3)).toEqual(0);
  });


});

describe('Generic Point implementation, 5D test', function() {

  beforeAll(function() {
    foam.CLASS({
      name: 'Point5D',
      package: 'test',
      extends: 'foam.geo.Point',
  
      properties: [
        { name: 'a' },
        { name: 'c', class: 'Int' },
        { name: 'b', class: 'Float' },
        { name: 'd', class: 'Simple' },
        { name: 'e', class: 'Float' },
      ]
    });
  });

  var pt1;

  beforeEach(function() {
    pt1 = test.Point5D.create();
  });
  afterEach(function() {
    pt1 = null;
  });

  it('assignment', function() {
    pt1.a = 1;
    pt1.b = 2.5;
    pt1.c = 3;
    pt1.d = 4;
    pt1.e = 5.3;
    
    expect(pt1.a).toEqual(1);
    expect(pt1.b).toEqual(2.5);
    expect(pt1.c).toEqual(3);
    expect(pt1.d).toEqual(4);
    expect(pt1.e).toEqual(5.3);
  });
  it('axis order follows property order', function() {
    var names = pt1.getAxisNames();
    expect(names[0]).toEqual('a');
    expect(names[1]).toEqual('c');
    expect(names[2]).toEqual('b');
    expect(names[3]).toEqual('d');
    expect(names[4]).toEqual('e');
  });
  it('toArray() ordering', function() {
    pt1.a = 1;
    pt1.b = 2.5;
    pt1.c = 3;
    pt1.d = 4;
    pt1.e = 5.3;
    
    var vals = pt1.toArray();
    
    expect(vals[0]).toEqual(1);
    expect(vals[2]).toEqual(2.5);
    expect(vals[1]).toEqual(3);
    expect(vals[3]).toEqual(4);
    expect(vals[4]).toEqual(5.3);
  });
  

});

// TODO: PointProperty

// TODO: test a Point composed of other Points >:D



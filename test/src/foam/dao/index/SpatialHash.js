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

  foam.CLASS({
    name: 'Pointy',
    package: 'test',
    properties:[
      'id',
      {
        class: 'foam.geo.PointProperty',
        of: 'foam.geo.Point2D',
        name: 'location',
      },
      {
        class: 'foam.geo.BoundingBoxProperty',
        of: 'foam.geo.Point2D',
        name: 'bb',
        factory: function() {
          var ret = foam.geo.RadialBoundingBox();
          ret.location$.linkFrom(this.location$);
          ret.radius = 10;
          return ret;
        }
      },
      
    ]
  });

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

  it('works in MDAO', function() {
    var mdao = foam.dao.MDAO.create({ of: test.Pointy  });
    mdao.addIndex(test.Pointy.BB);
    
    
    
  });

});

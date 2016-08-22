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


describe('RadialBoundingBox', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('can be created', function() {
    foam.geo.RadialBoundingBox.create();
  });
  it('calculates the bounds', function() {
    var bb = foam.geo.RadialBoundingBox.create();
    bb.radius = 10;
    bb.location = foam.geo.Point2D.create({ x: 33, y: 66.5 });
    
    expect(bb.upper.x).toEqual(43);
    expect(bb.upper.y).toEqual(76.5);

    expect(bb.lower.x).toEqual(23);
    expect(bb.lower.y).toEqual(56.5);    
    
  });


});

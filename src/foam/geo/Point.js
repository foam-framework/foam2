/*
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

foam.CLASS({
  // TODO: more of an interface...
  package: 'foam.geo',
  name: 'Point',

  // define one property per axis

  methods: [
    function getAxisNames() {
      /** Reimplement more efficiently for each point type */
      return this.cls_.getAxiomsByClass(foam.core.Property).map(function(o) {
        return o.name;
      });
    },
    function toArray() {
      /** Reimplement more efficiently for each point type */
      var self = this;
      return this.cls_.getAxiomsByClass(foam.core.Property).map(function(o) {
        return o.f(self);
      });
    },
    function map(fn) {
      /** Copies self, calls supplied fn with each axis value and Property */
      var self = this;
      var ret = self.clone();
      this.cls_.getAxiomsByClass(foam.core.Property).forEach(function(o) {
        ret[o.name] = fn(o.f(self), o);
      });
      return ret;
    }
  ]
});
/** BoundingBox is really just a Range(of:Point). Currently designed to operate
  on any kind of point with any dimension. */
foam.CLASS({
  package: 'foam.geo',
  name: 'BoundingBox',

  properties: [
    {
      of: 'foam.geo.Point',
      name: 'upper'
    },
    {
      of: 'foam.geo.Point',
      name: 'lower'
    },
  ]
});

foam.CLASS({
  package: 'foam.geo',
  name: 'Point2D',

  implements: [ 'foam.geo.Point' ],

  properties: [
    {
      class: 'Float',
      name: 'x',
      value: 0.0
    },
    {
      class: 'Float',
      name: 'y',
      value: 0.0
    }
  ],

  methods: [
    function getAxisNames() { return [ 'x' , 'y' ]; },
    function toArray() { return [ this.x , this.y ]; },
    function map(fn) {
      /** Copies this, calls supplied fn with each axis value and Property */
      var ret = this.clone();
      ret['x'] = fn(this.x, this.X);
      ret['y'] = fn(this.y, this.Y);
      return ret;
    }
  ]
});


/** Generate a BB for an object with location+radius */
foam.CLASS({
  package: 'foam.geo',
  name: 'RadialBoundingBox',

  extends: 'foam.geo.BoundingBox',

  properties: [
    {
      class: 'Float',
      name: 'radius',
    },
    {
      class: 'foam.geo.Point',
      name: 'location',
    },
    {
      name: 'upper',
      expression: function(location, radius) {
        if ( ! location ) return undefined;
        return location.map(function(val, prop) {
          return val + radius;
        });
      }
    },
    {
      name: 'lower',
      expression: function(location, radius) {
        if ( ! location ) return undefined;
        return location.map(function(val, prop) {
          return val - radius;
        });
      }
    },
  ]
});


foam.CLASS({
  package: 'foam.geo',
  name: 'PointProperty',

  extends: 'foam.core.Property',

  properties: [
    [ 'of', 'foam.geo.Point' ],
  ],

  methods: [
    function toIndex(tailFactory) {
      //return spatial index, kD
    }
  ],
});
/** Actually dependent on the type of Point in the BoundingBox */
foam.CLASS({
  package: 'foam.geo',
  name: 'BoundingBoxProperty',

  extends: 'foam.core.Property',

  properties: [
    {
      name: 'of',
      value: 'foam.geo.BoundingBox',
    },
    {
      name: 'ofPoint',
      value: 'foam.geo.Point',
      // could check this is a subtype of boundingbox upper/lower in 'of'
    },
  ],

  methods: [
    function toIndex(tailFactory) {

      // Depending on Point type,
      // return spatial index, quad/oct/R tree
    }
  ],

});


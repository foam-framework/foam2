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
    //TODO: should be class method
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


foam.CLASS({
  package: 'foam.geo',
  name: 'Point2D',

  extends: 'foam.geo.Point',

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
foam.CLASS({
  package: 'foam.geo',
  name: 'Point3D',

  extends: 'foam.geo.Point',

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
    },
    {
      class: 'Float',
      name: 'z',
      value: 0.0
    }
  ],

  methods: [
    function getAxisNames() { return [ 'x' , 'y', 'z' ]; },
    function toArray() { return [ this.x , this.y, this.z ]; },
    function map(fn) {
      /** Copies this, calls supplied fn with each axis value and Property */
      var ret = this.clone();
      ret['x'] = fn(this.x, this.X);
      ret['y'] = fn(this.y, this.Y);
      ret['z'] = fn(this.z, this.Z);
      return ret;
    }
  ]
});




foam.CLASS({
  package: 'foam.geo',
  name: 'PointProperty',

  extends: 'foam.core.Property',

  requires: [ 'foam.dao.index.SpatialHash' ],

  properties: [
    [ 'of', 'foam.geo.Point' ],
  ],

  methods: [
    function toIndex(tailFactory) {
      return this.SpatialHash.create({
        prop: this,
        pointClass: this.of,
        tailFactory: tailFactory
      });
    }
  ],
});

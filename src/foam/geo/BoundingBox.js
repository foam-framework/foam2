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

/** BoundingBox is really just a Range(of:Point). Currently designed to operate
  on any kind of point with any dimension. Taken to the extreme, a BoundingBox is
  really just a Point with two Point axes (each axis is a space itself). */
foam.CLASS({
  package: 'foam.geo',
  name: 'BoundingBox',

  properties: [
    {
      name: 'upper'
    },
    {
      name: 'lower'
    },
  ],
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
      of: 'foam.geo.Point',
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

/** Actually dependent on the type of Point in the BoundingBox */
foam.CLASS({
  package: 'foam.geo',
  name: 'BoundingBoxProperty',

  extends: 'foam.core.Property',

  requires: [ 'foam.dao.index.SpatialHash' ],

  properties: [
    {
      /** The type of point the bounding box works with */
      class: 'Class2',
      name: 'of',
      value: 'foam.geo.Point',
    },
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


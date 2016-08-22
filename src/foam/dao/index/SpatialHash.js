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

/** Tests intersection with the given object. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Intersects',
  extends: 'foam.mlang.predicate.Binary',
  requires: [
    'foam.mlang.predicate.Constant',
    'foam.geo.Point',
    'foam.geo.BoundingBox'
  ],
  properties: [
    {
      /** The first point or region to test */
      name: 'arg1'
    },
    {
      /** The second point or region to test */
      name: 'arg2'
    },
  ],
  methods: [
    function f(o) {
      var a = this.arg1.f(o);
      var b = this.arg2.f(o);
      var aLower, aUpper, bLower, bUpper;
      // TODO: generalize point/BB/region compare
      if ( this.Point.isInstance(a) ) {
        aLower = a;
        aUpper = a;
      } else {
        aLower = a.lower;
        aUpper = a.upper;
      }
      if ( this.Point.isInstance(b) ) {
        bLower = b;
        bUpper = b;
      } else {
        bLower = b.lower;
        bUpper = b.upper;
      }

      var axes = aUpper.getAxisNames();
      for (var axis = 0; axis < axes.length; ++axis) {
        var ax = axes[axis];
        if (
          ( aLower[ax] > bUpper[ax] ) ||
          ( aUpper[ax] < bLower[ax] )
        ) {
          return false;
        }
      }
      return true;
    }
  ]
});

/** Tests containment within the given object. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ContainedBy',
  extends: 'foam.mlang.predicate.Intersects',
  methods: [
    function f(o) {
      var a = this.arg1.f(o);
      var b = this.arg2.f(o);
      var aLower, aUpper, bLower, bUpper;
      // TODO: generalize point/BB/region compare
      if ( this.Point.isInstance(a) ) {
        aLower = a;
        aUpper = a;
      } else {
        aLower = a.lower;
        aUpper = a.upper;
      }
      if ( this.Point.isInstance(b) ) {
        bLower = b;
        bUpper = b;
      } else {
        bLower = b.lower;
        bUpper = b.upper;
      }

      var axes = aUpper.getAxisNames();
      for (var axis = 0; axis < axes.length; ++axis) {
        var ax = axes[axis];
        if (
          ( aLower[ax] < bLower[ax] ) ||
          ( aUpper[ax] > bUpper[ax] )
        ) {
          return false;
        }
      }
      return true;
    }
  ]
});

/** Creates a constant reference to a value that will not be copied. The live
  value will be used each time the predicate is evaluated. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ByRefConstant',
  extends: 'foam.mlang.predicate.Constant',
  methods: [
    function clone() {
      return this.cls_.create({ value: this.value });
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.Expressions',
  requires: [
    'foam.mlang.predicate.Intersects',
    'foam.mlang.predicate.ContainedBy',
    'foam.mlang.predicate.ByRefConstant',
  ],
  methods: [
    function INTERSECTS(axes, o) { return this._binary_("Intersects", axes, o); },
    function CONTAINED_BY(axes, o) { return this._binary_("ContainedBy", axes, o); },
    function BY_REF(o) { return this.ByRefConstant.create({ value: o }); },
    function BY_VAL(o) { return this.Constant.create({ value: ( o && o.f && o.f() ) || o }); },
  ],
});


/**
  Spatial hashing DAO
  A grid of buckets, similar to an array grid but more efficient for
  sparse distributions. The spatial hash rounds off the real coordinates
  to give the bucket's key.

  TODO: This will become an index for an MDAO/IndexedDAO
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'SpatialHash',
  extends: 'foam.dao.index.Index',
  requires: [
    'foam.dao.index.SelectingPlan',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Intersects',
    'foam.mlang.predicate.ContainedBy',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Gte'
  ],

  properties: [
    {
      // TODO: set pointClass based on prop.of?
      name: 'prop',
      postSet: function(old,nu) {
        if ( nu.of ) {
          this.pointClass = nu.of;
        }
      }
    },
    {
      name: 'tailFactory'
    },
    {
      /** A map of the items stored, by id. Helps removal of items. */
      name: 'items',
      factory: function() { return {}; }
    },
    {
      /** The buckets of items, by spatial hash. For fast lookups. */
      name: 'buckets',
      factory: function() { return {}; }
    },
    {
      /** Swaps to the appropriate findBuckets function depending on the number
        of dimensions in the axes. */
      name: 'findBucketsFn',
      factory: function() { return this.findBuckets2_; }
    },
    {
      /**
        The type of point (number of dimensions) to index
      */
      class: 'Class2',
      name: 'pointClass',
      value: 'foam.geo.Point2D',
      postSet: function(old, nu) {
        this.axisNames = this.pointClass$cls.create().getAxisNames();
      }
    },
    {
      name: 'axisNames',
      value: ['x', 'y'],
      postSet: function(old,nu) {
        if ( nu.length === 2 ) {
          this.findBucketsFn = this.findBuckets2_;
        } else {
          this.findBucketsFn = this.findBucketsN_;
        }
        // augment bucketWidths with more default values
        var bw = this.bucketWidths;
        nu.forEach(function(ax) {
          if ( ! bw[ax] ) bw[ax] = 10;
        });
      }
    },
    {
      /** The size of each bucket, per axis (effectively divide each coordinate by this
        value and round off to get the hash). Changing this value invalidates
        the existing buckets. The default is for 10 unit buckets on the x and y axes. */
      name: 'bucketWidths',
      factory: function() { return foam.geo.Point2D.create({ x: 10, y: 10 }); },
      postSet: function(old, nu) {
        // TODO: how to autodetect bucket size? Users won't usually set parameters
        // on an index directly
        // TODO: removeAll and re-add
      }
    },
    {
      name: 'selectingPlan_',
      factory: function() {
        return this.SelectingPlan.create({ index: this, cost: this.size() });
      }
    }
  ],

  methods: [

    function decorateSink_(sink, skip, limit, order, predicate) {
      var dupes = {}; // crude dedup
      if ( predicate ) return {
        put: function(o) { 
          if ( o.instance_ && ! dupes[o.id] && predicate.f(o) ) {
            sink.put(o);
            dupes[o.id] = true;
          }
        },
        remove: function(o) { if ( predicate.f(o) ) sink.remove(o); },
        eof: function() { sink.eof(); },
        error: function(e) { sink.error(e); }
      };

      return sink;
    },

    /** Calculates the hash for an item, using the minimum bound point by default
      or the maximum if max is true. In 2D axes, the default is to use the
      top-left corner of the bounding box, max == true uses the bottom-right. */
    function hash_(/* foam.geo.Point */ point) {
      var bw = this.bucketWidths;
      var ret = "";
      var axes = this.axisNames;
      for (var axis = 0; axis < axes.length; ++axis) {
        var ax = axes[axis];
        ret += "p" + Math.floor( point[ax] / bw[ax] ) * bw[ax];
      }
      return ret;
    },

    /** Find all the buckets the given bounds overlaps, optimized for 2D. Much
        faster than nested functions. */
    function findBuckets2_(obj, createMode /* array */) {
      var bound = this.prop.f(obj);
      var bw = this.bucketWidths;
      var axes = this.axisNames;
      var ax0 = axes[0];
      var ax1 = axes[1];

      var x =  bound.lower[ax0];
      var y =  bound.lower[ax1];
      var x2 = bound.upper[ax0];
      var y2 = bound.upper[ax1];
      // if infinite area, don't try to filter (not optimal: we might only
      // want half, but this data structure is not equipped for axes partitioning)
      if ( x !== x || y !== y || x2 !== x2 || y2 !== y2 ||
           x === Infinity || y === Infinity || x2 === Infinity || y2 === Infinity ||
           x === -Infinity || y === -Infinity || x2 === -Infinity || y2 === -Infinity
         ) {
        return null;
      }

      var ret = [];

      for ( var w = Math.floor( x / bw[ax0] ) * bw[ax0];
            w <= Math.floor( x2 / bw[ax0] ) * bw[ax0];
            w += bw[ax0] ) {
        for ( var h = Math.floor( y / bw[ax1] ) * bw[ax1];
              h <= Math.floor( y2 / bw[ax1] ) * bw[ax1];
              h += bw[ax1] ) {
          var key = "p" + w + "p" + h;
          var bucket = this.buckets[key];
          if ( ( ! bucket ) && createMode ) {
            bucket = this.buckets[key] = {
              _hash_: key,
              value: this.tailFactory.create()
            };
          }
          if ( bucket ) {
            ret.push(bucket);
          }
        }
      }
      ret.object = obj;
      return ret;
    },

    /** Find all the buckets the given bounds overlaps */
    function findBucketsN_(obj, createMode /* array */) {
      var bound = this.prop.f(obj);
      var upper = bound.upper;
      var lower = bound.lower;
      var bw = this.bucketWidths;
      var axes = this.axisNames;
      var self = this;

      var abort = false;

      axes.forEach(function(ax) {
        // if infinite area, don't try to filter (not optimal: we might only
        // want half, but this data structure is not equipped for axes partitioning)
        if ( lower[ax] !== lower[ax] || upper[ax] !== upper[ax] ||
             lower[ax] === Infinity || upper[ax] === Infinity ||
             lower[ax] === -Infinity || upper[ax] === -Infinity
           ) {
          abort = true;
        }
      });
      if ( abort ) return null;

      var ret = [];

      // recusively scan a region for existing buckets
      function scanNextAxis(axes, prefix) {
        if ( ! axes.length ) {
          var bucket = self.buckets[prefix];
          if ( ( ! bucket ) && createMode ) {
            bucket = self.buckets[prefix] = {
              _hash_: prefix,
              value: self.tailFactory.create()
            };
          }
          if ( bucket ) {
            ret.push(bucket);
          }
        } else {
          var ax = axes[0];
          var subAxes = axes.slice(1);
          for ( var w = Math.floor( lower[ax] / bw[ax] ) * bw[ax];
                w <= Math.floor( upper[ax] / bw[ax] ) * bw[ax];
                w += bw[ax] ) {
            scanNextAxis(subAxes, prefix + "p" + w);
          }
        }
      }
      scanNextAxis(axes, "");

      ret.object = obj;
      return ret;
    },

    /** Attempts to optimize the query and find all buckets that contain
      potential matches. TODO: Need to change predicate to DNF and subquery OR'd
      parts */
    function queryBuckets_(skip, limit, order, predicate) {
      var buckets;
      var whereQuery = predicate ? predicate.clone() : null;

      var axes = this.axisNames;
      var isIndexed = function(mlangArg) {
        var n = mlangArg.name;
        // It's not a predicate that takes a property as arg1, we can't judge
        if ( ! n ) { return true; }
        for (var ax = 0; ax < axes.length; ++ax) {
          if ( axes[ax] == n ) {
            return true;
          }
        }
        return false;
      }

      // Actually want to grab all nested bounds and filter buckets based
      // on all of them... the intersection for AND, and the
      // union for OR.
      // In the AND/intersection case, we want to know all the bounds together and
      // do the search once, since any unspecified bound will catch lots of
      // buckets.
      var isExprMatch = function(model, opt_query) {
        if ( ! model ) return undefined;
        var query = opt_query || whereQuery;

        if ( query ) {

          if ( model.isInstance(query) && isIndexed(query.arg1)  ) {
            whereQuery = null;
            return query;
          }

          if ( foam.mlang.predicate.And.isInstance(query) ||
               foam.mlang.predicate.Or.isInstance(query) ) {
            for ( var i = 0 ; i < query.args.length ; i++ ) {
              var q = query.args[i];

              // recurse into nested OR
              if ( foam.mlang.predicate.Or.isInstance(q) ) {
                q = isExprMatch(model, q);
                if ( q ) return q;
                continue;
              }

              if ( model.isInstance(q) && isIndexed(q.arg1) ) {
                query.args[i] = this.True;
                query = query.partialEval();
                if ( query === this.True ) query = null;
                return q;
              }
            }
          }
        }
        return undefined;
      };

      // accumulate range limits so we can make as specific query as possible
      var ranges = { upper: {}, lower: {} };
      for (var ax = 0; ax < axes.length; ++ax) {
        ranges.lower[axes[ax]] = -Infinity;
        ranges.upper[axes[ax]] = Infinity;
      }

      var args;
      // Each hit of isExprMatch will pick off one thing ANDed at the top
      // level. Since all these bounds apply at once, keep shrinking the
      // search bounds.
      // TODO: use compare instead of Math.min, to allow for non-number ranges
      var buckets;

      // Equals will completely restrict one axis to a zero-width range (one value)
      while ( args = isExprMatch(this.Eq) ) {
        var name = args.arg1.name;
        var r = args.arg2.f();
        // accumulate the bounds (largest minimum, smallest maximum)
        ranges.upper[name] = r;
        ranges.lower[name] = r;
      }

      // Less than restricts the maximum for an axis
      while ( args = ( isExprMatch(this.Lte) || isExprMatch(this.Lt) ) ) {
        var name = args.arg1.name;
        var r = args.arg2.f();
        ranges.upper[name] = Math.min( ranges.upper[name], r );
      }

      // Greater than restricts the minimum for an axis
      while ( args = ( isExprMatch(this.Gte) || isExprMatch(this.Gt) ) ) {
        var name = args.arg1.name;
        var r = args.arg2.f();
        ranges.lower[name] = Math.max( ranges.lower[name], r );
      }

      // check for buckets with the bounds found so far
      var tmpObj = {}; // TODO: get rid of this tmpObj, change findBucketsFn?
      tmpObj[this.prop.name] = ranges;
      buckets = this.findBucketsFn(tmpObj);

      // TODO: multiple ANDed intersects should reduce the search area,
      // ORed should cause multiple searches
      while ( args = ( isExprMatch(this.Intersects) || isExprMatch(this.ContainedBy) ) ) {
        if ( ! buckets ) { buckets = []; }
        buckets = buckets.concat(this.findBucketsFn(args.arg2.f()));
      }

      return buckets;
    },

    function selectAll_(isink, skip, limit, order, predicate) {
      var resultSink = isink;
      var sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      // no optimal filtering available, so run all items through
      var items = this.items;
      for ( var key in items ) {
        sink.put(items[key].object);
      }
    },

    function selectBuckets_(isink, buckets, skip, limit, order, predicate) {
      var resultSink = isink;
      var sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      // TODO: also prevent duplicates
      // TODO: flow control?
      for ( var i = 0; ( i < buckets.length && ! fc.stopped ); ++i ) {
        buckets[i].value.select(isink, skip, limit, order, predicate);
      }
    },

    function bulkLoad(a) {
      a = a.a || a;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    },

    /** Adds or updates the given value in the index */
    function put(obj) {
      var bb = this.prop.f(obj);
      var lower = this.hash_(bb.lower);
      var upper = this.hash_(bb.upper);

      if ( this.items[obj.id] ) {
        var prev = this.items[obj.id];
        // If the object moved, but the lower/upper points are in the same buckets
        // as before, none of the buckets need to be altered.
        if ( lower !== prev.lower || upper !== prev.upper ) {
          this.remove(obj);
        }
      }

      // add to the buckets the item overlaps
      var buckets = this.findBucketsFn(obj, true);
      buckets.lower = lower;
      buckets.upper = upper;
      this.items[obj.id] = buckets; // for fast removal later
      for (var i = 0; i < buckets.length; ++i) {
        buckets[i].value.put(obj);
      }
    },

    /** Removes the given value from the index */
    function remove(obj) {
      var buckets = this.items[obj.id];

      if ( buckets && buckets.length ) {
        for (var i = 0; i < buckets.length; ++i) {
          buckets[i].value.remove(obj);
          // TODO: check for empty bucket, clean up later
        }
        delete this.items[obj.id];
      }
    },

    /** @return the stored subindex for the given key. */
    function get(key) {
      return this.buckets[key].value;
    },

    /** @return the integer size of this index. */
    function size() {
      return this.items.length;
    },

    /** Selects matching items from the index and puts them into sink */
    function select(isink, skip, limit, order, predicate) {
      var buckets;

      if ( predicate && predicate.arg2 === this.prop &&
       ( this.Intersects.isInstance(predicate) || this.ContainedBy.isInstance(predicate))) {
        buckets = this.findBucketsFn(predicate.arg2.f());
      } else {
        buckets = this.queryBuckets_(skip, limit, order, predicate);
      }

      if ( buckets ) {
        return this.selectBuckets_(isink, buckets, skip, limit, order, predicate);
      } else {
        return this.selectAll_(isink, skip, limit, order, predicate);
      }
    },

    /** Selects matching items in reverse order from the index and puts
      them into sink */
    function selectReverse(/*sink, skip, limit, order, predicate*/) {
      // ordering not supported
      this.select.apply(this, arguments);
    },

    /** @return a Plan to execute a select with the given parameters */
    function plan(sink, skip, limit, order, predicate) {
      // TODO: refine cost estimate
      return this.selectingPlan_;
    },

  ]
});

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
  ],
  properties: [
    {
      /** The set of properties that define a bounding box for each axis. */
      name: 'arg1',
      adapt: function(old,nu) {
        if ( Array.isArray( nu ) ) {
          return this.Constant.create({ value: nu });
        }
        return nu;
      },
      factory: function() {
        /** Default to 2D bounding box */
        return [
          [ { f: function(o) { return o['bx']; }, name: 'bx' },
            { f: function(o) { return o['bx2']; }, name: 'bx2' } ],
          [ { f: function(o) { return o['by']; }, name: 'by' },
            { f: function(o) { return o['by2']; }, name: 'by2' } ]
        ];
      },
    },
    {
      name: 'arg2',
      adapt: function(old,nu) {
        if ( ! nu.f || typeof nu.f !== 'function' ) {
          return this.Constant.create({ value: nu });
        }
        return nu;
      }
    },
  ],
  methods: [
    function f(o) {
      var s = this.arg1.f(o);
      for (var axis = 0; axis < s.length; ++axis) {
        if (
          ( s[axis][0].f(o) > s[axis][1].f(this.arg2.f(o)) ) ||
          ( s[axis][1].f(o) < s[axis][0].f(this.arg2.f(o)) )
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
      var s = this.arg1.f(o);
      for (var axis = 0; axis < s.length; ++axis) {
        if (
          ( s[axis][0].f(o) < s[axis][0].f(this.arg2.f(o)) ) ||
          ( s[axis][1].f(o) > s[axis][1].f(this.arg2.f(o)) )
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
    function INTERSECTS(space, o) { return this._binary_("Intersects", space, o); },
    function CONTAINED_BY(space, o) { return this._binary_("ContainedBy", space, o); },
    function BY_REF(o) { return this.ByRefConstant.create({ value: o }); },
    function BY_VAL(o) { return this.Constant.create({ value: ( o && o.f && o.f() ) || o }); },
  ],
});



// TODO: implement CONTAINED_BY, INTERSECTS, etc.
// They should accept a 'space' that also works with the spatial DAOs, to
// define which properties to use for axes. For mlangs you could set that
// once on creation, and only specify the range values when querying.

/**
  Spatial hashing DAO
  A grid of buckets, similar to an array grid but more efficient for
  sparse distributions. The spatial hash rounds off the real coordinates
  to give the bucket's key.

  TODO: This will become an index for an MDAO/IndexedDAO
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'SpatialHashDAO',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.dao.ArraySink',
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
        of dimensions in the space. */
      name: 'findBucketsFn',
      factory: function() { return this.findBuckets2_; }
    },
    {
      /**
        The space contains the names of the properties that define the
        range on each axis.
        <p>For example, a simple 2D space might use bx, by, bx2, by2. An item's
        axis-aligned bounding box would range from bx to bx2 on one axis,
        and by to by2 on the other.
        <p>Spaces can have any number of dimensions, so a z, time, level, etc.
        axis can also be added.
      */
      name: 'space',
      factory: function() {
        return [
          [ { f: function(o) { return o['bx']; }, name: 'bx' },
            { f: function(o) { return o['bx2']; }, name: 'bx2' } ],
          [ { f: function(o) { return o['by']; }, name: 'by' },
            { f: function(o) { return o['by2']; }, name: 'by2' } ]
        ];
      },
      postSet: function(old, nu) {
        if ( nu.length === 2 ) {
          this.findBucketsFn = this.findBuckets2_;
        } else if ( nu.length === 3 ) {
          this.findBucketsFn = this.findBuckets3_;
        } else if ( nu.length === 4 ) {
          this.findBucketsFn = this.findBuckets4_;
        } else {
          throw new Error("Unsupported dimensions in SpatialHashDAO: " + nu.length);
        }
      }
    },
    {
      /** The size of each bucket, per axis (effectively divide each coordinate by this
        value and round off to get the hash). Changing this value invalidates
        the existing buckets. The default is for 10 unit buckets on the x and y axes. */
      name: 'bucketWidths',
      factory: function() { return [10, 10]; },
      postSet: function(old, nu) {
        // TODO: removeAll and re-add
      }
    },
  ],

  methods: [

    function decorateSink_(sink, skip, limit, order, predicate) {
      if ( predicate ) return {
        put: function(o) { if ( predicate.f(o) ) sink.put(o); },
        remove: function(o) { if ( predicate.f(o) ) sink.remove(o); },
        eof: function() { sink.eof(); },
        error: function(e) { sink.error(e); }
      };

      return sink;
    },

    /** A default hash for any object with an x, y, x2, y2.
      Returns an array of buckets the object should occupy. if createMode is
      true, buckets will be created if not present. */
    function hash2_(x, y) {
      var bw = this.bucketWidths;
      return "p" + Math.floor( ( x ) / bw[0] ) * bw[0] +
             "p" + Math.floor( ( y ) / bw[1] ) * bw[1];
    },
    function hash3_(x, y, z) {
      var bw = this.bucketWidths;
      return "p" + Math.floor( ( x ) / bw[0] ) * bw[0] +
             "p" + Math.floor( ( y ) / bw[1] ) * bw[1] +
             "p" + Math.floor( ( z ) / bw[2] ) * bw[2];
    },
    function hash4_(x, y, z, w) {
      var bw = this.bucketWidths;
      return "p" + Math.floor( ( x ) / bw[0] ) * bw[0] +
             "p" + Math.floor( ( y ) / bw[1] ) * bw[1] +
             "p" + Math.floor( ( z ) / bw[2] ) * bw[2] +
             "p" + Math.floor( ( w ) / bw[3] ) * bw[3];
    },
    /** Calculates the hash for an item, using the minimum bound point by default
      or the maximum if max is true. In 2D space, the default is to use the
      top-left corner of the bounding box, max == true uses the bottom-right. */
    function hash_(/* object */ bounds, /* boolean */ max) {
      var bw = this.bucketWidths;
      var s = this.space;
      var minmax = max ? 1 : 0;
      var ret = "";
      for (var axis = 0; axis < s.length; ++axis) {
        ret += "p" + Math.floor( s[axis][minmax].f(bounds) / bw[axis] ) * bw[axis];
      }
      return ret;
    },

    /** Find all the buckets the given bounds overlaps */
    function findBuckets2_(bounds, createMode /* array */) {
      var bw = this.bucketWidths;
      var s = this.space;

      var x =  s[0][0].f(bounds);
      var y =  s[1][0].f(bounds);
      var x2 = s[0][1].f(bounds);
      var y2 = s[1][1].f(bounds);
      // if infinite area, don't try to filter (not optimal: we might only
      // want half, but this data structure is not equipped for space partitioning)
      if ( x !== x || y !== y || x2 !== x2 || y2 !== y2 ||
           x === Infinity || y === Infinity || x2 === Infinity || y2 === Infinity ||
           x === -Infinity || y === -Infinity || x2 === -Infinity || y2 === -Infinity
         ) {
        return null;
      }

      var ret = [];

      for ( var w = Math.floor( x / bw[0] ) * bw[0]; w <= Math.floor( x2 / bw[0] ) * bw[0]; w += bw[0] ) {
        for ( var h = Math.floor( y / bw[1] ) * bw[1]; h <= Math.floor( y2 / bw[1] ) * bw[1]; h += bw[1] ) {
          var key = "p" + w + "p" + h;
          var bucket = this.buckets[key];
          if ( ( ! bucket ) && createMode ) {
            bucket = this.buckets[key] = { _hash_: key };
          }
          if ( bucket ) {
            ret.push(bucket);
          }
        }
      }
      ret.object = bounds;
      return ret;
    },

    function findBuckets3_(bounds, createMode /* array */) {
      var bw = this.bucketWidths;
      var s = this.space;

      var x =  s[0][0].f(bounds);
      var y =  s[1][0].f(bounds);
      var z =  s[2][0].f(bounds);
      var x2 = s[0][1].f(bounds);
      var y2 = s[1][1].f(bounds);
      var z2 = s[2][1].f(bounds);
      // if infinite area, don't try to filter (not optimal: we might only
      // want half, but this data structure is not equipped for space partitioning)
      if ( x !== x || y !== y || z !== z || x2 !== x2 || y2 !== y2 || z2 !== z2 ||
           x === Infinity || y === Infinity || z === Infinity || x2 === Infinity || y2 === Infinity || z2 === Infinity ||
           x === -Infinity || y === -Infinity || z === -Infinity || x2 === -Infinity || y2 === -Infinity ||  z2 === -Infinity
         ) {
        return null;
      }

      var ret = [];

      for ( var w = Math.floor( x / bw[0] ) * bw[0]; w <= Math.floor( x2 / bw[0] ) * bw[0]; w += bw[0] ) {
        for ( var h = Math.floor( y / bw[1] ) * bw[1]; h <= Math.floor( y2 / bw[1] ) * bw[1]; h += bw[1] ) {
          for ( var d = Math.floor( z / bw[2] ) * bw[2]; d <= Math.floor( z2 / bw[2] ) * bw[2]; d += bw[2] ) {
            var key = "p" + w + "p" + h + "p" + d;
            var bucket = this.buckets[key];
            if ( ( ! bucket ) && createMode ) {
              bucket = this.buckets[key] = { _hash_: key };
            }
            if ( bucket ) {
              ret.push(bucket);
            }
          }
        }
      }
      ret.object = bounds;
      return ret;
    },

    function findBuckets4_(bounds, createMode /* array */) {
      throw new Error("SpatialHashDAO.findBuckets4_() not implemented!");
    },

    function put(obj) {
      var min = this.hash_(obj, false);
      var max = this.hash_(obj, true);

      if ( this.items[obj.id] ) {
        var prev = this.items[obj.id];
        // If the object moved, but the min/max points are in the same buckets
        // as before, none of the buckets need to be altered.
        if ( min == prev.min && max == prev.max ) {
          // hashes match, no change in buckets
          this.on.put.pub(obj);
          return Promise.resolve(obj);
        }
        // otherwise remove the old bucket entries and continue to re-insert
        this.remove_(obj);
      }

      // add to the buckets the item overlaps
      var buckets = this.findBucketsFn(obj, true);
      buckets.min = min;
      buckets.max = max;
      this.items[obj.id] = buckets; // for fast removal later
      for (var i = 0; i < buckets.length; ++i) {
        buckets[i][obj.id] = obj;
      }

      this.on.put.pub(obj);
      return Promise.resolve(obj);
    },

    function remove(obj) {
      this.remove_(obj);
      this.on.remove.pub(obj);
      return Promise.resolve();
    },
    /** Internal version of remove, without DAO notification. @internal */
    function remove_(obj) {
      var buckets = this.items[obj.id];

      if (! buckets || ! buckets.length ) {
        return false;
      } else {
        for (var i = 0; i < buckets.length; ++i) {
          delete buckets[i][obj.id];

          // check for empty bucket
          // TODO: maybe batch this on the next frame to avoid churn when removing
          // and re-adding immediately
//           if ( Object.keys( buckets[i] ).length == 1 ) {
//             delete this.buckets[buckets[i]._hash_];
//           }
        }
        delete this.items[obj.id];
        return true;
      }
    },
    /** Attempts to optimize the query and find all buckets that contain
      potential matches. */
    function queryBuckets_(skip, limit, order, predicate) {
      var buckets;
      var whereQuery = predicate ? predicate.clone() : null;

      var space = this.space;
      var isIndexed = function(mlangArg) {
        var n = mlangArg.name;
        // It's not a predicate that takes a property as arg1, we can't judge
        if ( ! n ) { return true; }
        for (var ax = 0; ax < space.length; ++ax) {
          if ( space[ax][0].name == n || space[ax][1].name == n ) {
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
      var ranges = {};
      for (var ax = 0; ax < space.length; ++ax) {
        ranges[space[ax][0].name] = -Infinity;
        ranges[space[ax][1].name] = Infinity;
      }

      function findAxis(name) {
        for (var ax = 0; ax < space.length; ++ax) {
          var a = space[ax];
          if ( a[0].name == name ||  a[1].name == name ) {
            return a;
          }
        }
        return null;
      }

      var args;
      var axis;
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
        ranges[name] = r;
      }

      // Less than restricts the maximum for an axis
      while ( args = ( isExprMatch(this.Lte) || isExprMatch(this.Lt) ) ) {
        var name = args.arg1.name;
        var r = args.arg2.f();
        axis = findAxis(name);
        if ( axis ) {
          ranges[axis[1].name] = Math.min( ranges[axis[1].name], r );
        }
      }

      // Greater than restricts the minimum for an axis
      while ( args = ( isExprMatch(this.Gte) || isExprMatch(this.Gt) ) ) {
        var name = args.arg1.name;
        var r = args.arg2.f();
        axis = findAxis(name);
        if ( axis ) {
          ranges[axis[0].name] = Math.max( ranges[axis[0].name], r );
        }
      }

      // check for buckets with the bounds found so far
      buckets = this.findBucketsFn(ranges);

      // TODO: multiple ANDed intersects should reduce the search area,
      // ORed should cause multiple searches
      while ( args = ( isExprMatch(this.Intersects) || isExprMatch(this.ContainedBy) ) ) {
        if ( ! buckets ) { buckets = []; }
        buckets = buckets.concat(this.findBucketsFn(args.arg2.f()));
      }

      return buckets;
    },

    function selectAll_(isink, skip, limit, order, predicate) {
      var resultSink = isink || this.ArraySink.create();
      var sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      // no optimal filtering available, so run all items through
      var fc = this.FlowControl.create();
      var items = this.items;
      for ( var key in items ) {
        if ( fc.stopped ) break;
        if ( fc.errorEvt ) {
          var err = fc.errorEvt;
          fc.destroy();
          sink.error(err);
          return Promise.reject(err);
         }
        sink.put(items[key].object, fc);
      }
      fc.destroy();

      sink.eof();
      return Promise.resolve(resultSink);
    },

    function selectBuckets_(isink, buckets, skip, limit, order, predicate) {
      var resultSink = isink || this.ArraySink.create();
      var sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      var duplicates = {};
      var fc = this.FlowControl.create();
      for ( var i = 0; ( i < buckets.length && ! fc.stopped ); ++i ) {
        for ( var key in buckets[i] ) {
          if ( fc.stopped ) break;
          if ( fc.errorEvt ) {
            var err = fc.errorEvt;
            fc.destroy();
            sink.error(err);
            return Promise.reject(err);
           }
          // skip things we've already seen from other buckets
          if ( duplicates[key] ) { continue; }
          duplicates[key] = true;
          var obj = buckets[i][key];
          if ( obj.id ) {
            sink.put(obj); // HACK: removed FlowControl to gain optimization
          }
        }
      }
      fc.destroy();
      sink.eof();
      return Promise.resolve(resultSink);
    },

    function select(isink, skip, limit, order, predicate) {
      var buckets;

      if ( predicate &&
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

    function removeAll(skip, limit, order, predicate) {
      var predicate = ( predicate ) || this.True.create();

      for ( var key in this.items ) {
        var obj = this.items[key].object;
        if ( predicate.f(obj) ) {
          this.remove(obj);
          this.on.remove.pub(obj);
        }
      }

      sink && sink.eof && sink.eof();

      return Promise.resolve();
    },

    function find(id) {
      var obj = this.items[id] && this.items[id].object;
      if ( obj ) {
        return Promise.resolve(obj);
      } else {
        return Promise.reject(this.ObjectNotFoundException.create({ id: id }));
      }
    }
  ]
});

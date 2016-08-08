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
// TODO: Don't use yet! Port awaiting manual testing

/**
  ReadCacheDAO will do all queries from its fast delegate (cache). Writes
  are sent through to the src, which will eventually update the cache.
  The cache maintains full copy of the src, but the src is the source
  of truth.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'ReadCacheDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.PreloadDAO'
  ],

  properties: [
    {
      /** The source DAO on which to add caching. Writes go straight
        to the src, and cache is updated to match.
        TODO: can this be a proxy? Resolve the constistency issue addressed
        in the current put/remove methods. */
      name: 'src',
      postSet: function(old, src) {
        if ( old ) {
          old.on.put.unsub(this.onSrcPut);
          old.on.remove.unsub(this.onSrcRemove);
          old.on.reset.unsub(this.onSrcReset);
        }
        src.on.put.sub(this.onSrcPut);
        src.on.remove.sub(this.onSrcRemove);
        src.on.reset.sub(this.onSrcReset);
      }
    },
    {
      /** The cache to read items quickly. Cache contains a complete
        copy of src. */
      name: 'cache',
    },
    {
      name: 'delegate',
      forwards: [ 'find', 'select' ], // don't forward put/remove/removeAll
      expression: function(src, cache) {
        // Preload src into cache, then proxy everything to cache that we
        // don't override explicitly.
        return this.PreloadDAO.create({ delegate: cache, src: src });
      }
    },
    {
      name: 'model',
      expression: function(delegate, src) {
        return src.model || cache.model;
      }
    }
  ],

  methods: [
    function put(obj) {
      var self = this;
      return self.src.put(obj).then(
        function(obj) { return self.delegate.put(obj); }
      );
    },

    function remove(obj) {
      var self = this;
      return self.src.remove(obj).then(
        function(obj) { return self.delegate.remove(obj)
          .catch(function() {}); // don't fail on double remove
        }
      );
    },

    function removeAll(skip, limit, order, predicate) {
      var self = this;
      return self.src.removeAll(skip, limit, order, predicate).then(
        function(obj) {
          return self.delegate.removeAll(skip, limit, order, predicate);
        }
      );
    },
  ],

  listeners: [
    function onSrcPut(s, on, put, obj) {
      this.cache.put(obj);
    },

    function onSrcRemove(s, on, remove, obj) {
      this.cache.remove(obj);
    },

    function onSrcReset() {
      // TODO: Should this removeAll from the cache?
    }
  ]
});



//   extends: 'foam.dao.PromisedDAO',

//   classes: [
//     {
//       name: 'InnerCachingDAO',
//       extends: 'foam.dao.AbstractDAO',
//       properties: [
//         {
//           class: 'Proxy',
//           of: 'foam.dao.DAO',
//           name: 'src',
//           forwards: [ 'put', 'remove', 'removeAll' ],
//           postSet: function(old, src) {
//             if ( old ) {
//               old.on.put.unsub(this.onPut);
//               old.on.remove.unsub(this.onRemove);
//               old.on.reset.unsub(this.onReset);
//             }
//             src.on.put.sub(this.onPut);
//             src.on.remove.sub(this.onRemove);
//             src.on.reset.sub(this.onReset);
//           }
//         },
//         {
//           class: 'Proxy',
//           of: 'foam.dao.DAO',
//           name: 'cache',
//           topics: [ 'on' ],
//           forwards: [ 'find', 'select' ]
//         }
//       ],
//       listeners: [
//         function onPut(s, on, put, obj) {
//           this.cache.put(obj);
//         },
//         function onRemove(s, on, remove, obj) {
//           this.cache.remove(obj);
//         },
//         function onReset() {
//           // TODO: Should this removeAll from the cache?
//         }
//       ]
//     }
//   ],

//   properties: [
//     {
//       name: 'src',
//       required: true
//     },
//     {
//       name: 'cache',
//       required: true
//     },
//     {
//       name: 'promise',
//       factory: function() {
//         var self = this;
//         return new Promise(function(resolve, reject) {
//           var cache = self.cache;
//           var src = self.src;

//           // First load the src into the cache
//           src.select(cache).then(function() {
//             // read and writes to the appropriate dao
//             resolve(self.InnerCachingDAO.create({
//               src: src,
//               cache: cache
//             }));
//           });
//         });
//       }
//     }
//   ]
// });

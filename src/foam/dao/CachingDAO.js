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
  CachingDAO will do all queries from its fast delegate (cache). Writes
  are sent through to the src, which will eventually update the cache.
  The cache maintains full copy of the src, but the src is the source
  of truth.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'CachingDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.PromisedDAO'
  ],

  properties: [
    {
      /** The source DAO on which to add caching. Writes go straight
        to the src, and cache is updated to match.
      */
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'src',
      topics: [],
      forwards: [ ], //'put', 'remove', 'removeAll' ],
      postSet: function(old, src) {
        // FUTURE: clean up this listener swap, forward methods directly
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
      /** Read operations and notifications go to the cache, waiting
        for the cache to preload the complete src state. 'Unforward'
        ProxyDAO's default forwarding of put/remove/removeAll. */
      name: 'delegate',
      forwards: [ 'find', 'select' ],
      expression: function(src, cache) {
        // Preload src into cache, then proxy everything to cache that we
        // don't override explicitly.
        var self = this;
        var cacheFilled = cache.removeAll().then(function() {
          // First clear cache, then load the src into the cache
          return src.select(cache).then(function() {
            return cache;
          });
        });
        // The PromisedDAO resolves as our delegate when the cache is ready to use
        return this.PromisedDAO.create({
          promise: cacheFilled
        });
      }
    },
  ],
  
  methods: [
    function put(o) {
      var self = this;
      return self.delegate.put(o).then(function() {
        return self.src.put(o);
      })
    },
    function remove(o) {
      var self = this;
      return self.delegate.remove(o).then(function() {
        return self.src.remove(o);
      })
    }, 
    function removeAll(a, b, c, d, e, f) {
      var self = this;
      return self.delegate.removeAll(a, b, c, d, e, f).then(function() {
        return self.src.removeAll(a, b, c, d, e, f);
      })
    }

  ],

  listeners: [
    function onSrcPut(s, on, put, obj) {
      this.delegate.put(obj);
    },

    function onSrcRemove(s, on, remove, obj) {
      this.delegate.remove(obj);
    },

    function onSrcReset() {
      // TODO: Should this removeAll from the cache?
    }
  ]
});



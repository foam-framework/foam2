/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/**
  LazyCacheDAO can cache successful results from find() and select() on its
  delegate. It only updates after new queries come in, and returns cached
  results immediately, even if new results arrive from the delegate.
  listen or pipe from this DAO to stay up to date.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'LazyCacheDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'foam.dao.ArraySink' ],

  properties: [
    {
      /** Set to the desired cache, such as a foam.dao.MDAO. */
      name: 'cache',
      required: true
    },
    {
      /**
        TODO: This is attempting to express a link between two other properties,
        and a side-effect (subscription) is what is desired, not a value. Also
        the cacheSync_ prop needs to be tickled to ensure the link exists.
        Change this to define an expression that defines a run-time 'thing'
        to be done between properties, and allows cleanup when re-evaluating.
        @private
      */
      name: 'cacheSync_',
      expression: function(delegate, cache) {
        var s = this.cacheSyncSub_ = delegate.on.remove.sub(
          function(sub_, on_, remove_, obj) {
            cache.remove(obj);
          }
        );
        return s;
      }
    },
    {
      /** Stores cleanup info for the cache sychronization subscription.
        @private */
      name: 'cacheSyncSub_',
      postSet: function(old, nu) {
        if ( old && old.detach ) old.detach();
      }
    },
    {
      /**
        When true, makes a network call in the background to
        update the record, even on a cache hit.
      */
      class: 'Boolean',
      name: 'refreshOnCacheHit',
      value: false,
    },
    {
      /**
        Whether to populate the cache on select().
      */
      class: 'Boolean',
      name: 'cacheOnSelect',
      value: false
    },
    {
      /**
        Time in milliseconds before we consider the delegate
        results to be stale for a particular predicate and will issue a new
        select.
      */
      class: 'Int',
      name: 'staleTimeout',
      value: 500,
      //units: 'ms',
    },
    {
      /**
        The active promises for remote finds in progress, for re-use
        by subsequent finds made before the previous resolves.
        @private
      */
      name: 'finds_',
      hidden: true,
      transient: true,
      factory: function() { return {}; }
    },
    {
      /**
        The active promises for remote selects in progress, for re-use
        by subsequent selects made before the previous resolves.
        @private
      */
      name: 'selects_',
      hidden: true,
      transient: true,
      factory: function() { return {}; }
    },
    {
      /**
        Generates an internal key to uniquely identify a select.
        @private
      */
      class: 'Function',
      name: 'selectKey',
      value: function(sink, skip, limit, order, predicate /*string*/) {
        return ( predicate && predicate.toString() ) || "" + "," +
          limit + "," + skip + "," + ( order && order.toString() ) || "";
      }
    }
  ],

  methods: [
    /** Ensures removal from both cache and delegate before resolving. */
    function remove(obj) {
      var self = this;
      return self.cache.remove(obj).then(function() {
        return self.delegate.remove(obj);
      });
    },

    /**
      Executes the find on the cache first, and if it fails triggers an
      update from the delegate.
    */
    function find(id) {
      var self = this;
      // TODO: Express this better.
      // Assigning to unused variable to keep Closure happy.
      var _ = self.cacheSync_; // ensures listeners are set
      // TODO: stale timeout on find?

      // Check the in-flight remote finds_
      if ( self.finds_[id] ) {
        // Attach myself if there's one for this id, since the cache must
        // have already failed
        return self.finds_[id];
      } else {
        // Try the cache
        return self.cache.find(id).then(

          function (val) {
            // Cache hit, but create background request if required
            if ( self.refreshOnCacheHit ) {
              // Don't record in finds_, since we don't want anyone waiting for it
              self.delegate.find(id).then(function (val) {
                self.cache.put(val);
              });
            }
            return val;
          },

          function (err) {
            // Failed to find in cache, so try remote.
            // Another request may have come in the meantime, so check again for
            // an in-flight find for this ID.
            if ( ! self.finds_[id] ) {
              self.finds_[id] = self.delegate.find(id);
              // we created the remote request, so clean up finds_ later
              var errorHandler = function(err) {
                delete self.finds_[id]; // in error case, still clean up
                return Promise.reject(err);
              };
              return self.finds_[id].then(function (val) {
                // once the cache is updated, remove this stale promise
                return self.cache.put(val).then(function(val) {
                  delete self.finds_[id];
                  return val;
                }, errorHandler);
              }, errorHandler);
            } else {
              // piggyback on an existing update request, cleanup already handled
              return self.finds_[id];
            }
          }
        );
      }
    },

    /**
      Executes the select on the cache first, and if it fails triggers an
      update from the delegate.
      <p>
      If .cacheOnSelect is false, the select()
      bypasses the cache and goes directly to the delegate.
    */
    function select(sink, skip, limit, order, predicate) {
      if ( ! this.cacheOnSelect ) {
        return this.SUPER(sink, skip, limit, order, predicate);
      }
      sink = sink || this.ArraySink.create();
      var key = this.selectKey(sink, skip, limit, order, predicate);
      var self = this;
      // Assigning to unused variable to keep Closure happy.
      // TODO: Express this better.
      var _ = self.cacheSync_; // Ensures listeners are set.

      // Check for missing or stale remote request. If needed, immediately
      // start a new one that will trigger a reset of this when complete.
      // TODO: Entries are retained for every query, never deleted. Is that ok?
      var entry = self.selects_[key];
      if ( ! entry || ( Date.now() - entry.time ) > self.staleTimeout ) {
        self.selects_[key] = entry = {
          time: Date.now(),
          promise:
            self.delegate.select(self.cache, skip, limit, order, predicate)
              .then(function(cache) {
                self.pub('on', 'reset');
                return cache;
              })
        }
      }

      function readFromCache() {
        return self.cache.select(sink, skip, limit, order, predicate);
      }

      // If anything exists in the cache for this query, return it (updates
      // may arrive later and trigger a reset notification). If nothing,
      // wait on the pending cache update.
      return self.cache.select(this.COUNT(), skip, limit, order, predicate)
        .then(function(c) {
          if ( c.count > 0 ) {
            return readFromCache();
          } else {
            return entry.promise.then(readFromCache);
          }
        });
    }
  ]
});

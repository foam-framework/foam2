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

/**
  CachingDAO will do all queries from its fast cache. Writes
  are sent through to the src and cached before resolving any put() or
  remove().
  <p>
  You can use a foam.dao.EasyDAO with caching:true to use caching
  automatically with an indexed MDAO cache.
  <p>
  The cache maintains full copy of the src, but the src is considered the
  source of truth.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'CachingDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.PromisedDAO',
    'foam.dao.PurgeRecordCmd',
    'foam.dao.QuickSink'
  ],

  constants: [
    {
      name: 'PURGE',
      value: 'PURGE'
    }
  ],

  properties: [
    {
      /** The source DAO on which to add caching. Writes go straight
        to the src, and cache is updated to match.
      */
      class: 'foam.dao.DAOProperty',
      name: 'src'
    },
    {
      /** The cache to read items quickly. Cache contains a complete
        copy of src. */
      name: 'cache'
    },
    {
      /**
        Set .cache rather than using delegate directly.
        Read operations and notifications go to the cache, waiting
        for the cache to preload the complete src state. 'Unforward'
        ProxyDAO's default forwarding of put/remove/removeAll.
        @private
      */
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      hidden: true,
      topics: [ 'on' ],
      forwards: [ 'find_', 'select_' ],
      expression: function(src, cache) {
        // Preload src into cache, then proxy everything to cache that we
        // don't override explicitly.
        var self = this;
        var cacheFilled = cache.removeAll().then(function() {
          // First clear cache, then load the src into the cache
          return src.select(self.DAOSink.create({dao: cache})).then(function() {
            return cache;
          });
        });
        // The PromisedDAO resolves as our delegate when the cache is ready to use
        return this.PromisedDAO.create({
          promise: cacheFilled
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var proxy = this.src$proxy;
      proxy.listen(this.QuickSink.create({
        putFn: this.onSrcPut,
        removeFn: this.onSrcRemove,
        resetFn: this.onSrcReset
      }));
    },

    /** Puts are sent to the cache and to the source, ensuring both
      are up to date. */
    function put_(x, o) {
      var self = this;
      // ensure the returned object from src is cached.
      return self.src.put(o).then(function(srcObj) {
        return self.delegate.put_(x, srcObj);
      });
    },

    /** Removes are sent to the cache and to the source, ensuring both
      are up to date. */
    function remove_(x, o) {
      var self = this;
      return self.src.remove(o).then(function() {
        return self.delegate.remove_(x, o);
      });
    },
    /** removeAll is executed on the cache and the source, ensuring both
      are up to date. */
    function removeAll_(x, skip, limit, order, predicate) {
      var self = this;
      return self.src.removeAll_(x, skip, limit, order, predicate).then(function() {
        return self.delegate.removeAll_(x, skip, limit, order, predicate);
      });
    },

    function cmd_(x, obj) {
      if ( obj == this.PURGE ) {
        this.cache.removeAll();
        delete this.private_['delegate'];
      }
      else if ( this.PurgeRecordCmd.isInstance(obj) ) {
        delete this.cache[obj.id];
      }
      else {
        this.SUPER(x, obj);
      }
    }
  ],

  listeners: [
    /** Keeps the cache in sync with changes from the source.
      @private */
    function onSrcPut(obj) {
      this.delegate.put(obj);
    },

    /** Keeps the cache in sync with changes from the source.
      @private */
    function onSrcRemove(obj) {
      this.delegate.remove(obj);
    },

    /** Keeps the cache in sync with changes from the source.
      @private */
    function onSrcReset() {
      // TODO: Should this removeAll from the cache?
    }
  ]
});

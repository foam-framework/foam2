/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Time To Live (TTL) Caching DAO only caches find() operations
 * for a limited amount of time.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'TTLCachingDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.PromisedDAO',
    'foam.dao.QuickSink'
  ],

  properties: [
    {
      /** The cache to read items quickly. */
      name: 'cache'
    },
    {
      class: 'Long',
      name: 'purgeTime',
      value: 15000
    },
  ],

  methods: [
    function find_(x, key) {
      var id = this.of.isInstance(key) ? key.id : key;
      var cachedValue = this.cache[id];
      var self = this;

      if ( foam.Undefined.isInstance(cachedValue) ) {
        this.delegate.find_(x, key).then(function(o) {
          self.cache[id] = o;
          return o;
        });
      } else {
        console.log('********************************** CACHED VALUE', id);
        return Promise.resolve(cachedValue);
      }
    },

    /** Puts are sent to the cache and to the source, ensuring both
      are up to date. */
    function put_(x, o) {
      var self = this;
      // ensure the returned object from src is cached.
      return self.delegate.put(o).then(function(srcObj) {
        self.cache[o.id] = srcObj;
        return srcObj;
      });
    },

    function select_(x, sink) {
      var self = this;

      return new Promise(function (resolve, reject) {
        this.delegate.sink(x, sink).then(function(s) {
          if ( foam.dao.ArraySink.isInstance(s) ) {
            var a = s.array;
            for ( var i = 0 ; i < a.length ; i++ ) {
              var o = a[i];
              console.log('***** caching ', o.id);
              self.cache[o.id] = o;
            }
          }
          promise.resolve(s);
        });
      });
    },

    /** Removes are sent to the cache and to the source, ensuring both
      are up to date. */
    function remove_(x, o) {
      var self = this;
      return self.delegate.remove(o).then(function() {
        self.cache.remove(o);
        return o;
      });
    },

    /** removeAll is executed on the cache and the source, ensuring both
      are up to date. */
    function removeAll_(x, skip, limit, order, predicate) {
      var self = this;
      return self.src.removeAll_(x, skip, limit, order, predicate).then(function() {
        self.cache = {};
        return;
      });
    }
  ],

  listeners: [
    {
      name: 'purgeCache',
      isMerged: true,
      mergeDelay: this.purgeTime,
      code: function() {
        this.cache = {};
        this.purgeCache();
      }
    }
  ]
});

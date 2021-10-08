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
    'foam.dao.PurgeRecordCmd',
    'foam.dao.QuickSink'
  ],

  imports: [ 'merged' ],

  constants: [
    {
      name: 'PURGE',
      value: 'PURGE'
    }
  ],

  properties: [
    {
      /** The cache to read items quickly. */
      name: 'cache',
      factory: function() { return {}; }
    },
    {
       class: 'Long',
       name: 'purgeTime',
       documentation: 'Time to wait before purging cache.',
       units: 'ms',
       value: 25000
     },
     {
       name: 'purgeCache',
       transient: true,
       expression: function(purgeTime) {
         return this.merged(() => { this.cache = {};}, purgeTime);
       }
     }
  ],

  methods: [
    function find_(x, key) {
      var id          = this.of.isInstance(key) ? key.id : key;
      var cachedValue = this.cache[id];
      var self        = this;

      if ( foam.Undefined.isInstance(cachedValue) ) {
        return new Promise(function (resolve, reject) {
          self.delegate.find_(x, key).then(function(o) {
            self.cache[id] = o || null;
            // console.log('*************** CACHING ', id, self.cache[id]);
            self.purgeCache();
            resolve(o);
          });
        });
      }

      // console.log('*************** CACHED VALUE', id);
      return Promise.resolve(cachedValue ? cachedValue.clone(x) : null);
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

    function select_(x, sink, skip, limit, order, predicate) {
      var self = this;

      return new Promise(function (resolve, reject) {
        self.delegate.select_(x, sink, skip, limit, order, predicate).then(function(s) {
          if ( foam.dao.ArraySink.isInstance(s) ) {
            var a = s.array;
            for ( var i = 0 ; i < a.length ; i++ ) {
              var o = a[i];
              // console.log('***** caching from select ', o.id);
              self.cache[o.id] = o;
            }
            self.purgeCache();
          }
          resolve(s);
        });
      });
    },

    /** Removes are sent to the cache and to the source, ensuring both
      are up to date. */
    function remove_(x, o) {
      var self = this;
      return self.delegate.remove_(x, o).then(function() {
        delete self.cache[o.id];
        return o;
      });
    },

    /** removeAll is executed on the cache and the source, ensuring both
      are up to date. */
    function removeAll_(x, skip, limit, order, predicate) {
      var self = this;
      return self.delegate.removeAll_(x, skip, limit, order, predicate).then(function() {
        self.cache = {};
      });
    },

    function cmd_(x, obj) {
      if ( obj == this.PURGE ) {
        this.cache = {};
      } 
      else if ( this.PurgeRecordCmd.isInstance(obj) ) {
        delete this.cache[obj.id];
      }
      else {
        this.SUPER(x, obj);
      }
    }
  ]
});

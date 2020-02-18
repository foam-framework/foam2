/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Time To Live (TTL) Select Caching DAO only caches select() operations
 * for a limited amount of time.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'TTLSelectCachingDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.PromisedDAO',
    'foam.dao.QuickSink'
  ],

  imports: [ 'merged' ],

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
       class: 'Long',
       name: 'maxCacheSize',
       value: 100
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
    /** Puts are sent to the cache and to the source, ensuring both
      are up to date. */
    function put_(x, o) {
      this.cache = {};
      return this.delegate.put_(x, o);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      if ( foam.dao.AnonymousSink.isInstance(sink) )
        return this.SUPER(x, sink, skip, limit, order, predicate);

      var self = this;
      var key  = [sink, skip, limit, order, predicate].toString();

      if ( this.cache[key] ) {
        // console.log('************************ CACHED: ', key);
        return Promise.resolve(this.cache[key]);
      }

      return new Promise(function (resolve, reject) {
        self.delegate.select_(x, sink, skip, limit, order, predicate).then(function(s) {
          self.cache[key] = s;
//          console.log('************************ CACHING: ', key);
          // TODO: check if cache is > maxCacheSize and remove oldest entry if it is
          self.purgeCache();
          resolve(s);
        });
      });
    },

    /** Removes are sent to the cache and to the source, ensuring both
      are up to date. */
    function remove_(x, o) {
      this.cache = {};
      return this.delegate.remove_(x, o);
    },

    /** removeAll is executed on the cache and the source, ensuring both
      are up to date. */
    function removeAll_(x, skip, limit, order, predicate) {
      this.cache = {};
      this.delegate.removeAll_(x, skip, limit, order, predicate);
    },

    function cmd_(x, obj) {
      if ( obj == this.PURGE ) {
        this.cache = {};
      } else {
        this.SUPER(x, obj);
      }
    }
  ]
});

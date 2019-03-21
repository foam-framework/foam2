/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'LRUCachingDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: `
   Least Recently Used CachingDAO :
   Manages a DAO\'s size by removing old items. Commonly applied inside a cache to limit the cache\'s size. Item freshness is tracked in a separate DAO.
   `,

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.MDAO',
    'foam.dao.QuickSink'
  ],

  classes: [
    {
      /** Links an object id to a last-accessed timestamp */
      name: 'LRUCacheItem',
      properties: [
        {
          name: 'id',
        },
        {
          class: 'Int',
          name: 'timestamp'
        }
      ]
    }
  ],

  properties: [
    {
      /** The maximum size to allow the target dao to be. */
      class: 'Int',
      name: 'maxSize',
      value: 100
    },
    {
      /** Tracks the age of items in the target dao. */
      name: 'trackingDAO',
      factory: function() {
        return this.MDAO.create({ of: this.LRUCacheItem });
      }
    },
    {
      /** The DAO to manage. Items will be removed from this DAO as needed. */
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      /** By starting at the current time, this should always be higher
        than previously stored timestamps. (only relevant if trackingDAO
        is persisted.) */
      class: 'Int',
      name: 'lastTimeUsed_',
      factory: function() { return Date.now(); }
    },
    {
      /** The source DAO on which to add caching. Writes go straight
        to the src, and cache is updated to match.
      */
      class: 'foam.dao.DAOProperty',
      name: 'src'
    },
//    {
//      class: 'Proxy',
//      of: 'foam.dao.DAO',
//      name: 'delegate',
//      hidden: true,
//      topics: [ 'on' ],
//      forwards: [ 'find', 'select_', 'put_', 'find_' ],
//      expression: function(src, dao) {
//        console.log("caching");
//
//        return src;
//      }
//    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      self.delegate = this.src;
      self.delegate.find('abc');

      var proxy = this.dao$proxy;
//      proxy.sub('on', 'put',    this.onPut);
//      proxy.sub('on', 'remove', this.onRemove);
//      proxy.sub('on', 'reset',  this.onReset);
//      proxy.sub('on', 'find',   this.onFind);

        proxy.listen(this.QuickSink.create({
          //putFn: this.onPut
          putFn: function(obj) {
           console.log("ddddd");
          },
          removeFn: this.onRemove,
          resetFn: this.onReset,
          findFn:  this.onFind,
        }));
    },

    /** Calculates a timestamp to use in the tracking dao. */
    function getTimestamp() {
      // Just increment on each request.
      return this.lastTimeUsed_++;
    },

    /** to keep the dao size. */
    function cleanup() {
      var self = this;
      self.trackingDAO
        .orderBy(this.DESC(self.LRUCacheItem.TIMESTAMP))
        .skip(self.maxSize)
        .select({
          put: function(obj) {
            self.dao.remove(obj);
          }
        });
    },

    function put_(x, o) {
      var self = this;
      console.log("put_");
      //return self.delegate.put(o);

      // ensure the returned object from src is cached.
//      return self.src.put(o).then(function(srcObj) {
//        return self.delegate.put_(x, srcObj);
//      });
    },

    /** Find : go through cache first, if found, return. if no found
        then go through original DAO if found, put to cache, if no found, put Null to cache
        Finally, update TimeStamp on Cache
     */
//    function find_(x, o) {
//    console.log("find");
//      var self = this;
//      // ensure the returned object from src is cached.
//
//      return this.trackingDAO.find(id).then(function(trackingObj) {
//        if ( trackingObj ) {
//          return trackingObj;
//        } else {
//          return this.dao.find(id).then(function(daoObj) {
//            if ( daoObj ) {
//              this.trackingDAO.put(daoObj);
//              return daoObj;
//            } else {
//              //this.trackingDAO.put(null);
//              return
//            }
//          })
//        }
//      })
//    }

      function find(id) {
        console.log("1111 find_");
      },

      function find_(x, id) {
      console.log("find_2222222");
        var self = this;
        return self.dao.find_(x, id).then(function(o) {
          return o || self.delegate.find_(x, id).then(function(o) {
            return o ? self.dao.put_(x, o) : null
          })
        })
      }
  ],

  listeners: [
    /** Adds the put() item to the tracking dao, runs cleanup() to check the dao size. */
    function onPut(obj) { //s, on, put, obj
    console.log("onPut");

      var self = this;
      //self.delegate.put(obj);
      this.trackingDAO.put(
        this.LRUCacheItem.create({
          id: obj.id,
          timestamp: self.getTimestamp()
        })
      ).then(function() {
        self.cleanup();
      });

//      this.trackingDAO.select().then(function(tCount) {
//       console.log("tCount : " + tCount.array.length);
//      });

//      self.delegate.put(obj);
//
//      self.delegate.select().then(function(dCount) {
//       console.log("dCount : " + dCount.array.length);
//      });
    },

    /** Clears the remove()'d item from the trackingDAO. */
    function onRemove(s, on, remove, obj) {
      // ensure tracking DAO is cleaned up
      this.trackingDAO.remove(obj);
    },

    /** On reset, clear the trackingDAO. */
    function onReset(s, on, reset, obj) {
      this.trackingDAO.removeAll(obj);
    },

    /** On fine, find() from the trackingDAO. */
    function onFind(obj) {
    console.log("onFind : ");
      //this.delegate.find(id);
    }
  ]
});
